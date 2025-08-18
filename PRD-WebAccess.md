# Product Requirements Document: SolarCharge Public Web Access

**Author:** Gemini  
**Date:** August 18, 2025  
**Version:** 1.0

---

## 1. Introduction

This document outlines the requirements for making the SolarCharge EV Charging Optimizer application accessible over the public internet. The project's goal is to enable users to monitor and control their EV charging from anywhere, not just their local network.

The chosen strategy involves deploying the existing Vue.js frontend to a public static hosting service (GitHub Pages) and securely exposing the local Python backend API using a Cloudflare Tunnel. This approach prioritizes security, simplicity, and low cost by keeping the backend on the local network where it can communicate with the necessary hardware (HomeWizard P1 meter, Wallbox EV charger).

## 2. Problem Statement

The SolarCharge application currently provides a web interface that is only accessible on the user's local network. This limits the user's ability to monitor or control their EV charging when they are away from home. Users need a secure and reliable way to access the application's dashboard and controls from any internet-connected device without the complexity and security risks of opening ports on their home router or deploying the entire backend to a public server.

## 3. Goals and Objectives

| Goal                 | Objective                                                                    | Key Result (Metric)                                                                                                        |
| :------------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Enable Remote Access** | Deploy the frontend to a public URL.                                         | The web interface is successfully loaded from a public `github.io` URL.                                                    |
|                      | Securely expose the local backend API.                                       | The public frontend can successfully fetch data from and send commands to the local backend via a Cloudflare Tunnel URL. |
| **Maintain Security**  | Avoid exposing the home network or backend server directly to the internet.  | No port forwarding rules are required on the user's router. All traffic to the backend is encrypted and routed through Cloudflare. |
| **Ensure Low Cost**    | Utilize free services for hosting and tunneling.                             | The total monthly cost for the solution is $0 by using the free tiers of GitHub Pages and Cloudflare Tunnels.              |
| **Simplify Deployment**| Automate the frontend deployment process.                                    | Pushing changes to the frontend's GitHub repository automatically triggers a new deployment to GitHub Pages.             |

## 4. User Stories

-   **As a SolarCharge user,** I want to view the real-time status of my EV charging on my phone when I'm at work, so that I can check if my car is charging with surplus solar power.
-   **As a SolarCharge user,** I want to manually start "Max Charging" from my tablet before I head home, so that I can ensure my car has enough charge for my evening plans.
-   **As a SolarCharge user,** I want to stop a charging session remotely, so that I can prevent the car from drawing power from the grid if the solar production suddenly drops.
-   **As a SolarCharge user,** I want to feel confident that my remote connection is secure, so that I can be sure no unauthorized person can access my charger or my local network.

## 5. Functional Requirements

### 5.1. Frontend (Vue.js on GitHub Pages)

-   **FR1: Public Hosting:** The Vue.js frontend application must be built and deployed as a static site to GitHub Pages.
-   **FR2: Correct Asset Paths:** The Vite build configuration (`vite.config.js`) must be updated (using the `base` property) to ensure all CSS, JS, and other assets load correctly from the GitHub Pages subdirectory URL (e.g., `username.github.io/repo-name/`).
-   **FR3: Configurable API Endpoint:** The frontend code must be updated to point all `axios` API calls to the public Cloudflare Tunnel URL instead of a local IP or `localhost`.
-   **FR4: Automated Deployment:** A GitHub Actions workflow must be configured to automatically build and deploy the application to the `gh-pages` branch upon every push to the `main` branch.

### 5.2. Backend (Python/FastAPI with Cloudflare Tunnel)

-   **FR5: Secure Tunneling:** A Cloudflare Tunnel must be established to securely expose the locally running FastAPI backend to the internet.
-   **FR6: Public Hostname:** The tunnel must be configured with a stable public hostname (e.g., `solarcharge-api.your-tunnel-url.com`) that the frontend can connect to.
-   **FR7: Local Service Mapping:** The tunnel configuration must correctly map the public hostname to the local backend service address (e.g., `http://localhost:8000`).
-   **FR8: Persistent Connector:** The `cloudflared` connector service must be configured to run persistently on the machine hosting the backend (e.g., as a systemd service) so the connection remains active.

## 6. Non-Functional Requirements

-   **NFR1: Security:** All traffic between the public frontend and the backend must be encrypted via HTTPS, which is handled by default by both GitHub Pages and Cloudflare.
-   **NFR2: Performance:** The frontend application should load quickly. The API response latency should be acceptable for real-time monitoring, with the understanding that it includes the round-trip through the Cloudflare network.
-   **NFR3: Reliability:** The Cloudflare Tunnel connection should be stable and automatically reconnect if interrupted.
-   **NFR4: Usability:** The user experience should be identical whether accessing the application locally or remotely. All buttons, selectors, and data displays must function as expected.

## 7. System Architecture

The proposed architecture separates the presentation layer (frontend) from the application logic (backend), allowing them to be hosted in different environments.

1.  **User Device (Browser):** The user accesses the Vue.js application from a public URL hosted on GitHub Pages.
2.  **GitHub Pages:** Serves the static HTML, CSS, and JavaScript files to the user's browser.
3.  **API Calls:** The frontend, running in the browser, makes API requests to the public Cloudflare Tunnel hostname.
4.  **Cloudflare Network:** Receives the HTTPS request, authenticates it for the correct tunnel, and securely forwards it to the user's local network.
5.  **`cloudflared` Connector:** A lightweight service running on the local machine receives the request from the Cloudflare network.
6.  **Local Backend Server:** The connector forwards the request to the Python FastAPI application running on `localhost`.
7.  **Local Hardware:** The backend communicates directly with the HomeWizard P1 meter and Wallbox charger on the local network to execute commands and retrieve data.

## 8. Implementation Plan

| Phase                                     | Task                                                                                                     | Estimated Time |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------- | :------------- |
| **Phase 1: Frontend Preparation**         | 1. Create a new public repository on GitHub for the frontend code.                                       | 15 mins        |
|                                           | 2. Update `vite.config.js` with the correct `base` path.                                                 | 10 mins        |
|                                           | 3. Configure GitHub Actions for automated deployment to GitHub Pages.                                    | 30 mins        |
|                                           | 4. Push code and verify the initial deployment.                                                          | 15 mins        |
| **Phase 2: Backend Tunnel Setup**         | 1. Create a free Cloudflare account.                                                                     | 5 mins         |
|                                           | 2. Navigate to the Zero Trust dashboard and create a new Tunnel.                                         | 15 mins        |
|                                           | 3. Install and run the `cloudflared` connector on the backend machine.                                   | 20 mins        |
|                                           | 4. Configure the tunnel with a public hostname and map it to the local backend service (`localhost:8000`). | 10 mins        |
| **Phase 3: Integration & Testing**        | 1. Update the frontend's `axios` configuration with the new public Cloudflare Tunnel URL.                | 10 mins        |
|                                           | 2. Push the change to GitHub to trigger a new deployment.                                                | 5 mins         |
|                                           | 3. Test end-to-end functionality from an external network (e.g., a mobile phone on cellular data).       | 30 mins        |
|                                           | 4. (Optional) Configure `cloudflared` to run as a system service for persistence.                        | 30 mins        |