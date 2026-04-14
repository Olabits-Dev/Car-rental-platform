const DEFAULT_LOCAL_APP_URL = "http://127.0.0.1:3000";
const DEFAULT_PRODUCTION_APP_URL = "https://ride-flex.vercel.app";

function normalizeUrl(value) {
  return value?.trim().replace(/\/+$/, "");
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function getAppBaseUrl() {
  const explicitUrl =
    normalizeUrl(process.env.APP_BASE_URL) ||
    normalizeUrl(process.env.FRONTEND_APP_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (explicitUrl) {
    return explicitUrl;
  }

  return isProductionEnvironment()
    ? DEFAULT_PRODUCTION_APP_URL
    : DEFAULT_LOCAL_APP_URL;
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const rawPort = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !rawPort || !user || !pass || !from) {
    return null;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid positive integer.");
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure:
      process.env.SMTP_SECURE?.trim() === "true" || port === 465,
  };
}

export function getPaystackConfig() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY?.trim();

  if (!secretKey || !publicKey) {
    return null;
  }

  return {
    secretKey,
    publicKey,
    baseUrl: "https://api.paystack.co",
  };
}
