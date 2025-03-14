import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// @ts-ignore
import { IdentityKitProvider } from "@nfid/identitykit/react";
const queryClient = new QueryClient();


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <IdentityKitProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </IdentityKitProvider>
  </StrictMode>,
);
