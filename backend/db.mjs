import postgres from "postgres";

function readDatabaseUrl() {
  const url =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Configure it in .env.local and in your deployment environment.",
    );
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
  return postgres(url, {
    max,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => undefined,
  });
}

export function getSql() {
  if (!globalThis.__rideflexSqlClient) {
    globalThis.__rideflexSqlClient = createClient(readDatabaseUrl());
  }

  return globalThis.__rideflexSqlClient;
}

async function createSchema() {
  const sql = createClient(readBootstrapDatabaseUrl(), 1);

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
    `);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

export async function ensureSchema() {
  if (!globalThis.__rideflexSchemaPromise) {
    globalThis.__rideflexSchemaPromise = createSchema().catch((error) => {
      globalThis.__rideflexSchemaPromise = undefined;
      throw error;
    });
  }

  return globalThis.__rideflexSchemaPromise;
}
