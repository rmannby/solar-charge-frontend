# Solar Charge Frontend

Vue 3 + Vite dashboard för SolarCharge EV-laddningsoptimeraren.

**Live:** https://rmannby.github.io/solar-charge-frontend/  
**Backend API:** https://solarcharge-frontend.rm-eltech.info (Cloudflare Tunnel → localhost:8000)  
**Backend repo:** [SolarCharge](https://github.com/rmannby/SolarCharge)

## Dashboard

Dashboarden visas i två rader med mätvärden:

**Övre rad** (hus och sol):

| Nät | Solkraft | Batteri |
|---|---|---|
| Nätimport/-export (W/kW) | DC PV-produktion (W/kW) | SOC % + laddningsriktning (↑↓/Vila) |

**Undre rad** (billaddning):

| Laddning | Beslut ⚙ | Tillagd Energi |
|---|---|---|
| Aktuell laddeffekt (W/kW) | Optimerarbeslut (A) | Energi denna session (kWh) |

Batterifältet visar SOC med färgkodning (grön→röd) och laddningsriktning som undertext.

## Inställningar

- **Batteri-prioritet** — snabbval [Av] [Balanserat (70 %)] [Huset Först (90 %)] + justerbar Min SOC-dropdown
- **Optimering Aktiv** — toggle
- **Lägsta Laddström** — tvångsladda med minst X A (åsidosätter SOC-låset)
- **Högsta Laddström** — begränsa bilen till max X A (reserverar sol för hussbatteriet)

## Snabbstart (lokal utveckling)

```bash
git clone https://github.com/rmannby/solar-charge-frontend.git
cd solar-charge-frontend
npm install
npm run dev           # http://localhost:5173
npm run dev -- --host # med nätverksåtkomst (mobil/LAN)
```

API-URL väljs automatiskt:
- Localhost/LAN-IP → `http://{hostname}:8000`
- Publik URL (GitHub Pages) → `https://solarcharge-frontend.rm-eltech.info`

## Scripts

| Kommando | Beskrivning |
|---|---|
| `npm run dev` | Starta dev-server |
| `npm run build` | Bygg för produktion (`dist/`) |
| `npm run preview` | Förhandsgranska produktionsbygge |

## Teknikstack

- **Vue 3** med Composition API + `<script setup>`
- **Vite** med HMR
- **Tailwind CSS** (dark theme)
- **Axios** för API-anrop
- **vite-svg-loader** för SVG-ikoner som Vue-komponenter
- **VitePWA** för Progressive Web App-stöd

## Deployment

GitHub Pages via GitHub Actions — triggas automatiskt vid push till `main`:

```bash
git push origin main   # startar deploy automatiskt
```

## Struktur

```
src/
├── App.vue            # Hela dashboarden (SPA)
├── main.js            # Bootstrap
├── api/client.js      # Axios-instans med dynamisk API-URL
└── assets/            # SVG-ikoner
```
