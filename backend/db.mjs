import postgres from "postgres";

function readDatabaseUrl() {
  const url =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Configure it in .env.local and in your deployment environment.",
    );
  }

  // Warn if using pooler in many connections scenario (but allow it)
  if (url.includes("-pooler") && url.includes("?") && !url.includes("sslmode=disable")) {
    console.log("[Database] Using pooled connection to Neon with SSL");
  }

  return url;
}

function readBootstrapDatabaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    readDatabaseUrl()
  );
}

function createClient(url, max = 5) {
  // For serverless environments, we need longer timeouts and connection retries
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const connectTimeout = isServerless ? 30 : 15;
  const idleTimeout = isServerless ? 30 : 20;

  return postgres(url, {
    max,
    prepare: false,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
    max_lifetime: 60 * 2, // 2 minutes for serverless
    max_pipeline: 60,
    onnotice: () => undefined,
  });
}

let __initializationError = null;
let __sqlClient = null;

export function getSql() {
  if (__initializationError) {
    throw __initializationError;
  }

  if (!__sqlClient) {
    try {
      __sqlClient = createClient(readDatabaseUrl());
    } catch (error) {
      __initializationError = error;
      throw error;
    }
  }

  return __sqlClient;
}

async function createSchema() {
  let sql;
  
  try {
    sql = createClient(readBootstrapDatabaseUrl(), 1);
  } catch (error) {
    const message = error?.message || String(error);
    console.error("[Database] Failed to create bootstrap client:", message);
    throw new Error(
      `Database client initialization failed: ${message}. Check DATABASE_URL and network connectivity.`,
    );
  }

  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS rideflex_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK (role IN ('owner', 'agent', 'member')),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rideflex_sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES rideflex_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rideflex_bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES rideflex_users(id) ON DELETE CASCADE,
        car_id TEXT NOT NULL,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
        total_price INTEGER NOT NULL,
        offer_code TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed'
          CHECK (status IN ('confirmed', 'completed', 'cancelled')),
        assigned_agent_id TEXT REFERENCES rideflex_users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rideflex_contact_inquiries (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES rideflex_users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        location TEXT,
        vehicle_type TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new'
          CHECK (status IN ('new', 'in_progress', 'resolved')),
        assigned_agent_id TEXT REFERENCES rideflex_users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rideflex_password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES rideflex_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS rideflex_sessions_user_id_idx
        ON rideflex_sessions (user_id);

      CREATE INDEX IF NOT EXISTS rideflex_bookings_user_id_idx
        ON rideflex_bookings (user_id);

      CREATE INDEX IF NOT EXISTS rideflex_bookings_car_window_idx
        ON rideflex_bookings (car_id, start_date, end_date);

      CREATE INDEX IF NOT EXISTS rideflex_bookings_start_date_idx
        ON rideflex_bookings (start_date);

      CREATE INDEX IF NOT EXISTS rideflex_contact_inquiries_status_idx
        ON rideflex_contact_inquiries (status, created_at DESC);

      CREATE INDEX IF NOT EXISTS rideflex_password_reset_tokens_user_id_idx
        ON rideflex_password_reset_tokens (user_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS rideflex_password_reset_tokens_expires_at_idx
        ON rideflex_password_reset_tokens (expires_at);
    `);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

let __schemaInitPromise = null;
let __schemaInitError = null;

export async function ensureSchema() {
  // If already tried and failed, don't retry during build
  if (__schemaInitError && process.env.VERCEL === "1") {
    console.warn("[Database] Skipping schema init during build - will retry at runtime");
    return null;
  }

  if (__schemaInitError) {
    throw __schemaInitError;
  }

  if (!__schemaInitPromise) {
    __schemaInitPromise = createSchema()
      .catch((error) => {
        __schemaInitError = error;
        console.error("[Database] Schema initialization failed:", error?.message || String(error));
        // In Vercel, silently fail during build - will retry at runtime
        if (process.env.VERCEL === "1") {
          console.log("[Database] Build-time schema init failed - will retry on first request");
          return null;
        }
        throw error;
      });
  }

  return __schemaInitPromise;
}
