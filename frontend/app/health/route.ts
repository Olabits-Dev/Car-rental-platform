import { NextResponse } from 'next/server';

/**
 * Health check endpoint - direct response (no redirect)
 */

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const hasDb = Boolean(dbUrl);

  const health = {
    ok: true,
    status: "healthy",
    service: "car-rental-platform",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || "production",
      hasDatabaseUrl: hasDb,
      apiVersion: "1.0.0",
    },
  };

  return NextResponse.json(health, { status: 200 });
}

export async function HEAD() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
