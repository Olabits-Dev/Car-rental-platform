import { getBackendService } from "../../../backend/server.mjs";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

// Pre-check environment before handling requests
function validateEnvironment() {
  const hasDb = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  return { hasDb };
}

export default async function handler(request, response) {
  try {
    // Step 1: Environment validation
    const { hasDb } = validateEnvironment();
    if (!hasDb) {
      console.error("[Backend API] DATABASE_URL is not configured");
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify({
          error: "Backend is not configured. Missing database connection.",
        })
      );
      return;
    }

    // Step 2: Get backend service
    let app;
    try {
      app = getBackendService();
      if (!app || typeof app !== "function") {
        throw new Error("Backend service is not callable");
      }
    } catch (serviceError) {
      console.error(
        "[Backend API] Service error:",
        serviceError?.message || serviceError
      );
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify({
          error: "Backend service failed to initialize.",
        })
      );
      return;
    }

    // Step 3: Call backend app
    try {
      const result = app(request, response);

      // If result is a promise, await it with error handling
      if (result && typeof result.catch === "function") {
        await result.catch((error) => {
          console.error("[Backend API] App error:", error?.message || error);
          if (!response.headersSent) {
            response.statusCode = 503;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: "Backend request failed." }));
          }
        });
      }
    } catch (appError) {
      console.error("[Backend API] Execution error:", appError?.message || appError);
      if (!response.headersSent) {
        response.statusCode = 503;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ error: "Backend execution failed." }));
      }
    }
  } catch (outerError) {
    // Catch-all for any unexpected errors
    console.error("[Backend API] Outer catch:", outerError?.message || outerError);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Internal server error." }));
    }
  }
}
