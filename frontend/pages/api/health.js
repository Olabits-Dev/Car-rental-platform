/**
 * Health check endpoint - simple status check
 * No external dependencies to avoid import issues
 */

export default function handler(request, response) {
  // Simple health check - just verify the endpoint is working
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const hasDb = Boolean(dbUrl);

  const health = {
    ok: true,
    status: "healthy",
    service: "car-rental-platform",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || "production",
      hasDatabaseUrl: hasDb,
      apiVersion: "1.0.0",
    },
  };

  response.status(200).json(health);
}
