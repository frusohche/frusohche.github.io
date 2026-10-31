// Nightly GitHub activity sync: reads each project's `repo` from projects.json
// and writes activity.json (dates + commit counts). Private repos contribute
// numbers only — never names, descriptions, messages or links.
//
// Env: SYNC_TOKEN (fine-grained PAT that can read private repos) or GITHUB_TOKEN.
//      ONLY_AT_HOUR=23 → exit unless it's that hour in Chicago (scheduled runs).
import { readFile, writeFile } from 'node:fs/promises';

const TZ = 'America/Chicago';
const token = process.env.SYNC_TOKEN || process.env.GITHUB_TOKEN;
const chicagoDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(d)); // YYYY-MM-DD
const chicagoHour = () => Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));

if (process.env.ONLY_AT_HOUR && chicagoHour() !== Number(process.env.ONLY_AT_HOUR)) {
  console.log(`Not ${process.env.ONLY_AT_HOUR}:00 in Chicago yet — skipping.`);
  process.exit(0);
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (res.status === 404 || res.status === 403 || res.status === 409) return null; // no access, or empty repo
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

const { projects } = JSON.parse(await readFile('projects.json', 'utf8'));
let prev = {};
try { prev = JSON.parse(await readFile('activity.json', 'utf8')).projects ?? {}; } catch {}
const today = chicagoDate(Date.now());
const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
const out = {};

for (const p of projects) {
  if (!p.repo) continue;
  const repo = await gh(`/repos/${p.repo}`);
  if (!repo) {
    // Keep last known numbers rather than wiping them (e.g. private repo without SYNC_TOKEN)
    if (prev[p.name]) out[p.name] = prev[p.name];
    console.log(`${p.name}: no access to ${p.repo} — kept previous values`);
    continue;
  }

  const latest = await gh(`/repos/${p.repo}/commits?per_page=1`);
  const week = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await gh(`/repos/${p.repo}/commits?since=${weekAgo}&per_page=100&page=${page}`);
    if (!batch?.length) break;
    week.push(...batch);
    if (batch.length < 100) break;
  }

  out[p.name] = {
    lastActive: latest?.[0]?.commit?.committer?.date ?? null,
    commitsToday: week.filter((c) => chicagoDate(c.commit.committer.date) === today).length,
    commitsWeek: week.length,
    ...(!repo.private && { url: repo.html_url }),
  };
  console.log(`${p.name}: ${out[p.name].commitsWeek} commits this week, ${out[p.name].commitsToday} today`);
}

// Only rewrite when the numbers changed, so quiet days don't create commits
if (JSON.stringify(prev) === JSON.stringify(out)) {
  console.log('No activity changes.');
} else {
  await writeFile('activity.json', JSON.stringify({ updated: new Date().toISOString(), date: today, projects: out }, null, 2) + '\n');
  console.log('activity.json updated.');
}
