import nextEnv from "@next/env";
import { ensureBackendReady } from "./store.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

ensureBackendReady()
  .then(() => {
    console.log("RideFlex backend schema and seed data are ready.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
