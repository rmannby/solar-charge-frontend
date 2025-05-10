# Project Requirements Document: SolarCharge GUI – MVP

**Dokumentversion:** 1.0  
**Datum:** 2025-05-02  
**Författare:** SolarCharge Team (AI Assisterad)

## 1. Introduktion och Syfte
Syftet med detta dokument är att specificera kraven för en Minimum Viable Product (MVP) av ett grafiskt användargränssnitt (GUI) för SolarCharge-optimeringsapplikationen.

GUI-applikationen ska:
- Tillhandahålla en enkel överblick av systemets status och nyckelvärden i realtid.
- Möjliggöra grundläggande manuell kontroll över laddningsläget.
- Visa de senaste logghändelserna för felsökning och insyn.
- Interagera med den befintliga SolarCharge-kärnlogiken via ett internt API.
- Använda FastAPI för backend och Vue.js för frontend.

**Obs:** Denna MVP fokuserar på grundläggande funktionalitet för visualisering och kontroll. Avancerade funktioner och designförbättringar sparas till senare iterationer.

## 2. Mål för GUI MVP
- **M-GUI-2.1:** Visa aktuell driftstatus för SolarCharge-systemet (t.ex. "Optimerar", "Maxladdning", "Pausad", "Väntar", "Fel").
- **M-GUI-2.2:** Visa realtidsvärden för Nettoeffekt (P_han) och aktuell Laddeffekt (P_ladd).
- **M-GUI-2.3:** Visa den av optimeringslogiken uppskattade satta laddströmmen (State).
- **M-GUI-2.4:** Tillhandahålla knappar för att manuellt kunna:
  - Aktivera Maxladdning (pausa optimering)
  - Återgå till Automatisk optimering
  - Tvinga Stopp av laddning
- **M-GUI-2.5:** Visa ett begränsat antal av de senaste loggmeddelandena från kärnapplikationen.
- **M-GUI-2.6:** Kommunicera tillförlitligt med kärnapplikationens API för att hämta data och skicka kommandon.
- **M-GUI-2.7:** Köra som en separat webbapplikation (FastAPI + Vue) på samma Raspberry Pi som kärnlogiken.

## 3. Icke-Mål för GUI MVP
Detta ingår inte i GUI MVP:
- **IM-GUI-3.1:** Avancerade grafer eller historisk datavisualisering.
- **IM-GUI-3.2:** Möjlighet att ändra konfigurationsparametrar (t.ex. hysteres, smoothing) via GUI:t.
- **IM-GUI-3.3:** Detaljerad felhantering eller användarvänliga felmeddelanden i GUI:t (utöver att visa loggar).
- **IM-GUI-3.4:** Stöd för flera användare eller autentisering i GUI:t.
- **IM-GUI-3.5:** Avancerad design eller anpassning av utseendet.
- **IM-GUI-3.6:** Visning av solproduktion (P_sol) - kan läggas till senare om API:et stödjer det.

## 4. Användarprofil
Primär användare är systemägaren/utvecklaren som vill ha en enkel visuell överblick och grundläggande kontrollmöjligheter via en webbläsare i det lokala nätverket.

## 5. Funktionella Krav (GUI MVP Scope)

### FK-GUI-5.1: API-Interaktion (Backend - FastAPI)

| Delkrav | Beskrivning |
|---------|-------------|
| FK-GUI-5.1.1 | GUI-backend ska periodiskt (t.ex. var 5-10 sekund) anropa kärnlogikens /api/status-endpoint för att hämta senaste data (Status, P_han, P_ladd, State, ev. loggar). |
| FK-GUI-5.1.2 | GUI-backend ska tillhandahålla egna API-endpoints (t.ex. /gui/data) som frontend (Vue) kan anropa för att få den senast hämtade datan från kärnlogiken. Användning av WebSockets/SSE kan övervägas senare. |
| FK-GUI-5.1.3 | GUI-backend ska tillhandahålla endpoints (t.ex. /gui/set_mode/manual_max, /gui/set_mode/auto, /gui/set_mode/stop) som frontend anropar när användaren klickar på kontrollknapparna. |
| FK-GUI-5.1.4 | När en kontroll-endpoint i GUI-backend anropas, ska den i sin tur anropa motsvarande kommando-endpoint i kärnlogikens API (t.ex. /api/set_mode/manual_max). |
| FK-GUI-5.1.5 | Hantera grundläggande fel vid kommunikation med kärnlogikens API (t.ex. logga felet, indikera problem i GUI). |

**Obs:** Detta förutsätter att kärnlogiken utökas med ett internt API (t.ex. /api/status, /api/set_mode/...).

### FK-GUI-5.2: Datavisualisering (Frontend - Vue.js)

| Delkrav | Beskrivning |
|---------|-------------|
| FK-GUI-5.2.1 | Visa aktuell driftstatus (text, t.ex. "Optimerar", "Maxladdning", "Pausad") tydligt på sidan. |
| FK-GUI-5.2.2 | Visa aktuellt värde för Nettoeffekt (P_han) i Watt, med indikation om import/export (t.ex. färg eller text). |
| FK-GUI-5.2.3 | Visa aktuellt värde för Laddeffekt (P_ladd, den rapporterade) i Watt. |
| FK-GUI-5.2.4 | Visa aktuellt värde för Uppskattad satt ström (State) i Ampere. |
| FK-GUI-5.2.5 | Värdena ska uppdateras automatiskt med jämna mellanrum (synkroniserat med FK-GUI-5.1.1/5.1.2) utan att sidan behöver laddas om manuellt. |

### FK-GUI-5.3: Kontroller (Frontend - Vue.js)

| Delkrav | Beskrivning |
|---------|-------------|
| FK-GUI-5.3.1 | En knapp "Maxladdning" ska finnas. Vid klick ska frontend anropa motsvarande endpoint i GUI-backend (som i sin tur anropar kärnlogikens API för att pausa optimering/sätta max ström). |
| FK-GUI-5.3.2 | En knapp "Automatisk" ska finnas. Vid klick ska frontend anropa motsvarande endpoint i GUI-backend (som i sin tur anropar kärnlogikens API för att återgå till optimeringsläge). |
| FK-GUI-5.3.3 | En knapp "Stopp" ska finnas. Vid klick ska frontend anropa motsvarande endpoint i GUI-backend (som i sin tur anropar kärnlogikens API för att sätta laddström till 0A / pausa). |
| FK-GUI-5.3.4 | Knapparna kan eventuellt inaktiveras/ändra utseende beroende på aktuell status (t.ex. "Stopp" är bara meningsfull om laddning pågår). |

### FK-GUI-5.4: Loggvisning (Frontend - Vue.js)

| Delkrav | Beskrivning |
|---------|-------------|
| FK-GUI-5.4.1 | Ett enkelt textområde eller lista ska visa de X (t.ex. 10-20) senaste loggmeddelandena som hämtats från kärnlogikens API (via GUI-backend). |
| FK-GUI-5.4.2 | Loggvisningen ska uppdateras periodiskt tillsammans med övrig data. Nya meddelanden ska visas överst (eller underst, konsekvent). Endast grundläggande formatering krävs. |

## 6. Tekniska Ramverk och Arkitektur
- Backend: Python med FastAPI
- Frontend: JavaScript med Vue.js (t.ex. via CDN eller byggverktyg som Vite)
- Kommunikation Frontend <-> Backend: Standard HTTP-anrop (Fetch API / Axios). Realtidsuppdatering via polling initialt.
- Kommunikation GUI Backend <-> Kärnlogik: HTTP-anrop till kärnlogikens interna API
- Arkitektur: Två separata processer (en för kärnlogiken med dess API, en för GUI-webbservern) som körs på samma Raspberry Pi

## 7. Framgångskriterier (GUI MVP)
- **SK-GUI-7.1:** GUI-webbsidan kan visas korrekt i en modern webbläsare på det lokala nätverket.
- **SK-GUI-7.2:** Status, Nettoeffekt, Laddeffekt och Satt ström visas och uppdateras periodiskt i GUI:t med data från kärnlogiken.
- **SK-GUI-7.3:** Klick på knapparna "Maxladdning", "Automatisk" och "Stopp" i GUI:t resulterar i att motsvarande åtgärd utförs av kärnlogiken (verifieras via loggar eller observerat beteende).
- **SK-GUI-7.4:** De senaste loggmeddelandena från kärnlogiken visas i GUI:t.
- **SK-GUI-7.5:** Både GUI-processen och kärnlogik-processen kör stabilt samtidigt.

## 8. Framtida Utveckling (Post-MVP GUI)
- Förbättrad design och layout
- Grafisk visualisering av effektdata över tid (t.ex. med Chart.js)
- Visning av fler värden (P_sol, energiförbrukning etc.)
- Mer avancerad loggfiltrering/sökning
- Realtidsuppdateringar med WebSockets eller Server-Sent Events (SSE)
- Möjlighet att se/ändra konfigurationsparametrar

*Detta dokument specificerar en grundläggande men funktionell första version av GUI:t. Fokus ligger på att få kommunikationen och de viktigaste funktionerna på plats.*