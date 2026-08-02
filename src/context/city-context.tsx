import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountry } from "../functions/country.functions";
import { getFx } from "../functions/fx.functions";
import {
  DEFAULT_PLACE,
  fetchAir,
  fetchAttractions,
  fetchWeather,
  type Place,
} from "../services/geo-api";

type Ctx = {
  place: Place;
  setPlace: (p: Place) => void;
  recents: Place[];
  isLocating: boolean;
  setIsLocating: (b: boolean) => void;
};

const CityContext = createContext<Ctx | null>(null);

const RECENTS_KEY = "geoscope-recents";
const PLACE_KEY = "geoscope-place";

function readPlaceFromUrl(): Place | null {
  const p = new URLSearchParams(window.location.search);
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  if (!p.get("lat") || !p.get("lng") || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return {
    id: Date.now(),
    name: p.get("name") ?? "Shared location",
    country: p.get("country") ?? "",
    countryCode: p.get("cc") ?? "",
    latitude: lat,
    longitude: lng,
    timezone: p.get("tz") ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [place, setPlaceState] = useState<Place>(DEFAULT_PLACE);
  const [recents, setRecents] = useState<Place[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // restore shared link / last place after hydration
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (r) =>
              r &&
              typeof r === "object" &&
              typeof r.name === "string" &&
              Number.isFinite(r.latitude) &&
              Number.isFinite(r.longitude),
          );
          setRecents(valid);
        }
      }
      const shared = readPlaceFromUrl();
      if (shared) {
        setPlaceState(shared);
        return;
      }
      const last = window.localStorage.getItem(PLACE_KEY);
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed && parsed.name && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setPlaceState(parsed);
        }
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const setPlace = useCallback((p: Place) => {
    if (
      !p ||
      typeof p !== "object" ||
      !p.name ||
      !Number.isFinite(p.latitude) ||
      !Number.isFinite(p.longitude)
    ) {
      console.error("Invalid place object rejected by setPlace:", p);
      return;
    }

    const safePlace: Place = {
      id: p.id || Date.now(),
      name: String(p.name),
      country: String(p.country || ""),
      countryCode: String(p.countryCode || "").toUpperCase(),
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      timezone: p.timezone ? String(p.timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(p.admin1 ? { admin1: String(p.admin1) } : {}),
      ...(Number.isFinite(p.elevation) ? { elevation: Number(p.elevation) } : {}),
      ...(Number.isFinite(p.population) ? { population: Number(p.population) } : {}),
    };

    setPlaceState(safePlace);
    try {
      window.localStorage.setItem(PLACE_KEY, JSON.stringify(safePlace));
      setRecents((prev) => {
        const safePrev = Array.isArray(prev)
          ? prev.filter((r) => r && typeof r === "object" && typeof r.name === "string")
          : [];
        const next = [
          safePlace,
          ...safePrev.filter(
            (r) => r.name !== safePlace.name || (r.country || "") !== safePlace.country,
          ),
        ].slice(0, 6);
        window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
        return next;
      });
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({ place, setPlace, recents, isLocating, setIsLocating }),
    [place, setPlace, recents, isLocating, setIsLocating],
  );
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used inside CityProvider");
  return ctx;
}

const common = { staleTime: 5 * 60_000, retry: 1 } as const;

export function useWeather() {
  const { place } = useCity();
  return useQuery({
    queryKey: ["weather", place.latitude, place.longitude],
    queryFn: () => fetchWeather(place),
    ...common,
  });
}

export function useAir() {
  const { place } = useCity();
  return useQuery({
    queryKey: ["air", place.latitude, place.longitude],
    queryFn: () => fetchAir(place),
    ...common,
  });
}

export function useCountry() {
  const { place } = useCity();
  return useQuery({
    queryKey: ["country", place.countryCode],
    queryFn: () => getCountry({ data: { code: place.countryCode } }),
    enabled: Boolean(place.countryCode),
    staleTime: 24 * 3600_000,
    retry: 1,
  });
}

export function useFx(base = "USD") {
  const { data: country } = useCountry();
  const target = country?.currencyCode ?? "";
  return useQuery({
    queryKey: ["fx", base, target],
    queryFn: () => getFx({ data: { base, target } }),
    enabled: Boolean(target),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

export function useAttractions() {
  const { place } = useCity();
  return useQuery({
    queryKey: ["attractions-v5", place.name, place.latitude, place.longitude],
    queryFn: () => fetchAttractions(place),
    staleTime: 24 * 3600_000,
    retry: 1,
  });
}

/** Ticking clock for live time panels. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
