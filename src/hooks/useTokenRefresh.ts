"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Access token lifetime in seconds (must match cookieOptions.access.maxAge).
 * We refresh 60 seconds before it expires so users never feel a disruption.
 */
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_BUFFER_MS = 60 * 1000; // refresh 1 minute early
const REFRESH_INTERVAL_MS = ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS; // 14 minutes

let refreshing: Promise<boolean> | null = null; // singleton in-flight gate

/**
 * Silently calls POST /api/v1/auth/refresh, which re-issues new httpOnly
 * access + refresh cookies server-side. Returns true on success.
 */
async function silentRefresh(): Promise<boolean> {
  // Deduplicate concurrent calls (e.g. multiple components mounting at once)
  if (refreshing) return refreshing;

  refreshing = fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

/**
 * Monkey-patches window.fetch to intercept 401 responses from our own API,
 * silently refresh the token and retry the original request exactly once.
 * Must be called once per page-load.
 */
function installFetchInterceptor(onSessionExpired: () => void) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const res = await originalFetch(input, init);

    // Only intercept calls to our own API that return 401
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const isOurApi = url.startsWith("/api/");
    if (!isOurApi || res.status !== 401) return res;

    // Try to silently refresh
    const refreshed = await silentRefresh();
    if (!refreshed) {
      onSessionExpired();
      return res; // return original 401
    }

    // Retry the original request once with fresh cookie
    return originalFetch(input, init);
  };

  return () => {
    window.fetch = originalFetch;
  };
}

/**
 * useTokenRefresh — mount this hook once per authenticated layout.
 *
 * Behaviour:
 * 1. Proactive: refreshes every 14 minutes so the access cookie never expires
 *    while the user is actively on the page.
 * 2. Reactive: intercepts any 401 API response, refreshes silently, then
 *    retries the original request. If the refresh itself fails (refresh token
 *    also expired) the user is redirected to /auth/login.
 */
export function useTokenRefresh() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interceptorCleanupRef = useRef<(() => void) | null>(null);

  const onSessionExpired = useCallback(() => {
    // Clear the proactive timer so we stop trying
    if (timerRef.current) clearInterval(timerRef.current);
    // Send to login, preserving the current page as the redirect target
    router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  }, [router]);

  useEffect(() => {
    // 1. Install the fetch interceptor (reactive 401 handling)
    interceptorCleanupRef.current = installFetchInterceptor(onSessionExpired);

    // 2. Kick off a proactive refresh immediately (handles the case where the
    //    page is loaded right before the token expires, e.g. 14 min in)
    silentRefresh();

    // 3. Schedule proactive refreshes every 14 minutes
    timerRef.current = setInterval(async () => {
      const ok = await silentRefresh();
      if (!ok) onSessionExpired();
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      interceptorCleanupRef.current?.();
    };
  }, [onSessionExpired]);
}
