import { NextRequest, NextResponse } from 'next/server';

/**
 * Root health check endpoint (redirects to backend health check)
 */

export async function GET(request: NextRequest) {
  // Redirect to the API health endpoint
  return NextResponse.redirect(new URL('/api/health', request.url), 307);
}

export async function HEAD(request: NextRequest) {
  // Support HEAD requests
  return NextResponse.redirect(new URL('/api/health', request.url), 307);
}
