# Nightshift — landing page

Marketing site for **Nightshift**, an AI automation studio for small service
businesses: quote follow-ups, inbox triage, invoice chasing, intake and booking,
CRM hygiene and job packs, run unattended overnight inside the client's own tools.

Single self-contained `index.html` — no build step, no dependencies. Fonts come
from Google Fonts; everything else ships in the file.

```
nightshift/index.html   tokens → layout → sections, inline CSS and the header clock
```

## Running it

```bash
python3 -m http.server 8000   # then open http://localhost:8000/nightshift/
```

Deploys as-is to GitHub Pages, Netlify, Vercel or any static host.

## Notes

- Light and dark themes are token-driven and cover all three viewer states
  (explicit light, explicit dark, and the un-stamped system default).
- The shift-log panel stays on its deep indigo ground in every theme by design.
- Prices, metrics and client names on the page are illustrative placeholders.
