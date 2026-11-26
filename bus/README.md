# تتبع الباصات (Bus Tracker) - Phase 1 demo

Mobile-first PWA (Arabic, RTL). Static front-end, demo data only. No API keys.

- Drivers: login, "استلام الباص" starts an 8h shift timer, "تسليم الباص" ends it. Time past 8h is overtime. Live GPS via the browser, battery via the Battery API (Android Chrome).
- Admin: live map (OSM, Esri streets/satellite/topo, CARTO dark/light via Leaflet), moving/stopped, km, trips, battery. Monthly overtime report per driver, CSV export.
- Installable on Android: manifest + service worker.

## Demo accounts (fake)
`driver1`..`driver6` / `1234`, admin `admin` / `admin123`.

## Phase 1 limits
- Fleet on the admin map is simulated (straight lines between points, sped up). A driver who logs in on the SAME browser shows as a real position.
- Shifts, passwords and location live in the browser (localStorage). Nothing is sent to a server, so a driver's phone and the admin's phone do not see each other yet.
- Login is client-side demo only. It is NOT secure.
## Phase 2 (backend)
Auth (hashed passwords, sessions), a database for drivers/buses/shifts, an endpoint receiving positions + battery every 10-15 s, and live push (WebSocket/SSE) to the admin map. Move the 8h/overtime rule to the server.
