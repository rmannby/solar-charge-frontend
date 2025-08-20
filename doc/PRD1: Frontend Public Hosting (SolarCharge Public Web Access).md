

# **PRD1: Frontend Public Hosting (SolarCharge Public Web Access)**

**Phase:** 1 of 3 \
 **Authority:** Inherits from Meta-PRD (v1.0) \
 **Source Context:** PRD-WebAccess.md


---


## **a. Purpose**

This phase establishes **public hosting of the Vue.js frontend** on GitHub Pages. The backend API is not yet live; instead, placeholders are introduced for integration in later phases.

**Explicitly Out of Scope:**



* Cloudflare Tunnel setup. \

* Secure backend connectivity. \

* End-to-end integration testing. \



---


## **b. In-Scope Features**



1. **Public Hosting (FR1) \
**
    * Build and deploy the Vue.js frontend as a static site on GitHub Pages. \

2. **Correct Asset Paths (FR2) \
**
    * Update `vite.config.js` with `base` property to ensure static assets load correctly from GitHub Pages subdirectory. \

3. **Configurable API Endpoint (FR3 – Placeholder) \
**
    * Introduce `API_BASE_URL_PLACEHOLDER` in frontend code where `axios` requests will later point to backend. \

    * Include deprecation comments noting replacement in PRD2. \

4. **Automated Deployment (FR4) \
**
    * Configure GitHub Actions workflow to automatically deploy to `gh-pages` branch on push to `main`. \



---


## **c. Out-of-Scope Features**



* Any backend changes (FastAPI, tunnels, hostname mappings). \

* Security verification (handled in PRD2/PRD3). \

* End-to-end integration with live backend. \



---


## **d. Placeholders**


```
API_BASE_URL_PLACEHOLDER

 // Placeholder: Replace with SOLARCHARGE_BACKEND_HOSTNAME in PRD2
const API_BASE_URL = "API_BASE_URL_PLACEHOLDER";

```



* 
* Must exist in all axios calls during PRD1. \

* Carry deprecation comments referencing Meta-PRD Replacement Rule. \



---


## **e. User Flow**



* User navigates to `https://username.github.io/repo-name/`. \

* The Vue.js app loads correctly with all assets (HTML, JS, CSS). \

* API-driven data (charging status, controls) will **not load yet**, instead returning placeholder errors. \

* UI remains functional as a static shell for testing hosting and deployment pipeline. \



---


## **f. Deliverables**



* GitHub Pages–hosted version of the SolarCharge frontend. \

* Verified GitHub Actions pipeline for automated deploys. \

* Working placeholder endpoint config (`API_BASE_URL_PLACEHOLDER`). \

* Documentation note in repo `README.md` clarifying backend not yet available. \



---


## **g. Handoff Contract**



* **To PRD2: \
**
    * Replace `API_BASE_URL_PLACEHOLDER` with `SOLARCHARGE_BACKEND_HOSTNAME`. \

    * Remove deprecation comments once replaced. \

    * Do not duplicate placeholder values — full replacement required per Meta-PRD Replacement Rule. \



---


## **h. Contextual Notes (Transcript Fidelity)**

From original PRD:



* Users must feel confident that remote connection is secure → Security validation deferred to PRD2/PRD3. \

* UX parity (local vs. remote) → Placeholder UI must mimic real interface structure so later data integration is seamless. \

* Low-cost requirement → GitHub Pages free tier confirmed suitable in PRD1. \



---


## **i. User Verification Steps**



1. Navigate to public GitHub Pages URL (provided by deployment). \

2. Confirm page assets load correctly (no missing CSS/JS). \

3. Interact with UI elements — confirm they render correctly, though data calls will fail with placeholder errors. \

4. Verify GitHub Actions workflow automatically re-deploys on a new push to `main`. \


**Known Incompletes:**



* No backend data available. \

* API requests will fail until PRD2.