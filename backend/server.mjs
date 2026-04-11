import express from "express";
import nextEnv from "@next/env";
import { pathToFileURL } from "node:url";
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
  removeSession,
  updateInquiryStatus,
} from "./store.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

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

  router.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "rideflex-backend-service",
    });
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

  for (const prefix of mountedPrefixes) {
    app.use(prefix, router);
  }

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found." });
  });

  return app;
}

export const createAuthApp = createBackendApp;
const defaultBackendApp = createBackendApp({
  routePrefix: "/api",
  additionalRoutePrefixes: ["/api/backend"],
});

export default defaultBackendApp;

const isMainModule =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.BACKEND_PORT || 4000);

  ensureBackendReady()
    .then(() => {
      defaultBackendApp.listen(port, () => {
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
