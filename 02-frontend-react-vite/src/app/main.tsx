import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { GoogleOAuthProviderWrapper } from "../shared/providers/google-oauth-provider";
import { ToastContainer } from "../shared/components/Toast";
import { router } from "./router";
import "../index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProviderWrapper>
        <RouterProvider router={router} />
        <ToastContainer />
      </GoogleOAuthProviderWrapper>
    </QueryClientProvider>
  </StrictMode>,
);
