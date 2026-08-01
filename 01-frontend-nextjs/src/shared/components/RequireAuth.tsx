"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSessionStore } from "../stores/session.store";

/**
 * The access token lives in localStorage-persisted Zustand, not a cookie, so
 * there's no server-side session to gate on — this client guard is the MVP
 * tradeoff (mirrors 02-frontend-react-vite's RequireAuth). It must wait for
 * the persisted store to rehydrate before deciding to redirect — on a fresh
 * page load, `accessToken` starts out null for one render until Zustand's
 * `persist` middleware finishes reading localStorage, and redirecting on
 * that first render would bounce even a logged-in user to /login.
 *
 * Subtlety: zustand's React hook reads via `useSyncExternalStore`, which on
 * the very first (hydration-matching) client render returns the *server*
 * snapshot (accessToken: null) to avoid a hydration mismatch — even though
 * the store itself has already synchronously rehydrated from localStorage
 * by that point. The reactive `accessToken` selector below briefly lags one
 * render behind. `hasHydrated` doesn't have this problem (it's tracked via
 * our own effect-based subscription, not the SSR-aware hook), so the
 * redirect check reads the store's *current* state imperatively via
 * `getState()` instead of trusting the possibly-stale selector value —
 * otherwise a logged-in user briefly bounces to /login on every hard reload
 * of a protected route.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  // Optional chaining: `.persist` can be undefined during Next's server-side
  // prerendering pass (no browser storage to hydrate from there).
  const [hasHydrated, setHasHydrated] = useState(
    () => useSessionStore.persist?.hasHydrated() ?? false,
  );

  useEffect(() => {
    return useSessionStore.persist?.onFinishHydration(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (hasHydrated && !useSessionStore.getState().accessToken) {
      router.replace("/login");
    }
  }, [hasHydrated, router]);

  // Render decision stays on the plain reactive selector (not getState())
  // so the client's hydration-matching first render doesn't diverge from
  // the server's — it briefly shows the loading fallback, then React's own
  // hydration-mismatch reconciliation re-renders with the real value a tick
  // later. Only the *redirect* effect above needs the imperative read.
  if (!hasHydrated || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
