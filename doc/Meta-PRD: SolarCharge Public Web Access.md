
# **Meta-PRD: SolarCharge Public Web Access**

**Authority Version:** 1.0 \
 **Authoring Chain:** Meta-PRD overrides all Phase PRDs. \
 **Source Transcript / Input:** PRD-WebAccess.md (SolarCharge EV Charging Optimizer – Public Web Access)


---


## **1. Project Vision**

The SolarCharge application must evolve from a **local-only EV charging dashboard** into a **secure, internet-accessible system**. The guiding principles are:



* **Universal Accessibility:** Users can monitor and control EV charging from anywhere. \

* **Security First:** No direct port forwarding; traffic must flow through secure, encrypted channels. \

* **Low-Cost Hosting:** Favor free-tier services (GitHub Pages, Cloudflare Tunnels). \

* **Separation of Concerns:** Frontend and backend live in **separate repositories**, but remain integrated through stable endpoints. \



---


## **2. Phases of Development**

The project will be delivered in **three primary phases**, with additional sub-phases possible if integration requires iteration.



* **PRD1 – Frontend Public Hosting \
** Scope: Prepare and deploy Vue.js frontend to GitHub Pages. Introduce placeholders for backend API endpoints. \

* **PRD2 – Backend Tunnel Setup \
** Scope: Expose the Python FastAPI backend via Cloudflare Tunnel. Ensure persistent secure connectivity. Replace API placeholders with stable endpoints. \

* **PRD3 – Integration & Testing \
** Scope: Wire frontend to backend through public URLs, conduct functional + security testing, and validate end-to-end user stories. \



---


## **3. Naming and Replacement Rules**



* **Stable Naming: \
**
    * Frontend placeholder API endpoint = `API_BASE_URL_PLACEHOLDER \
`
    * Backend tunnel hostname = `SOLARCHARGE_BACKEND_HOSTNAME \
`
* **Replacement Rule:** All placeholders **must be fully replaced** in later PRDs, no duplication or partial retention. \

* **Deprecation Comments:** Placeholders must include comments marking them for replacement in subsequent PRDs. \



---


## **4. Global Scope Discipline**



* Each PRD **only implements features for its phase**. \

* Security-sensitive tasks (e.g., tunnel authentication) are excluded until their designated phase. \

* Exploratory notes are preserved but not prematurely implemented. \



---


## **5. Transcript Fidelity Notes**

The original PRDemphasizes:



* **User confidence in security** → This will be explicitly validated in PRD3 verification steps. \

* **Low-cost / free-tier services** → Future PRDs must not introduce solutions that add recurring costs. \

* **Smooth UX parity between local and remote access** → Placeholder testing should account for this, even before final tunnel integration. \


These are carried forward as **Contextual Notes** in every phase PRD.


---


## **6. User Verification Guidance**

At the end of each phase, the user will be provided with:



* **Verification Steps** (e.g., "Load GitHub Pages URL and confirm assets render") \

* **Completion Boundaries** (e.g., "Backend not yet connected in PRD1") \

* **Known Incompletes** (clearly stated per phase to avoid false expectations) \



---


## **7. Handoff Contracts**

Each phase PRD must include:



* Explicit references to **which placeholders will be replaced**. \

* Clear removal of deprecated code. \

* Explicit reference back to this **Meta-PRD Replacement Rule** to enforce consistency.