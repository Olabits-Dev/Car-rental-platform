/**
 * Diagnostic endpoint that tests basic functionality and backend imports
 */
export default async function handler(request, response) {
  const diagnostic = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: Boolean(process.env.VERCEL),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      region: process.env.VERCEL_REGION || process.env.AWS_REGION || "unknown",
    },
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + " MB",
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
    backend: { status: "not-tested" },
  };

  try {
    // Try to import backend service to see if import fails
    try {
      const { getBackendService } = await import("../../backend/server.mjs");
      diagnostic.backend.importStatus = "success";
      
      // Try to get the backend service
      try {
        const app = getBackendService();
        diagnostic.backend.status = "initialized";
      } catch (serviceError) {
        diagnostic.backend.status = "initialization-failed";
        diagnostic.backend.error = serviceError?.message || String(serviceError);
      }
    } catch (importError) {
      diagnostic.backend.importStatus = "failed";
      diagnostic.backend.error = importError?.message || String(importError);
    }

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.end(JSON.stringify(diagnostic, null, 2));
  } catch (error) {
    console.error("[Diagnostic] Error:", error);
    response.setHeader("Content-Type", "application/json");
    response.status(500);
    response.end(
      JSON.stringify({
        status: "error",
        error: error?.message || "Unknown error",
        stack: error?.stack,
      })
    );
  }
}
