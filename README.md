# Bajaj Finserv / SRM - Full Stack Engineering Challenge

This repository contains my submission for the full-stack coding challenge. It is structured as a monorepo to cleanly separate the client and server environments while maintaining shared dependencies. 

## Architecture Overview

* **/client**: Built with Next.js 15 (App Router) and TypeScript. The UI utilizes Tailwind CSS and Shadcn for the interactive tree visualization and validation alerts.
* **/server**: A Node.js/Express backend written in strict TypeScript. The core algorithm—including regex validation, multi-parent resolution, and DFS cycle detection—is isolated in `src/services/GraphProcessor.ts`.

## Local Setup

Make sure you have Node.js (v18+) installed.

**1. Install dependencies**
Run this from the root directory to install packages for both workspaces:
`npm install`

**2. Environment Variables**
You will need local `.env` files in both the client and server directories. 
`cp server/.env.example server/.env`
`cp client/.env.example client/.env`

**3. Run the development servers**
You can spin up the environments directly from the root folder:

`# Start the backend (defaults to http://localhost:8080)`
`npm run dev -w server`

`# Start the frontend (defaults to http://localhost:3000)`
`npm run dev -w client`

## API Details
The primary endpoint is `POST /bfhl`. It expects a JSON body with a `data` array of node strings (e.g., `["A->B", "B->C"]`). The backend strictly validates the uppercase `$X->Y$` format, filters duplicates, and calculates the longest root-to-leaf path depth for valid trees.
