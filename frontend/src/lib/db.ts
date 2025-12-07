// Simple in-memory database for Vercel deployment (Data resets on redeploy)
// For production, replace this with MongoDB Atlas or Postgres

export const db = {
    devices: [] as any[],
    content: [] as any[],
    playlists: [] as any[]
};
