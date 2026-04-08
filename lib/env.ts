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
