import { getBackendService } from "../../../backend/server.mjs";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(request, response) {
  try {
    // Validate database URL is configured
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.error(
        "[API Backend] DATABASE_URL is missing. Configure in environment variables."
      );
      return response.status(503).json({
        error: "Backend service is not properly configured.",
      });
    }

    const app = getBackendService();
    return app(request, response);
  } catch (error) {
    console.error("[API Backend] Error:", error);
    const statusCode =
      error?.statusCode || error?.code === "ECONNREFUSED" ? 503 : 500;
    response.status(statusCode).json({
      error:
        statusCode === 503
          ? "Backend service is unavailable."
          : "Internal server error",
    });
  }
}
