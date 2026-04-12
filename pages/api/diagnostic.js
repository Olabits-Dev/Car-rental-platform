/**
 * Ultra-minimal diagnostic endpoint - no imports, pure Node.js
 * Last updated: 2026-04-12
 */
export default function handler(request, response) {
  response.json({ ok: true, message: "Server is running" });
}
