/**
 * Backend API handler with maximum error safety
 * This handler wraps everything with error boundaries
 */

let getBackendServiceFn = null;

async function loadBackendService() {
  try {
    if (!getBackendServiceFn) {
      const module = await import("../../../backend/server.mjs");
      getBackendServiceFn = module.getBackendService;
    }
    return getBackendServiceFn;
  } catch (error) {
    console.error("[Backend API] Failed to load backend:", error?.message);
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(request, response) {
  try {
    // Check environment - with fallback for testing
    let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    // Fallback URL for testing (remove after Vercel env vars are working)
    if (!dbUrl) {
      dbUrl = "postgresql://neondb_owner:npg_6E4HUSpbiPqs@ep-divine-sky-amzfn71w-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
      console.log("[Backend API] Using fallback DATABASE_URL");
    }
    
    if (!dbUrl) {
      console.error("[Backend API] DATABASE_URL not configured");
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Database not configured" }));
      return;
    }

    // Load and get backend service
    let getBackendService;
    try {
      getBackendService = await loadBackendService();
    } catch (loadError) {
      console.error("[Backend API] Failed to load service:", loadError);
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Service load failed" }));
      return;
    }

    // Get the app instance
    let app;
    try {
      app = getBackendService();
    } catch (getError) {
      console.error("[Backend API] Failed to get service instance:", getError);
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Service init failed" }));
      return;
    }

    // Call the app
    const result = app(request, response);
    if (result && typeof result.catch === "function") {
      await result.catch((err) => {
        console.error("[Backend API] App error:", err);
        if (!response.headersSent) {
          response.statusCode = 503;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "Request failed" }));
        }
      });
    }
  } catch (error) {
    console.error("[Backend API] Outer error:", error);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Internal error" }));
    }
  }
}
