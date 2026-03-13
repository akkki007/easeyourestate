"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RealtimeState {
  connected: boolean;
  mode: "changestream" | "polling" | null;
  lastEvent: number | null; // timestamp of last change event
}

/**
 * Connects to the admin SSE endpoint and calls `onRefresh`
 * whenever the data changes (debounced to avoid spam).
 */
export function useAdminRealtime(
  token: string | null,
  onRefresh: () => void
) {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    mode: null,
    lastEvent: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Debounced refresh: coalesce rapid changes into one fetch
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      if (mountedRef.current) onRefresh();
    }, 500);
  }, [onRefresh]);

  useEffect(() => {
    mountedRef.current = true;

    if (!token) return;

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const MAX_RETRY = 10;

    const connect = () => {
      if (!mountedRef.current) return;

      const es = new EventSource(`/api/admin/realtime?token=${encodeURIComponent(token)}`);
      eventSourceRef.current = es;

      es.addEventListener("connected", () => {
        if (!mountedRef.current) return;
        retryCount = 0;
        setState((s) => ({ ...s, connected: true }));
      });

      es.addEventListener("mode", (e) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(e.data);
          setState((s) => ({ ...s, mode: data.mode }));
        } catch { /* ignore */ }
      });

      es.addEventListener("change", (e) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(e.data);
          setState((s) => ({ ...s, lastEvent: data.time }));
          scheduleRefresh();
        } catch { /* ignore */ }
      });

      es.addEventListener("ping", () => {
        // Heartbeat — connection is alive, nothing to do
      });

      es.onerror = () => {
        if (!mountedRef.current) return;
        setState((s) => ({ ...s, connected: false }));
        es.close();
        eventSourceRef.current = null;

        // Reconnect with exponential backoff
        if (retryCount < MAX_RETRY) {
          const delay = Math.min(1000 * 2 ** retryCount, 30000);
          retryCount++;
          reconnectTimeout = setTimeout(connect, delay);
        }
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [token, scheduleRefresh]);

  return state;
}
