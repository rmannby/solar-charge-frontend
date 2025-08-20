

# **PRD2: Backend Tunnel Setup (SolarCharge Public Web Access)**

**Phase:** 2 of 3 \
 **Authority:** Inherits from Meta-PRD (v1.0) \
 **Source Context:** PRD-WebAccess.md


---


## **a. Purpose**

This phase enables **secure backend exposure** via Cloudflare Tunnel. It introduces a **stable public hostname** for the backend and replaces the placeholder `API_BASE_URL_PLACEHOLDER` created in PRD1.

**Explicitly Out of Scope:**



* Frontend deployment work (completed in PRD1). \

* End-to-end integration (deferred to PRD3). \

* Security validation beyond tunnel encryption guarantees. \



---


## **b. In-Scope Features**



1. **Secure Tunneling (FR5) \
**
    * Establish Cloudflare Tunnel to expose locally running FastAPI backend. \

2. **Public Hostname (FR6) \
**
    * Configure tunnel with stable hostname: \
 `SOLARCHARGE_BACKEND_HOSTNAME` (placeholder, to be replaced with actual hostname at deploy). \

3. **Local Service Mapping (FR7) \
**
    * Map tunnel hostname to backend service (`http://localhost:8000`). \

4. **Persistent Connector (FR8) \
**
    * Configure `cloudflared` to run as a persistent service (systemd or equivalent). \

5. **Placeholder Replacement (Meta-PRD Rule) \
**
    * Replace all instances of `API_BASE_URL_PLACEHOLDER` in frontend with `SOLARCHARGE_BACKEND_HOSTNAME`. \

    * Remove associated deprecation comments. \



---


## **c. Out-of-Scope Features**



* Frontend UX validation against live backend (PRD3). \

* Full security testing beyond encrypted tunnel defaults. \

* Performance tuning of backend requests. \



---


## **d. Placeholders**


```
SOLARCHARGE_BACKEND_HOSTNAME

 # Placeholder hostname: Replace with actual Cloudflare Tunnel URL at deploy
hostname: SOLARCHARGE_BACKEND_HOSTNAME
service: http://localhost:8000

```



* 
* Must be used in both Cloudflare config and frontend axios config. \

* Includes deprecation comments for replacement in production deployment. \



---


## **e. User Flow**



* Backend host machine runs `cloudflared` connector. \

* Connector establishes tunnel to Cloudflare, binding `SOLARCHARGE_BACKEND_HOSTNAME`. \

* External request flow: \

    1. Browser frontend calls `SOLARCHARGE_BACKEND_HOSTNAME`. \

    2. Cloudflare network routes request to local backend. \

    3. Backend responds with API data. \

* Frontend now has a **working hostname reference**, though full verification occurs in PRD3. \



---


## **f. Deliverables**



* Cloudflare Tunnel created and running. \

* Tunnel config file mapping hostname → `localhost:8000`. \

* `cloudflared` configured to auto-start and persist. \

* Frontend code updated to use `SOLARCHARGE_BACKEND_HOSTNAME` instead of `API_BASE_URL_PLACEHOLDER`. \

* Documentation in backend repo on how to run and maintain tunnel. \



---


## **g. Handoff Contract**



* **To PRD3: \
**
    * Replace `SOLARCHARGE_BACKEND_HOSTNAME` placeholder with actual deployed tunnel hostname. \

    * Conduct end-to-end validation of frontend → backend → hardware flows. \

    * Remove final placeholder deprecation comments. \



---


## **h. Contextual Notes (Transcript Fidelity)**

From original PRD:



* Users require **confidence in security** → Cloudflare Tunnel default encryption ensures HTTPS, but penetration/security testing deferred to PRD3. \

* Backend must remain **local-network aware** (P1 meter, charger) → Tunnel only exposes API, not hardware directly. \

* **Reliability expectation** → Tunnel must auto-reconnect if interrupted. \



---


## **i. User Verification Steps**



1. Confirm `cloudflared` process is running on backend host. \

2. Run test API call to `SOLARCHARGE_BACKEND_HOSTNAME` from an external network (e.g., curl from mobile hotspot). \

3. Verify that request successfully returns JSON response from FastAPI backend. \

4. Reboot backend host → confirm tunnel reconnects automatically. \


**Known Incompletes:**



* Frontend not yet fully integrated (handled in PRD3). \

* Hostname still placeholder until final deployment.