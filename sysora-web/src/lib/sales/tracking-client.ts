"use client";

import type { TrackingContext } from "./actions";

const SESSION_KEY = "sysora.sid";
const ATTRIBUTION_KEY = "sysora.attribution";

/** A stable id for this browser session, minted on first use. */
export function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * First-touch attribution, captured once per session and reused on every
 * later submission — so a lead that lands on an ad and converts three
 * pages later is still credited to the ad.
 */
export function readTrackingContext(): TrackingContext {
  if (typeof window === "undefined") return {};

  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try {
      return { ...(JSON.parse(stored) as TrackingContext), sessionId: sessionId() };
    } catch {
      // Fall through and re-read from the URL.
    }
  }

  const params = new URLSearchParams(window.location.search);
  const context: TrackingContext = {
    sessionId: sessionId(),
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
  };

  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(context));
  return context;
}
