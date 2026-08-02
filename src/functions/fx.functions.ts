import { createServerFn } from "@tanstack/react-start";
import type { FxData } from "../services/geo-api";

// Frankfurter's timeseries endpoint doesn't send CORS headers, so fetch rates server-side.
export const getFx = createServerFn({ method: "GET" })
  .inputValidator((data: { base: string; target: string }) => {
    const ok = (s: string) => /^[A-Za-z]{3}$/.test(s);
    if (!ok(data.base) || !ok(data.target)) throw new Error("Invalid currency code");
    return { base: data.base.toUpperCase(), target: data.target.toUpperCase() };
  })
  .handler(async ({ data }): Promise<FxData> => {
    const { base, target } = data;
    if (base === target) return { rate: 1, base, target, trend: [] };

    let rate = 0;
    try {
      // Primary: Open ER API (supports 160+ world currencies without CORS issues)
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.rates && typeof json.rates[target] === "number") {
          rate = json.rates[target];
        }
      }
    } catch {
      // Fallback
    }

    // Try Frankfurter for rates/trend if rate is missing
    const from = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    let trend: { d: string; v: number }[] = [];

    try {
      const frankRes = await fetch(
        `https://api.frankfurter.dev/v1/${from}..?base=${base}&symbols=${target}`,
        { signal: AbortSignal.timeout(6000) },
      );
      if (frankRes.ok) {
        const series = await frankRes.json();
        trend = Object.entries(series.rates ?? {})
          .map(([d, r]: [string, any]) => ({ d, v: r[target] as number }))
          .sort((a, b) => a.d.localeCompare(b.d));
        if (!rate && trend.length > 0) {
          rate = trend.at(-1)?.v ?? 0;
        }
      }
    } catch {
      // Ignore trend error if live rate succeeded
    }

    // Secondary fallback: Frankfurter latest if still zero
    if (!rate) {
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${target}`,
          { signal: AbortSignal.timeout(6000) },
        );
        if (res.ok) {
          const json = await res.json();
          rate = json.rates?.[target] ?? 0;
        }
      } catch {
        // Fallback
      }
    }

    return { rate, base, target, trend };
  });
