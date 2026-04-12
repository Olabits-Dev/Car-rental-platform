/**
 * Debug endpoint to check environment variables
 */
export default function handler(request, response) {
  const data = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
    allEnvKeys: Object.keys(process.env).filter(k => k.toLowerCase().includes('db') || k.toLowerCase().includes('postgres')).sort(),
  };

  response.setHeader("Content-Type", "application/json");
  response.json(data);
}
