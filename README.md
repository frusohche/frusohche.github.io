# Ambition — personal site

Home base for everything I build. All content lives in **`projects.json`**; `index.html` reads it and renders the page.

## Run it locally

```bash
node serve.mjs
```

Then open http://localhost:3000. (Opening `index.html` directly as a file won't load `projects.json`.)

## Edit your info

In `projects.json` → `profile`: `name`, `tagline`, `now` (what you're working on), `about` (paragraphs), `links` (contact buttons).

## Add a project

Add an entry to the `projects` list:

```json
{
  "name": "My New Thing",
  "status": "live",
  "year": 2026,
  "description": "One or two sentences on what it does.",
  "tags": ["Web", "AI"],
  "links": [
    { "label": "Live site", "url": "https://..." },
    { "label": "Code", "url": "https://github.com/..." }
  ],
  "image": "brand_assets/my-new-thing.png",
  "featured": true
}
```

- `status`: `live`, `in-progress`, `idea`, or `archived` — filter buttons appear automatically for the statuses you use.
- `image` is optional; without one the card gets a branded cover with the project's initials.
- `featured: true` pins a project to the front. The rest sort newest first.

## Screenshots

```bash
node screenshot.mjs http://localhost:3000 label
```

Saves to `temporary screenshots/`.

## Custom domain (planned)

The site is at https://frusohche.github.io for now. The steps to move it to a brand domain are in [`DOMAIN-PLAN.md`](DOMAIN-PLAN.md).
