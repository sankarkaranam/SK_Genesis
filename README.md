# SK Genesis (Digital Signage Platform)

This project is a cloud-based digital signage solution consisting of:
1.  **CMS API (Backend)**: Node.js/Express server.
2.  **CMS Dashboard (Frontend)**: Next.js web interface.
3.  **Player App**: Web-based player running at `/player`.

## Prerequisites
-   Node.js installed.
-   MongoDB installed and running (or update `MONGO_URI` in `backend/.env`).

## Setup & Run (Local)

1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will start on `http://localhost:3001`.

## Deployment (Vercel)

This project is optimized for Vercel.

1.  Push this repository to GitHub.
2.  Import the project into Vercel.
3.  **Root Directory**: Select `frontend`.
4.  Deploy!

*Note: The current database is in-memory. Data will reset on every deployment. For production, connect a MongoDB Atlas database.*

## Usage Guide

1.  **Open the Player**: Go to `http://localhost:3001/player`. You will see a 6-digit pairing code.
2.  **Open the CMS**: Go to `http://localhost:3001`.
3.  **Pair a Screen**:
    -   Navigate to **Screens**.
    -   Click **Add Screen**.
    -   Enter the code displayed on the Player.
    -   The Player screen should update to "Playing Content".
4.  **Upload Content**: Go to **Content** to upload media (simulated).

## Architecture Details

-   **Backend**: `backend/server.js` handles API requests and device pairing.
-   **Database**: MongoDB (Mongoose schemas in `backend/models`).
-   **Frontend**: Next.js App Router.
    -   `src/app/page.tsx`: Dashboard.
    -   `src/app/screens/page.tsx`: Device management.
    -   `src/app/player/page.tsx`: Player simulation.
# SK_Genesis
