import { getBackendService } from "../../../backend/server.mjs";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

// Pre-check environment before handling requests
function validateEnvironment() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return {
      valid: false,
      error: "Backend service is not properly configured. Database connection required.",
    };
  }
  return { valid: true };
}

export default async function handler(request, response) {
  try {
    // Pre-flight environment check
    const envCheck = validateEnvironment();
    if (!envCheck.valid) {
      console.error("[API Backend]", envCheck.error);
      return response.status(503).json({ error: envCheck.error });
    }

    // Get backend service with error handling
    let app;
    try {
      app = getBackendService();
    } catch (initError) {
      console.error(
        "[API Backend] Failed to initialize service:",
        initError?.message || String(initError)
      );
      return response.status(503).json({
        error: "Backend service initialization failed.",
      });
    }

    // Call backend app with error boundaries
    if (!app || typeof app !== "function") {
      console.error("[API Backend] Backend service is not a valid function");
      return response.status(503).json({
        error: "Backend service is misconfigured.",
      });
    }

    // Execute the backend app
    try {
      const result = app(request, response);
      
      // Handle promise result if app returns a promise
      if (result && typeof result.catch === "function") {
        return await result.catch((error) => {
          console.error("[API Backend] Async error in app:", error?.message || String(error));
          if (!response.headersSent) {
            return response.status(503).json({
              error: "Backend service request failed.",
            });
          }
        });
      }
      
      return result;
    } catch (execError) {
      console.error("[API Backend] Execution error:", execError?.message || String(execError));
      if (!response.headersSent) {
        return response.status(503).json({
          error: "Backend service request failed.",
        });
      }
    }
  } catch (outerError) {
    console.error("[API Backend] Outer error:", outerError?.message || String(outerError));
    if (!response.headersSent) {
      return response.status(500).json({
        error: "Internal server error",
      });
    }
  }
}
