# Future Works Recruitment (أعمال المستقبل للاستقدام)
Static bilingual (AR/EN) website + internal admin dashboard. No build step.
Cloudflare Pages: framework preset "None", output directory "/".

## Files
- index.html, style.css, app.js: public site (scroll animations, stats, WhatsApp form).
- admin.html, admin.css, admin.js: internal dashboard (requests, clients, status board, WhatsApp replies).
- api.js: data layer. Set API_BASE to a real backend (Cloudflare Worker + D1, or Odoo) to replace the demo data. Endpoints are documented at the top of the file.
- data.js: demo data only. Delete when a backend is connected.

## Before launch
- Set WA_NUMBER in app.js. Replace phone, email, license no., CR no., logo.
- Admin page is public on GitHub Pages and holds only demo data. Do NOT store real client data until a backend exists and the page sits behind login (e.g. Cloudflare Access).
- Photos in /img are AI-generated placeholders; replace with licensed or real photos for launch.
