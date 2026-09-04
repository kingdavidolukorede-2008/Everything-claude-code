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

## Waitlist

The waitlist form degrades through three backends, in order — the page works
with none of them, so it is safe to deploy before any are wired up.

1. **Artifact store.** When the page runs as a claude.ai Artifact declaring the
   `db` capability, signups are written to the `signups` collection, keyed by
   lowercased email so a repeat signup updates rather than duplicates. A live
   queue count appears in the panel header.
2. **HTTP endpoint.** Set `data-endpoint` on `#wl-form` to a URL that accepts a
   JSON `POST` — Formspree, Basin, a Netlify function, your own handler:

   ```html
   <form class="wl-form" id="wl-form" novalidate
         data-endpoint="https://formspree.io/f/YOUR_ID">
   ```

   The body is `{email, company, team_size, first_job, joined_at, source}`.
   A non-2xx response shows the failure state with the mailto fallback.
3. **Mailto.** With neither of the above, submitting opens the visitor's mail
   client with the details prefilled to `hello@nightshift.work`.

Client-side validation covers email shape and a non-empty company name only —
whatever receives the POST must validate and rate-limit it too.

## Notes

- Light and dark themes are token-driven and cover all three viewer states
  (explicit light, explicit dark, and the un-stamped system default).
- The shift-log panel stays on its deep indigo ground in every theme by design.
- Prices, metrics, slot counts and client names on the page are illustrative
  placeholders.
