"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Development is excluded so hot reloads are
 * never served from a stale cache; production is where the offline shell matters.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
