import "dotenv/config.js";
import express from "express";
import nextEnv from "@next/env";
import { pathToFileURL } from "node:url";
import { getSql } from "./db.mjs";
import {
  authenticateUser,
  BackendStoreError,
  createBooking,
  createContactInquiry,
  createSession,
  ensureBackendReady,
  getBookingsForUser,
  getDashboardForSession,
  getUserFromSessionToken,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
  removeSession,
  validatePasswordResetToken,
  updateInquiryStatus,
} from "./store.mjs";
import {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  PaystackServiceError,
} from "./paystack.mjs";

const { loadEnvConfig } = nextEnv;

// Load environment configuration safely
try {
  loadEnvConfig(process.cwd());
} catch (error) {
  // In serverless environments, loadEnvConfig might fail silently, which is ok
  // The environment variables should already be set
  console.warn("[Backend] loadEnvConfig warning:", error?.message || String(error));
}

function readSessionToken(request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
}

function handleError(error, response, fallbackMessage) {
  if (error instanceof BackendStoreError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ error: fallbackMessage });
}

export function createBackendApp(options = {}) {
  const {
    routePrefix = "/api",
    additionalRoutePrefixes = [],
  } = options;
  const app = express();
  const router = express.Router();

  app.disable("x-powered-by");
  app.use(express.json());

  const mountedPrefixes = Array.from(
    new Set([routePrefix, ...additionalRoutePrefixes].filter(Boolean)),
  );

  app.get("/", (_request, response) => {
    response.json({
      ok: true,
      service: "rideflex-backend-service",
      apiBasePaths: mountedPrefixes,
      health: mountedPrefixes.map((prefix) => `${prefix}/health`),
    });
  });

  router.get("/", (_request, response) => {
    response.json({
      ok: true,
      service: "rideflex-backend-service",
      basePath: routePrefix,
      health: `${routePrefix}/health`,
    });
  });

  router.get("/health", async (_request, response) => {
    const health = {
      ok: true,
      service: "rideflex-backend-service",
      database: "unknown",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      },
    };

    // Try to check database connectivity
    try {
      const sql = getSql();
      const result = await sql`SELECT 1`;
      health.database = result ? "connected" : "unreachable";
    } catch (error) {
      health.database = "error";
      health.databaseError = error?.message || String(error);
      console.error("[Health Check] Database error:", health.databaseError);
    }

    const statusCode = health.database === "error" ? 503 : 200;
    response.status(statusCode).json(health);
  });

  router.post("/auth/login", async (request, response) => {
    try {
      const user = await authenticateUser({
        email: request.body?.email ?? "",
        password: request.body?.password ?? "",
      });

      if (!user) {
        response.status(401).json({ error: "Incorrect email or password." });
        return;
      }

      const session = await createSession(user.id);
      response.json({
        user,
        sessionToken: session.token,
      });
    } catch (error) {
      handleError(error, response, "Could not sign you in right now.");
    }
  });

  router.post("/auth/register", async (request, response) => {
    try {
      const user = await registerUser({
        name: request.body?.name ?? "",
        email: request.body?.email ?? "",
        password: request.body?.password ?? "",
      });

      const session = await createSession(user.id);
      response.status(201).json({
        user,
        sessionToken: session.token,
      });
    } catch (error) {
      handleError(error, response, "Could not create your account.");
    }
  });

  router.post("/auth/forgot-password", async (request, response) => {
    try {
      const result = await requestPasswordReset({
        email: request.body?.email ?? "",
      });

      response.json(result);
    } catch (error) {
      handleError(
        error,
        response,
        "Could not start the password reset flow right now.",
      );
    }
  });

  router.get("/auth/reset-password/validate", async (request, response) => {
    try {
      const result = await validatePasswordResetToken(
        String(request.query?.token ?? ""),
      );

      if (!result) {
        response
          .status(400)
          .json({ error: "This reset link is invalid or has expired." });
        return;
      }

      response.json(result);
    } catch (error) {
      handleError(
        error,
        response,
        "Could not validate that reset link right now.",
      );
    }
  });

  router.post("/auth/reset-password", async (request, response) => {
    try {
      const result = await resetPasswordWithToken({
        token: request.body?.token ?? "",
        password: request.body?.password ?? "",
      });

      response.json(result);
    } catch (error) {
      handleError(
        error,
        response,
        "Could not update the password right now.",
      );
    }
  });

  router.get("/auth/me", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Unauthorized." });
        return;
      }

      response.json({ user });
    } catch (error) {
      handleError(error, response, "Could not verify your session.");
    }
  });

  router.post("/auth/logout", async (request, response) => {
    try {
      await removeSession(readSessionToken(request));
      response.json({ ok: true });
    } catch (error) {
      handleError(error, response, "Could not sign you out right now.");
    }
  });

  router.get("/dashboard/me", async (request, response) => {
    try {
      const dashboard = await getDashboardForSession(readSessionToken(request));
      response.json(dashboard);
    } catch (error) {
      handleError(error, response, "Could not load the dashboard right now.");
    }
  });

  router.get("/bookings/me", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Unauthorized." });
        return;
      }

      const bookings = await getBookingsForUser(user.id);
      response.json({ bookings });
    } catch (error) {
      handleError(error, response, "Could not load your bookings right now.");
    }
  });

  router.post("/bookings", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Please log in first." });
        return;
      }

      const booking = await createBooking({
        userId: user.id,
        carId: request.body?.carId ?? "",
        startDate: request.body?.startDate ?? "",
        endDate: request.body?.endDate ?? "",
        offerCode: request.body?.offerCode,
      });

      response.status(201).json({ booking });
    } catch (error) {
      handleError(
        error,
        response,
        "Something went wrong while creating the booking.",
      );
    }
  });

  router.post("/contact", async (request, response) => {
    try {
      const currentUser = await getUserFromSessionToken(readSessionToken(request));
      const inquiry = await createContactInquiry(
        {
          name: request.body?.name ?? "",
          email: request.body?.email ?? currentUser?.email ?? "",
          phone: request.body?.phone,
          location: request.body?.location,
          vehicleType: request.body?.vehicleType,
          message: request.body?.message ?? "",
        },
        currentUser,
      );

      response.status(201).json({ inquiry });
    } catch (error) {
      handleError(
        error,
        response,
        "Something went wrong while sending your message.",
      );
    }
  });

  router.patch("/inquiries/:id", async (request, response) => {
    try {
      const inquiry = await updateInquiryStatus(
        readSessionToken(request),
        request.params.id,
        request.body?.status ?? "",
      );

      response.json({ inquiry });
    } catch (error) {
      handleError(
        error,
        response,
        "Could not update that inquiry right now.",
      );
    }
  });

  router.post("/payment/initialize", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Please log in first." });
        return;
      }

      const bookingId = request.body?.bookingId ?? "";
      const amount = request.body?.amount;

      if (!bookingId || !amount || amount <= 0) {
        response.status(400).json({ error: "Invalid booking ID or amount." });
        return;
      }

      const payment = await initializePayment(
        user.id,
        amount,
        user.email,
        bookingId
      );

      // Link payment to booking
      const sql = getSql();
      await sql`
        UPDATE rideflex_bookings
        SET payment_id = ${payment.id}
        WHERE id = ${bookingId} AND user_id = ${user.id}
      `;

      response.status(201).json({
        payment: {
          id: payment.id,
          authorizationUrl: payment.authorizationUrl,
          reference: payment.reference,
        }
      });
    } catch (error) {
      if (error instanceof PaystackServiceError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
      }
      handleError(
        error,
        response,
        "Could not initialize payment.",
      );
    }
  });

  router.post("/payment/verify", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Please log in first." });
        return;
      }

      const reference = request.body?.reference ?? "";
      const paymentId = request.body?.paymentId ?? "";

      if (!reference || !paymentId) {
        response.status(400).json({ error: "Missing reference or paymentId." });
        return;
      }

      const paymentResult = await verifyPayment(reference);

      if (paymentResult.status === "success") {
        // Update booking status to confirmed when payment succeeds
        const sql = getSql();
        await sql`
          UPDATE rideflex_bookings
          SET status = 'confirmed'
          WHERE payment_id = ${paymentId} AND user_id = ${user.id}
        `;
      }

      response.json({
        status: paymentResult.status,
        message: paymentResult.status === "success" 
          ? "Payment successful" 
          : "Payment failed"
      });
    } catch (error) {
      if (error instanceof PaystackServiceError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
      }
      handleError(
        error,
        response,
        "Could not verify payment.",
      );
    }
  });

  router.get("/payment/status", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user) {
        response.status(401).json({ error: "Please log in first." });
        return;
      }

      const paymentId = String(request.query?.paymentId ?? "");

      if (!paymentId) {
        response.status(400).json({ error: "Missing paymentId." });
        return;
      }

      const payment = await getPaymentStatus(paymentId);

      // Verify ownership
      const sql = getSql();
      const booking = await sql`
        SELECT user_id FROM rideflex_bookings WHERE payment_id = ${paymentId}
      `;

      if (booking.length === 0 || booking[0].user_id !== user.id) {
        response.status(403).json({ error: "Unauthorized." });
        return;
      }

      response.json(payment);
    } catch (error) {
      if (error instanceof PaystackServiceError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
      }
      handleError(
        error,
        response,
        "Could not get payment status.",
      );
    }
  });

  router.post("/payment/webhook", async (request, response) => {
    try {
      const reference = request.body?.reference ?? "";
      const status = request.body?.status ?? "";

      if (!reference || !status) {
        response.status(400).json({ error: "Invalid webhook data." });
        return;
      }

      const sql = getSql();

      // Update payment status
      await sql`
        UPDATE rideflex_payments
        SET status = ${status}, updated_at = NOW()
        WHERE reference = ${reference}
      `;

      // If payment successful, confirm the booking
      if (status === "success") {
        await sql`
          UPDATE rideflex_bookings
          SET status = 'confirmed'
          WHERE payment_id IN (
            SELECT id FROM rideflex_payments WHERE reference = ${reference}
          ) AND status = 'pending'
        `;
      }

      response.json({ ok: true });
    } catch (error) {
      console.error("[Webhook] Error processing payment webhook:", error?.message || String(error));
      response.status(500).json({ error: "Webhook processing failed." });
    }
  });

  router.get("/admin/payments/report", async (request, response) => {
    try {
      const user = await getUserFromSessionToken(readSessionToken(request));

      if (!user || (user.role !== "owner" && user.role !== "agent")) {
        response.status(403).json({ error: "Unauthorized." });
        return;
      }

      const sql = getSql();

      // Get payment statistics
      const stats = await sql`
        SELECT
          COUNT(*) FILTER (WHERE status = 'success')::int as successful_payments,
          COUNT(*) FILTER (WHERE status = 'pending')::int as pending_payments,
          COUNT(*) FILTER (WHERE status = 'failed')::int as failed_payments,
          SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END)::bigint as total_received,
          AVG(CASE WHEN status = 'success' THEN amount ELSE NULL END)::bigint as avg_transaction
        FROM rideflex_payments
      `;

      // Get recent payments
      const payments = await sql`
        SELECT
          p.id,
          p.user_id,
          u.name as user_name,
          u.email as user_email,
          p.amount,
          p.status,
          p.reference,
          p.created_at,
          (SELECT COUNT(*) FROM rideflex_bookings WHERE payment_id = p.id) as associated_bookings
        FROM rideflex_payments p
        LEFT JOIN rideflex_users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 100
      `;

      response.json({
        stats: stats[0],
        payments: payments.map((p) => ({
          id: p.id,
          userId: p.user_id,
          userName: p.user_name,
          userEmail: p.user_email,
          amount: Number(p.amount),
          status: p.status,
          reference: p.reference,
          createdAt: p.created_at,
          associatedBookings: Number(p.associated_bookings),
        })),
      });
    } catch (error) {
      console.error("[Admin] Error getting payment report:", error?.message || String(error));
      handleError(
        error,
        response,
        "Could not fetch payment report.",
      );
    }
  });

  for (const prefix of mountedPrefixes) {
    app.use(prefix, router);
  }

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found." });
  });

  return app;
}

export const createAuthApp = createBackendApp;

let _defaultBackendApp = null;

export function getBackendService() {
  if (!_defaultBackendApp) {
    _defaultBackendApp = createBackendApp({
      routePrefix: "/api",
      additionalRoutePrefixes: ["/api/backend"],
    });
  }
  return _defaultBackendApp;
}

export default getBackendService;

const isMainModule =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.BACKEND_PORT || 4000);

  ensureBackendReady()
    .then(() => {
      getBackendService().listen(port, () => {
        console.log(
          `RideFlex backend service listening on http://127.0.0.1:${port}/api`,
        );
      });
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
