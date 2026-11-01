# Custom domain for the Ambition site (saved for later)

## Context
The site is live at https://frusohche.github.io (GitHub Pages, repo `frusohche/frusohche.github.io`). Fru-Soh wants a real brand link instead, but isn't buying one yet. They asked to plan it now and save it for later. They chose a **brand-style** name ("Ambition").

**Status:** saved for later. Nothing is bought or configured yet. When a domain is bought, ask Claude to "connect my domain" and it will follow steps 4–5.

## 1. Pick and buy the domain (Fru-Soh does this; about $10–15/yr)
- Candidates, in order of preference:
  - ambition.build
  - buildwithambition.com
  - ambitionbuilds.com
  - madewithambition.com
  - ambition.dev

  None of these has been checked for availability. Short "ambition" names are often taken.
- Recommended registrar: **Cloudflare Registrar**. It charges at-cost renewals and includes free DNS. Porkbun or Namecheap also work.
- Prefer a `.com` or `.build`/`.dev` name. Avoid cheap first-year deals with expensive renewals.

## 2. Verify the domain on GitHub (stops domain takeover)
GitHub → Settings → Pages → **Add a verified domain**, then add the TXT record it gives (`_github-pages-challenge-frusohche`) at the registrar.

## 3. DNS records (at the registrar)
| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
| CNAME | www | frusohche.github.io |

On Cloudflare, set these records to **DNS only** (grey cloud) so GitHub can issue the HTTPS certificate.

## 4. Repo changes (Claude does these)
- Add a `CNAME` file at the repo root containing just the domain, for example `ambition.build`.
- Update README.md: list the live URL and keep the DNS table for reference.
- Check that nothing hard-codes `frusohche.github.io`: search index.html, projects.json and README.md. No changes are expected, since every path is relative.
- No changes are needed to the nightly jobs. `.github/workflows/daily-sync.yml` commits only `activity.json`, and the Claude routine `trig_01TpbrXetTqADWejYTQMK2Wd` pushes only `activity.json` and `log.json`, so neither touches `CNAME`.
- Commit and push after Fru-Soh says yes.

## 5. Turn it on in GitHub
Repo → Settings → Pages → Custom domain: enter the domain and save. Wait for the DNS check to pass and the certificate to be issued, usually minutes and up to 24 hours. Then tick **Enforce HTTPS**.

## Verification
- Check DNS: `nslookup <domain>` returns the four 185.199.x.153 addresses.
- Check redirects: `curl -I https://<domain>` returns 200, and `curl -I https://frusohche.github.io` returns a 301 to the new domain.
- Open the site in the browser pane. Confirm that projects, the This week section and the Build log load, and the padlock shows HTTPS.
- After the next 11:30 PM Central routine run, confirm the new log entry appears on the custom domain.
