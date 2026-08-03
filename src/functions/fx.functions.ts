import type { FxData } from "../services/geo-api";

export async function getFx(params: { base?: string; target?: string; data?: { base?: string; target?: string } }): Promise<FxData> {
  const base = (params?.base || params?.data?.base || "USD").toUpperCase();
  const target = (params?.target || params?.data?.target || "EUR").toUpperCase();
  const ok = (s: string) => /^[A-Za-z]{3}$/.test(s);
  if (!ok(base) || !ok(target)) throw new Error("Invalid currency code");
  if (base === target) return { rate: 1, base, target, trend: [] };

  let rate = 0;
  try {
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
    // Ignore
  }

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
}
