# Bajaj Finserv Coding Challenge Boilerplate

A high-performance, production-ready monorepo initialized for the Bajaj Finserv coding challenge.

## Project Structure
- **/server**: Node.js, Express, TypeScript backend.
- **/client**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI frontend.

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Getting Started

### 1. Installation
Install dependencies for both client and server from the root directory:
```bash
npm install
```

### 2. Environment Variables
Copy the example environment files in both directories:
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 3. Running Locally
Run both servers (or each individually):
```bash
# To run the backend
npm run dev -w server

# To run the frontend
npm run dev -w client
```

*The backend will be available at http://localhost:8080*
*The frontend will be available at http://localhost:3000*
