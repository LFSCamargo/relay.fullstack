import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { Environment, Network } from "relay-runtime";
import type { FetchFunction } from "relay-runtime";

import "./index.css";
import { AppRouter } from "./router/index.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { useAuthStore } from "./modules/auth/stores/auth.ts";

const HTTP_ENDPOINT = "http://localhost:4000/graphql";

const fetchGraphQL: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: useAuthStore.getState().token || "",
    },
    body: JSON.stringify({ query: request.text, variables }),
  });
  if (!resp.ok) {
    throw new Error("Response failed.");
  }
  return await resp.json();
};

const environment = new Environment({
  network: Network.create(fetchGraphQL),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <AppRouter />
        <Toaster />
      </Suspense>
    </RelayEnvironmentProvider>
  </StrictMode>,
);
