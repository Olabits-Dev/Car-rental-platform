import { createBackendApp } from "../../../backend/server.mjs";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const backendApp = createBackendApp({ routePrefix: "/api/backend" });

export default function handler(request, response) {
  return backendApp(request, response);
}
