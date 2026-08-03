import countries from "world-countries";
import type { CountryData } from "../services/geo-api";
import { continentOf, drivingSide } from "../data/country-facts";

export async function getCountry(params: { code?: string; data?: { code?: string } } | string): Promise<CountryData> {
  let rawCode = "";
  if (typeof params === "string") {
    rawCode = params;
  } else if (params && typeof params === "object") {
    rawCode = params.code || params.data?.code || "";
  }
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Za-z]{2,3}$/.test(code)) throw new Error(`Invalid country code: ${rawCode}`);

  const c = (countries as any[]).find(
    (x) => x.cca2 === code || x.cca3 === code,
  );
  if (!c) throw new Error(`Unknown country: ${code}`);
  const cur = Object.entries(c.currencies ?? {})[0] as [string, any] | undefined;
  const native = Object.values(c.name?.nativeName ?? {})[0] as any;

  let population = 0;
  let populationYear = "";
  try {
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${c.cca2}/indicator/SP.POP.TOTL?format=json&mrnev=1`,
    );
    if (res.ok) {
      const wb = (await res.json()) as any;
      population = wb?.[1]?.[0]?.value ?? 0;
      populationYear = wb?.[1]?.[0]?.date ?? "";
    }
  } catch {
    population = 0;
  }
  return {
    name: c.name?.common ?? "",
    nativeName: native?.common ?? c.name?.official ?? "",
    flag: `https://flagcdn.com/w80/${String(c.cca2).toLowerCase()}.png`,
    capital: c.capital?.[0] ?? "—",
    population,
    populationYear,
    area: c.area ?? 0,
    currencyCode: cur?.[0] ?? "USD",
    currencyName: cur?.[1]?.name ?? "US Dollar",
    callingCode: `${c.idd?.root ?? ""}${c.idd?.suffixes?.[0] ?? ""}`,
    languages: Object.values(c.languages ?? {}).join(", "),
    region: c.region ?? "—",
    subregion: c.subregion ?? "—",
    continent: continentOf(c.cca2, c.region, c.subregion),
    drivingSide: drivingSide(c.cca2),
    code: String(c.cca2 ?? "").toLowerCase(),
    tld: c.tld?.[0] ?? "—",
    latlng: c.latlng ?? [],
  };
}
