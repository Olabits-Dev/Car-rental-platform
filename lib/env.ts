import "server-only";

const MIN_SESSION_SECRET_LENGTH = 32;

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is missing. Add it to .env.local for local development and configure it in your hosting provider before deploying.`,
    );
  }

  return value;
}

export function getSessionSecret() {
  const secret = requireEnv("SESSION_SECRET");

  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters long.`,
    );
  }

  return secret;
}

export function getBackendPort() {
  const rawPort = process.env.BACKEND_PORT?.trim() || "4000";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("BACKEND_PORT must be a valid positive integer.");
  }

  return port;
}

export function getBackendApiUrl() {
  const explicitUrl = process.env.BACKEND_API_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/api/backend`;
  }

  return `http://127.0.0.1:${getBackendPort()}/api`;
}
