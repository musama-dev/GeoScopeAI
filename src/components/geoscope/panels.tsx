import {
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Droplets,
  Wind,
  Gauge,
  Eye,
  CloudDrizzle,
  ArrowLeftRight,
  Shield,
  Hotel,
  Utensils,
  Plug,
  CalendarDays,
  Coins,
  Phone,
  Globe,
  Wifi,
  Zap,
  Signal,
  Building2,
  Loader2,
  ArrowRight,
  Car,
  Languages,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  aqiCategory,
  CITY_PHOTO_MAP,
  cleanCityName,
  cleanLandmarkTitle,
  fetchHeroPhoto,
  formatOffset,
  isValidPhotoUrl,
  moonPhase,
  normalizeCountryName,
  offsetHours,
  timeDiffFromLocal,
  tzName,
  tzTime,
  weatherLabel,
} from "../../services/geo-api";
import {
  useAir,
  useAttractions,
  useCity,
  useCountry,
  useFx,
  useNow,
  useWeather,
} from "../../context/city-context";
import { ConnectionPill } from "./offline";
import {
  MoonDisc,
  SolarNoonGlyph,
  SunriseGlyph,
  SunsetGlyph,
  WaterDrop,
  WeatherGlyph,
} from "./icons";
import { moonTimes } from "../../services/astro";
import { getFx } from "../../functions/fx.functions";
import { safetyTone, travelFacts } from "../../data/travel-facts";
import { useEffect, useState } from "react";

/* ---------------------------------- shared ---------------------------------- */

function Card({
  children,
  className = "",
  title,
  action,
  titleIcon,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  titleIcon?: React.ReactNode;
}) {
  return (
    <section className={`glass flex h-full flex-col rounded-[22px] p-[14px] ${className}`}>
      {title && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {titleIcon}
            <h2 className="text-[14px] leading-none font-semibold tracking-[-0.01em]">{title}</h2>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}


export function AstronomySkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 shimmer-skeleton rounded-full" />
          <div className="h-4 w-1/2 shimmer-skeleton rounded-full" />
          <div className="h-4 w-2/3 shimmer-skeleton rounded-full" />
        </div>
        <div className="h-16 w-16 rounded-full shimmer-skeleton shrink-0" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
      </div>
    </div>
  );
}

export function CurrentWeatherSkeleton() {
  return (
    <div className="space-y-3.5 py-1">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-28 shimmer-skeleton rounded-2xl" />
          <div className="h-4 w-36 shimmer-skeleton rounded-full" />
          <div className="h-3 w-24 shimmer-skeleton rounded-full" />
        </div>
        <div className="h-14 w-14 rounded-full shimmer-skeleton shrink-0" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
        <div className="h-5 w-full shimmer-skeleton rounded-full" />
      </div>
    </div>
  );
}

export function HourlyForecastSkeleton() {
  return (
    <div className="flex flex-col justify-between h-full space-y-3 py-1">
      <div className="flex gap-2 overflow-x-auto py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 w-14 shrink-0 rounded-2xl shimmer-skeleton" />
        ))}
      </div>
      <div className="h-10 w-full rounded-2xl shimmer-skeleton mt-2" />
    </div>
  );
}

export function TenDayForecastSkeleton() {
  return (
    <div className="space-y-2.5 py-1">
      <div className="h-24 w-full rounded-2xl shimmer-skeleton mb-2" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-6 w-full rounded-full shimmer-skeleton" />
      ))}
    </div>
  );
}

export function AirQualitySkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center gap-4">
        <div className="h-20 w-24 rounded-2xl shimmer-skeleton shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-full shimmer-skeleton rounded-full" />
          <div className="h-4 w-3/4 shimmer-skeleton rounded-full" />
          <div className="h-4 w-5/6 shimmer-skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CountryInfoSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl shimmer-skeleton shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-44 shimmer-skeleton rounded-full" />
          <div className="h-3 w-28 shimmer-skeleton rounded-full" />
        </div>
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="h-6 w-full shimmer-skeleton rounded-full" />
        <div className="h-6 w-full shimmer-skeleton rounded-full" />
        <div className="h-6 w-full shimmer-skeleton rounded-full" />
        <div className="h-6 w-full shimmer-skeleton rounded-full" />
        <div className="h-6 w-full shimmer-skeleton rounded-full" />
      </div>
    </div>
  );
}

export function AttractionsSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[135px] rounded-[18px] shimmer-skeleton" />
        ))}
      </div>
      <div className="h-20 w-full rounded-[20px] shimmer-skeleton mt-2" />
    </div>
  );
}

export function CurrencySkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-10 rounded-2xl shimmer-skeleton" />
        <div className="h-10 rounded-2xl shimmer-skeleton" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-12 rounded-2xl shimmer-skeleton" />
        <div className="h-12 rounded-2xl shimmer-skeleton" />
      </div>
      <div className="h-24 rounded-2xl shimmer-skeleton mt-2" />
    </div>
  );
}

export function WikipediaSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex gap-3.5">
        <div className="h-[125px] w-[112px] rounded-[20px] shimmer-skeleton shrink-0" />
        <div className="space-y-2.5 flex-1 pt-1">
          <div className="h-4 w-full rounded-full shimmer-skeleton" />
          <div className="h-4 w-full rounded-full shimmer-skeleton" />
          <div className="h-4 w-full rounded-full shimmer-skeleton" />
          <div className="h-4 w-3/4 rounded-full shimmer-skeleton" />
        </div>
      </div>
    </div>
  );
}

function Failed({ what }: { what: string }) {
  return <p className="py-6 text-[12px] text-muted-foreground">Couldn't load {what} right now.</p>;
}

export function WeatherIcon({
  code,
  isDay = true,
  className = "",
}: {
  code: number;
  isDay?: boolean;
  className?: string;
  strokeWidth?: number;
}) {
  return <WeatherGlyph code={code} isDay={isDay} className={className} />;
}

const nf = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(n);

/* ---------------------------------- hero ------------------------------------ */

export function CityHero() {
  const { place } = useCity();
  const { data: weather } = useWeather();
  const { data: attractions } = useAttractions();
  const { data: country } = useCountry();
  const now = useNow();
  const local = tzTime(place.timezone, now);
  const off = offsetHours(place.timezone, now);
  const { data: cityPhoto } = useQuery({
    queryKey: ["hero-photo-v13", place.name, place.country, country?.capital ?? ""],
    queryFn: async () => (await fetchHeroPhoto(place, country?.capital)) ?? null,
    staleTime: 24 * 3600_000,
  });

  const citySimpleName = cleanCityName(place.name);
  const normCountry = normalizeCountryName(place.country);

  // 1. Direct Curated Famous City match
  const curatedCityPhoto =
    (CITY_PHOTO_MAP && CITY_PHOTO_MAP[citySimpleName]) ??
    (CITY_PHOTO_MAP && CITY_PHOTO_MAP[place.name]);

  // 2. Attractions / Gallery API photo for the searched city (User request for random cities)
  const galleryPhoto = attractions?.find((a) => a.image && isValidPhotoUrl(a.image))?.image;

  // 3. Dynamic fetched photo
  const dynamicCityPhoto = cityPhoto && isValidPhotoUrl(cityPhoto) ? cityPhoto : null;

  // 4. Country landmark fallback
  const countryLandmark =
    (CITY_PHOTO_MAP && normCountry ? CITY_PHOTO_MAP[normCountry] : null) ??
    (CITY_PHOTO_MAP && CITY_PHOTO_MAP[place.country]) ??
    "/images/faisal-mosque.jpg";

  // Priority: Curated Famous City -> Gallery Section Photo -> Dynamic Search Photo -> Country Landmark
  const heroImg = curatedCityPhoto ?? galleryPhoto ?? dynamicCityPhoto ?? countryLandmark;
  const fallbackImg = curatedCityPhoto ?? countryLandmark;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-glass-border shadow-[var(--glass-shadow)] min-h-[330px] flex flex-col justify-between p-3 pb-0">
      {heroImg ? (
        <img
          src={heroImg}
          alt={`${place.name}, ${place.country}`}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (fallbackImg && target.src !== fallbackImg) {
              target.src = fallbackImg;
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(160deg,oklch(0.25_0.06_260),oklch(0.15_0.04_260))]" />
      )}
      {/* Soft gradient overlay for optimal contrast */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.05)_45%,rgba(0,0,0,0.4)_100%)]" />

      {/* Top Header Information */}
      <div className="relative z-10 p-2 text-white drop-shadow-md">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {place.name}, {place.country}
          </h2>
          <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        </div>

        <p className="mt-0.5 flex items-center gap-2 text-xs font-medium text-white/90">
          {place.countryCode ? (
            <span className="grid h-4.5 w-4.5 place-items-center overflow-hidden rounded-full border border-white/40 shadow-xs shrink-0 bg-white">
              <img
                src={`https://flagcdn.com/w80/${place.countryCode.toLowerCase()}.png`}
                alt={place.country}
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <span className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[9px] font-bold text-white backdrop-blur-sm border border-white/30">
              {place.countryCode}
            </span>
          )}
          {[place.admin1, place.country].filter(Boolean).join(", ")}
        </p>

        <div className="mt-1.5 space-y-0.5 text-[10.5px] text-white/80 font-mono tracking-tight">
          <p>
            {Math.abs(place.latitude).toFixed(4)}° {place.latitude >= 0 ? "N" : "S"},{" "}
            {Math.abs(place.longitude).toFixed(4)}° {place.longitude >= 0 ? "E" : "W"}
          </p>
          <p>
            Elevation: {place.elevation != null ? `${nf(place.elevation)} m` : "97 m"}
          </p>
        </div>
      </div>

      {/* Crystal Glass Bottom Overlay — Merged 100% into bottom and side borders */}
      <div
        className="relative z-10 -mx-3 w-[calc(100%+1.5rem)] rounded-t-[1.75rem] rounded-b-none border-t border-white/30 bg-black/20 p-3 sm:p-3.5 text-white shadow-md"
        style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      >
        {/* Weather section inside crystal glass card */}
        <div className="flex items-center gap-2.5 pb-1.5">
          <WeatherIcon
            code={weather ? weather.current.code : 0}
            isDay={weather ? weather.current.isDay : true}
            className="h-7 w-7 shrink-0 drop-shadow-md"
            strokeWidth={1.8}
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
              {weather ? Math.round(weather.current.temperature) : 23}°C
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold text-white/95 leading-none">
                {weather ? weatherLabel(weather.current.code) : "Sunny"}
              </p>
              <p className="text-[9px] text-white/75 leading-none mt-0.5">
                Feels like {weather ? Math.round(weather.current.apparent) : 24}°C
              </p>
            </div>
          </div>
        </div>

        {/* Dual Crystal Glass Sub-Cards */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <div
            className="rounded-xl bg-white/15 p-1.5 px-2 border border-white/20 shadow-xs"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          >
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-white/70">Local Time</p>
            <p className="mt-0.5 text-xs font-bold tracking-tight text-white drop-shadow-sm" suppressHydrationWarning>
              {local.timeWithSeconds}
            </p>
            <p className="mt-0.5 text-[8.5px] font-medium text-white/80 truncate" suppressHydrationWarning>
              {local.date}
            </p>
          </div>
          <div
            className="rounded-xl bg-white/15 p-1.5 px-2 border border-white/20 shadow-xs"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          >
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-white/70">UTC Offset</p>
            <p className="mt-0.5 text-xs font-bold tracking-tight text-white drop-shadow-sm">
              {formatOffset(off)}
            </p>
            <p className="mt-0.5 text-[8.5px] font-medium text-amber-300 font-semibold truncate" suppressHydrationWarning>
              {timeDiffFromLocal(place.timezone, now)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- map ------------------------------------ */

export { MapPanel } from "./MapPanel";

/* ---------------------------------- time ------------------------------------ */

const DIAL = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

function AnalogClock({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const s = date.getSeconds() + date.getMilliseconds() / 1000;
  const mi = date.getMinutes() + s / 60;
  const hr = (date.getHours() % 12) + mi / 60;

  const hand = (deg: number, len: number) => ({
    x2: (50 + Math.sin((deg * Math.PI) / 180) * len).toFixed(2),
    y2: (50 - Math.cos((deg * Math.PI) / 180) * len).toFixed(2),
  });
  const hourH = hand(hr * 30, 21);
  const minH = hand(mi * 6, 30);
  const secH = hand(s * 6, 33);
  const secTail = hand(s * 6 + 180, 8);

  return (
    <svg viewBox="0 0 100 100" className="h-[86px] w-[86px]" suppressHydrationWarning>
      {/* dial */}
      <circle cx="50" cy="50" r="47" className="fill-card stroke-border" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="44" fill="none" className="stroke-border" strokeWidth="0.5" />
      {/* minute + hour ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const big = i % 5 === 0;
        const r1 = big ? 38.5 : 40.5;
        const r2 = 42.5;
        return (
          <line
            key={i}
            x1={(50 + Math.sin(a) * r1).toFixed(2)}
            y1={(50 - Math.cos(a) * r1).toFixed(2)}
            x2={(50 + Math.sin(a) * r2).toFixed(2)}
            y2={(50 - Math.cos(a) * r2).toFixed(2)}
            className={big ? "stroke-foreground" : "stroke-muted-foreground"}
            strokeWidth={big ? 1.1 : 0.45}
            strokeLinecap="round"
            opacity={big ? 0.7 : 0.4}
          />
        );
      })}
      {/* hour numerals */}
      {DIAL.map((n, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <text
            key={n}
            x={(50 + Math.sin(a) * 32).toFixed(2)}
            y={(50 - Math.cos(a) * 32 + 2.8).toFixed(2)}
            textAnchor="middle"
            fontSize="8"
            fontWeight="500"
            className="fill-foreground"
            opacity="0.75"
          >
            {n}
          </text>
        );
      })}
      {mounted && (
        <g suppressHydrationWarning>
          <line
            x1="50"
            y1="50"
            x2={hourH.x2}
            y2={hourH.y2}
            className="stroke-foreground"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="50"
            x2={minH.x2}
            y2={minH.y2}
            className="stroke-foreground"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <line
            x1={secTail.x2}
            y1={secTail.y2}
            x2={secH.x2}
            y2={secH.y2}
            className="stroke-destructive"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="2.6" className="fill-foreground" />
          <circle cx="50" cy="50" r="1.2" className="fill-destructive" />
        </g>
      )}
    </svg>
  );
}

export function TimeGlance() {
  const { place } = useCity();
  const now = useNow();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const here = tzTime(localTz, now);
  const there = tzTime(place.timezone, now);

  return (
    <Card title="Time at a Glance" action={<Globe className="h-4 w-4 text-muted-foreground" />}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="text-[13px] font-medium">Your Local Time</p>
          <p className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            {here.short}
          </p>
          <p className="mt-1 text-[26px] leading-none font-semibold" suppressHydrationWarning>
            {here.time}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatOffset(offsetHours(localTz, now))}
          </p>
        </div>
        <div className="glass-chip grid h-24 w-24 place-items-center rounded-full">
          <AnalogClock date={now} />
        </div>

        <div className="text-right">
          <p className="text-[13px] font-medium">Destination Time</p>
          <p className="text-[11px] text-muted-foreground">{there.short}</p>
          <p className="mt-1 text-[26px] leading-none font-semibold" suppressHydrationWarning>
            {there.time}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatOffset(offsetHours(place.timezone, now))}
          </p>
        </div>
      </div>
      <div className="glass-chip mt-3 flex items-center justify-center gap-3 rounded-full px-3 py-2 text-[12px]">
        <span className="text-muted-foreground">Difference</span>
        <span
          className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground"
          suppressHydrationWarning
        >
          {timeDiffFromLocal(place.timezone, now)}
        </span>
      </div>
    </Card>
  );
}

/* -------------------------------- astronomy --------------------------------- */

// Open-Meteo returns naive local-to-the-city timestamps ("2026-07-31T05:05"),
// so format them as-is without applying another timezone shift.
const timeOf = (iso: string | Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(typeof iso === "string" ? new Date(iso) : iso);

export function AstronomyPanel() {
  const { place, isLocating } = useCity();
  const { data: weather, isError } = useWeather();
  const moon = moonPhase();
  const today = weather?.daily[0];
  const [mt, setMt] = useState<{ rise: Date | null; set: Date | null }>({ rise: null, set: null });

  useEffect(() => {
    setMt(moonTimes(new Date(), place.latitude, place.longitude));
  }, [place.latitude, place.longitude]);

  const solarNoon = today
    ? new Date((new Date(today.sunrise).getTime() + new Date(today.sunset).getTime()) / 2)
    : null;

  return (
    <Card
      title="Astronomy"
      action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
      className="flex-1"
    >
      {isError ? (
        <Failed what="astronomy data" />
      ) : isLocating || !today ? (
        <AstronomySkeleton />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ul className="space-y-2.5 text-[12.5px]">
            {(
              [
                [SunriseGlyph, "Sunrise", timeOf(today.sunrise)],
                [SunsetGlyph, "Sunset", timeOf(today.sunset)],
                [SolarNoonGlyph, "Solar Noon", solarNoon ? timeOf(solarNoon) : "—"],
              ] as [typeof SunriseGlyph, string, string][]
            ).map(([Glyph, label, value]) => (
              <li key={label} className="flex items-center gap-2">
                <Glyph className="h-[18px] w-[18px] shrink-0" />
                <span className="text-secondary-foreground">{label}</span>
                <span className="ml-auto font-medium tabular-nums">{value}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <MoonDisc
              illumination={moon.illumination}
              waxing={moon.frac < 0.5}
              className="h-[72px] w-[72px] shrink-0 drop-shadow-sm"
            />
            <div className="min-w-0 text-[12px]">
              <p className="truncate font-medium">{moon.name}</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                Illumination
                <span className="font-semibold text-foreground">{moon.illumination}%</span>
                <ChevronRight className="h-3 w-3" />
              </p>
              <div className="mt-2.5 flex gap-4 text-[11px]">
                <span className="text-muted-foreground">
                  Moonrise
                  <br />
                  <span className="font-medium text-foreground" suppressHydrationWarning>
                    {mt.rise ? timeOf(mt.rise) : "—"}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Moonset
                  <br />
                  <span className="font-medium text-foreground" suppressHydrationWarning>
                    {mt.set ? timeOf(mt.set) : "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------------- weather --------------------------------- */

export function CurrentWeather() {
  const { place, isLocating } = useCity();
  const { data, isError } = useWeather();
  const c = data?.current;

  return (
    <Card title="Current Weather">
      {isError ? (
        <Failed what="weather" />
      ) : isLocating || !c ? (
        <CurrentWeatherSkeleton />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <WeatherIcon code={c.code} isDay={c.isDay} className="h-10 w-10" strokeWidth={1.7} />
                <p className="text-[32px] leading-none font-semibold">
                  {Math.round(c.temperature)}
                  <span className="align-top text-base">°C</span>
                </p>
              </div>
              <p className="mt-2 text-sm font-medium">{weatherLabel(c.code)}</p>
              <p className="text-[11px] text-muted-foreground">
                Feels like {Math.round(c.apparent)}°C
              </p>
            </div>
            <ul className="space-y-1 text-[12px]">
              {(
                [
                  [WaterDrop, "Humidity", `${Math.round(c.humidity)}%`],
                  [Wind, "Wind", `${Math.round(c.windSpeed)} km/h ${dirLabel(c.windDir)}`],
                  [Gauge, "Pressure", `${Math.round(c.pressure)} hPa`],
                  [Eye, "Visibility", `${Math.round(c.visibility / 1000)} km`],
                  [Sun, "UV Index", `${Math.round(c.uv)}`],
                  [CloudDrizzle, "Cloud Cover", `${Math.round(c.cloud)}%`],
                ] as [typeof Sun, string, string][]
              ).map(([Icon, label, value]) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.9} />
                  <span className="text-muted-foreground">{label}</span>
                  <span className="ml-auto font-medium">{value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-glass-border pt-3 text-[12px]">
            <span className="flex items-center gap-2">
              <SunriseGlyph className="h-[18px] w-[18px]" />
              <span className="text-muted-foreground">Sunrise</span>
              <span className="ml-auto font-medium tabular-nums">
                {data.daily[0] ? timeOf(data.daily[0].sunrise) : "—"}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <SunsetGlyph className="h-[18px] w-[18px]" />
              <span className="text-muted-foreground">Sunset</span>
              <span className="ml-auto font-medium tabular-nums">
                {data.daily[0] ? timeOf(data.daily[0].sunset) : "—"}
              </span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function dirLabel(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function HourlyForecast() {
  const { isLocating } = useCity();
  const { data, isError } = useWeather();
  const hours = data?.hourly.slice(0, 9) ?? [];
  const temps = hours.map((h) => h.temp);
  const lo = Math.min(...temps, Infinity);
  const hi = Math.max(...temps, -Infinity);
  const span = Math.max(1, hi - lo);
  const curve = hours.map(
    (h, i) =>
      `${((i + 0.5) / Math.max(1, hours.length)) * 100},${26 - ((h.temp - lo) / span) * 20 - 3}`,
  );

  return (
    <Card title="Hourly Forecast (24h)" className="flex flex-col justify-between h-full">
      {isError ? (
        <Failed what="the hourly forecast" />
      ) : isLocating || !data ? (
        <HourlyForecastSkeleton />
      ) : (
        <div className="flex flex-1 flex-col justify-between pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className="grid gap-1 text-center"
            style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0,1fr))` }}
          >
            {hours.map((h, i) => (
              <div key={h.time} className="flex min-w-0 flex-col items-center gap-1.5">
                <span className="text-[10.5px] text-muted-foreground">
                  {i === 0
                    ? "Now"
                    : new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        hour12: true,
                      })
                        .format(new Date(h.time))
                        .replace(" ", "")}
                </span>
                <WeatherIcon
                  code={h.code}
                  isDay={new Date(h.time).getHours() >= 6 && new Date(h.time).getHours() < 19}
                  className="h-[22px] w-[22px]"
                />
                <span className="text-[13px] font-semibold tabular-nums">{Math.round(h.temp)}°</span>
              </div>
            ))}
          </div>

          <div className="my-auto py-2">
            <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-10 w-full">
              <defs>
                <linearGradient id="hourlyLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.72 0.15 250)" />
                  <stop offset="100%" stopColor="oklch(0.76 0.16 45)" />
                </linearGradient>
              </defs>
              <polyline
                points={curve.join(" ")}
                fill="none"
                stroke="url(#hourlyLine)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {curve.map((p) => {
                const [x, y] = p.split(",");
                return <circle key={p} cx={x} cy={y} r="1.2" fill="oklch(0.72 0.15 250)" />;
              })}
            </svg>
          </div>

          <div
            className="mt-auto grid gap-1 text-center pt-2 pb-0.5 border-t border-white/10"
            style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0,1fr))` }}
          >
            {hours.map((h) => (
              <span
                key={h.time}
                className="flex items-center justify-center gap-0.5 text-[10.5px] font-medium text-primary"
              >
                <WaterDrop className="h-3 w-3" />
                {h.precipProb}%
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function SevenDayForecast() {
  const { data, isError } = useWeather();
  const days = data?.daily.slice(0, 7) ?? [];
  const lo = Math.min(...days.map((d) => d.lo), Infinity);
  const hi = Math.max(...days.map((d) => d.hi), -Infinity);
  const span = Math.max(1, hi - lo);
  const y = (t: number) => 44 - ((t - lo) / span) * 34 - 4;
  const hiPts = days.map((d, i) => `${(i / Math.max(1, days.length - 1)) * 100},${y(d.hi)}`);
  const loPts = days.map((d, i) => `${(i / Math.max(1, days.length - 1)) * 100},${y(d.lo)}`);

  return (
    <Card title="7-Day Forecast">
      {isError ? (
        <Failed what="the forecast" />
      ) : !data ? (
        <TenDayForecastSkeleton />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-2">
            <div className="flex h-[92px] flex-col justify-between text-[9px] text-muted-foreground tabular-nums">
              <span>{Math.round(hi)}°</span>
              <span>{Math.round((hi + lo) / 2)}°</span>
              <span>{Math.round(lo)}°</span>
            </div>
            <div className="relative h-[92px]">
              {[0, 50, 100].map((p) => (
                <span
                  key={p}
                  style={{ top: `${p}%` }}
                  className="absolute inset-x-0 h-px bg-glass-border"
                />
              ))}
              <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 45 / 45%)" />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 45 / 0%)" />
                  </linearGradient>
                </defs>
                <polygon points={`0,48 ${hiPts.join(" ")} 100,48`} fill="url(#tempFill)" />
                <polyline
                  points={hiPts.join(" ")}
                  fill="none"
                  stroke="oklch(0.7 0.16 45)"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={loPts.join(" ")}
                  fill="none"
                  stroke="oklch(0.7 0.13 250)"
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center">
            {days.map((d) => (
              <div key={d.date} className="glass-chip space-y-1 rounded-xl px-1 py-1.5">
                <p className="text-[9.5px] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${d.date}T00:00:00Z`))}
                </p>
                <WeatherIcon code={d.code} className="mx-auto h-[18px] w-[18px]" />
                <p className="text-[10px] font-semibold tabular-nums">
                  {Math.round(d.hi)}°
                  <span className="font-normal text-muted-foreground">/{Math.round(d.lo)}°</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export const TenDayForecast = SevenDayForecast;

/* -------------------------------- air quality ------------------------------- */

export function AirQuality() {
  const { place, isLocating } = useCity();
  const { data, isError } = useAir();
  const cat = data ? aqiCategory(data.usAqi) : null;

  // caps ≈ upper bound of the "unhealthy" breakpoint so bars read like the reference design
  const rows: [string, number, number][] = data
    ? [
        ["PM2.5", data.pm25, 35],
        ["PM10", data.pm10, 50],
        ["CO", data.co, 1000],
        ["NO₂", data.no2, 100],
        ["SO₂", data.so2, 80],
        ["O₃", data.o3, 120],
      ]
    : [];

  return (
    <Card title="Air Quality" className="h-auto self-start">
      {isError ? (
        <Failed what="air quality" />
      ) : isLocating || !data || !cat ? (
        <AirQualitySkeleton />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-[auto_1fr] gap-3.5">
            <div className="glass-chip grid place-items-center rounded-2xl px-3.5 py-2.5 text-center">
              <span className="flex items-center gap-1.5 text-[11.5px] font-medium">
                <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                {cat.label}
              </span>
              <p className="text-[32px] leading-none font-semibold my-1" style={{ color: cat.color }}>
                {data.usAqi}
              </p>
              <p className="text-[10.5px] text-muted-foreground">AQI (US)</p>
            </div>
            <ul className="space-y-1">
              {rows.map(([label, value, cap]) => (
                <li
                  key={label}
                  className="grid grid-cols-[40px_1fr_40px] items-center gap-2 text-[11px]"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (value / cap) * 100)}%`,
                        background:
                          value / cap > 0.66
                            ? "var(--destructive)"
                            : value / cap > 0.33
                              ? "var(--sunny)"
                              : "var(--good)",
                      }}
                    />
                  </span>
                  <span className="text-right font-medium">{nf(value, 1)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

/* --------------------------------- country ---------------------------------- */

export function CountryInfo() {
  const { place, isLocating } = useCity();
  const { data, isError } = useCountry();
  const [open, setOpen] = useState(false);

  return (
    <Card title="Country Information" className="h-auto self-start">
      {isError ? (
        <Failed what="country data" />
      ) : isLocating || !data ? (
        <CountryInfoSkeleton />
      ) : (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          {data.code ? (
            <img
              src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${data.code}/vector.svg`}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-1 right-0 h-32 w-32 object-contain opacity-[0.13] select-none sm:h-40 sm:w-40 dark:opacity-20 dark:invert"
            />
          ) : null}

          <div className="relative mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200/80 bg-white shadow-md">
              {data.flag ? (
                <img src={data.flag} alt={`${data.name} flag`} className="h-full w-full scale-125 object-cover" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg leading-tight font-semibold">{data.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{data.nativeName}</p>
            </div>
          </div>

          <ul className="relative space-y-1.5 text-[12px]">
            {(
              [
                ["Capital", data.capital],
                ["Population", `${nf(data.population / 1e6, 2)} Million`],
                ["Area", `${nf(data.area)} km²`],
                ["Currency", `${data.currencyName} (${data.currencyCode})`],
                ["Calling Code", data.callingCode || "—"],
                ["Languages", data.languages || "—"],
                ["Region", data.region],
                ["Continent", data.continent],
                ["Driving Side", data.drivingSide],
              ] as [string, string][]
            ).map(([k, v]) => (
              <li key={k} className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)] gap-2 sm:gap-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="truncate font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function CountryDetailPanel({
  data,
  place,
  onClose,
}: {
  data: NonNullable<ReturnType<typeof useCountry>["data"]>;
  place: ReturnType<typeof useCity>["place"];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const left = data.drivingSide === "Left";
  const rows: [string, string][] = [
    ["Continent", data.continent],
    ["Region", data.region],
    ["Subregion", data.subregion || "—"],
    ["Driving Side", `${data.drivingSide}-hand traffic`],
    ["Steering Wheel", left ? "Right side of the car" : "Left side of the car"],
    ["Capital", data.capital],
    ["Coordinates", data.latlng?.length === 2 ? `${data.latlng[0]!.toFixed(2)}°, ${data.latlng[1]!.toFixed(2)}°` : "—"],
    ["Internet TLD", data.tld],
    ["Selected Place", `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}`],
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-[oklch(0.2_0.03_260/35%)] backdrop-blur-[2px]">
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 cursor-default" />
      <aside className="glass-strong relative m-3 flex w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl p-5 shadow-2xl sm:m-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-glass-border bg-primary-foreground">
              <img src={data.flag} alt={`${data.name} flag`} className="h-full w-full object-cover" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg leading-tight font-semibold">{data.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{data.nativeName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass-chip grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
          >
            ✕
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3">
            <p className="text-[11px] text-muted-foreground">Continent</p>
            <p className="mt-1 text-base font-semibold">{data.continent}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{data.subregion || data.region}</p>
          </div>
          <div className="glass rounded-2xl p-3">
            <p className="text-[11px] text-muted-foreground">Driving Side</p>
            <p className="mt-1 text-base font-semibold">{data.drivingSide}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {left ? "Keep left — steering on the right" : "Keep right — steering on the left"}
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-[13px]">
          {rows.map(([k, v]) => (
            <li key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="truncate font-medium">{v}</span>
            </li>
          ))}
        </ul>

        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(data.name)}`}
          target="_blank"
          rel="noreferrer"
          className="glass-chip mt-auto flex items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-medium transition hover:brightness-105"
        >
          Read full article on Wikipedia
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </aside>
    </div>
  );
}


/* ------------------------------- attractions -------------------------------- */

export function Attractions() {
  const { place, isLocating } = useCity();
  const { data, isError } = useAttractions();
  const { data: country } = useCountry();
  const { data: weather } = useWeather();

  const facts = travelFacts(country?.code, country?.region);

  return (
    <Card title="Top Attractions" className="flex flex-col justify-between h-full">
      <div className="flex flex-1 flex-col justify-between space-y-3">
        {isError ? (
          <Failed what="nearby attractions" />
        ) : isLocating || !data ? (
          <AttractionsSkeleton />
        ) : data.length === 0 ? (
          <p className="py-2 text-[12px] text-muted-foreground">No notable places found nearby.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {data.slice(0, 3).map((a) => {
              const cleanTitle = (a.title || "")
                .split("-taisha")[0]!
                .split(" (")[0]!
                .replace(" - National Museum", "")
                .trim();
              const fallbackPhoto = CITY_PHOTO_MAP[place.name] || CITY_PHOTO_MAP[cleanCityName(place.name)] || "/images/faisal-mosque.jpg";
              return (
                <a
                  key={a.title}
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(a.title.replace(/ /g, "_"))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block h-[140px] sm:h-[145px] overflow-hidden rounded-[18px] group border border-white/10 shadow-sm"
                >
                  <img
                    src={a.image || fallbackPhoto}
                    alt={cleanTitle}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackPhoto;
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.3)_40%,rgba(0,0,0,0.85)_100%)] p-2.5 text-center text-white">
                    <span className="block text-[12px] font-bold leading-snug text-white drop-shadow-md">{cleanTitle}</span>
                    <span className="block text-[10px] font-medium text-white/90 mt-0.5 drop-shadow-sm">
                      {place.name || place.admin1 || "Nearby"}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        <div>
          <h3 className="mb-2 text-[13px] font-semibold tracking-tight">Travel Essentials</h3>
          <div className="glass-chip rounded-[20px] p-3.5 space-y-3.5 border border-white/10">
            {/* Top Row: 3 columns */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500/20 text-orange-500">
                    <CalendarDays className="h-2.5 w-2.5" />
                  </span>
                  Best Time to Visit
                </p>
                <p className="mt-1 font-semibold text-[11px] text-center">
                  Apr–Jun
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500/20 text-blue-500 font-bold text-[9px]">
                    $
                  </span>
                  Currency
                </p>
                <p className="mt-1 font-semibold text-[11px] text-center">
                  {country
                    ? `${country.currencyCode} (${country.currencyName.split(" ")[0]})`
                    : "USD (Dollar)"}
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-indigo-500/20 text-indigo-500">
                    <Plug className="h-2.5 w-2.5" />
                  </span>
                  Power Plug
                </p>
                <p className="mt-1 font-semibold text-[11px] text-center">
                  {facts.plug ? facts.plug.split(" (")[0] : "Type G"}
                </p>
              </div>
            </div>

            {/* Bottom Row: 4 columns */}
            <div className="grid grid-cols-4 gap-2 text-[11px] items-end pt-1 border-t border-white/5">
              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <Shield className="h-2.5 w-2.5" />
                  </span>
                  Safety
                </p>
                <p className="mt-1 font-semibold text-[11px] text-emerald-500 text-center">
                  {facts.safety || "Very Safe"}
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500/20 text-orange-500">
                    <Hotel className="h-2.5 w-2.5" />
                  </span>
                  Hotel Price
                </p>
                <p className="mt-1 font-semibold text-[11px] text-center">
                  <span className="font-bold mr-1">$$$</span>
                  {facts.hotel ? facts.hotel.replace(" USD", "") : "120 – 320"}
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500/20 text-amber-500">
                    <Utensils className="h-2.5 w-2.5" />
                  </span>
                  Meal Price
                </p>
                <p className="mt-1 font-semibold text-[11px] text-center">
                  <span className="font-bold mr-1">$$</span>
                  {facts.meal ? facts.meal.replace(" USD", "") : "12 – 30"}
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="inline-block rounded-full bg-rose-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-rose-500 mb-1">
                  Emergency
                </span>
                <p className="font-semibold text-[11px] text-rose-500 text-center">
                  {(facts.emergency || "999").split("/")[0]!.trim()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function bestSeason(lat: number) {
  if (Math.abs(lat) < 23.5) return "Nov–Mar";
  return lat > 0 ? "Apr–Jun & Sep–Oct" : "Oct–Dec & Mar–Apr";
}

/* --------------------------------- currency --------------------------------- */

const FX_CURRENCIES: [string, string][] = [
  ["USD", "US Dollar"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["AED", "UAE Dirham"],
  ["PKR", "Pakistani Rupee"],
  ["INR", "Indian Rupee"],
  ["SAR", "Saudi Riyal"],
  ["JPY", "Japanese Yen"],
  ["AUD", "Australian Dollar"],
  ["CAD", "Canadian Dollar"],
  ["CHF", "Swiss Franc"],
  ["CNY", "Chinese Yuan"],
  ["QAR", "Qatari Riyal"],
  ["KWD", "Kuwaiti Dinar"],
  ["OMR", "Omani Rial"],
  ["BHD", "Bahraini Dinar"],
  ["EGP", "Egyptian Pound"],
  ["TRY", "Turkish Lira"],
  ["MYR", "Malaysian Ringgit"],
  ["IDR", "Indonesian Rupiah"],
  ["THB", "Thai Baht"],
  ["SGD", "Singapore Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["NZD", "New Zealand Dollar"],
  ["KRW", "South Korean Won"],
  ["RUB", "Russian Ruble"],
  ["BRL", "Brazilian Real"],
  ["ZAR", "South African Rand"],
  ["MXN", "Mexican Peso"],
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["PLN", "Polish Zloty"],
  ["HUF", "Hungarian Forint"],
  ["CZK", "Czech Koruna"],
  ["ILS", "Israeli Shekel"],
  ["PHP", "Philippine Peso"],
  ["VND", "Vietnamese Dong"],
  ["NGN", "Nigerian Naira"],
  ["KES", "Kenyan Shilling"],
  ["ZMW", "Zambian Kwacha"],
  ["LKR", "Sri Lankan Rupee"],
  ["BDT", "Bangladeshi Taka"],
  ["NPR", "Nepalese Rupee"],
  ["AFN", "Afghan Afghani"],
  ["ALL", "Albanian Lek"],
  ["AMD", "Armenian Dram"],
  ["ANG", "Netherlands Antillean Guilder"],
  ["AOA", "Angolan Kwanza"],
  ["ARS", "Argentine Peso"],
  ["AWG", "Aruban Florin"],
  ["AZN", "Azerbaijani Manat"],
  ["BAM", "Bosnia-Herzegovina Mark"],
  ["BBD", "Barbadian Dollar"],
  ["BGN", "Bulgarian Lev"],
  ["BIF", "Burundian Franc"],
  ["BMD", "Bermudian Dollar"],
  ["BND", "Brunei Dollar"],
  ["BOB", "Bolivian Boliviano"],
  ["BSD", "Bahamian Dollar"],
  ["BTN", "Bhutanese Ngultrum"],
  ["BWP", "Botswana Pula"],
  ["BYN", "Belarusian Ruble"],
  ["BZD", "Belize Dollar"],
  ["CDF", "Congolese Franc"],
  ["CLP", "Chilean Peso"],
  ["COP", "Colombian Peso"],
  ["CRC", "Costa Rican Colón"],
  ["CUP", "Cuban Peso"],
  ["CVE", "Cape Verdean Escudo"],
  ["DJF", "Djiboutian Franc"],
  ["DOP", "Dominican Peso"],
  ["DZD", "Algerian Dinar"],
  ["ERN", "Eritrean Nakfa"],
  ["ETB", "Ethiopian Birr"],
  ["FJD", "Fijian Dollar"],
  ["FKP", "Falkland Islands Pound"],
  ["GEL", "Georgian Lari"],
  ["GHS", "Ghanaian Cedi"],
  ["GIP", "Gibraltar Pound"],
  ["GMD", "Gambian Dalasi"],
  ["GNF", "Guinean Franc"],
  ["GTQ", "Guatemalan Quetzal"],
  ["GYD", "Guyanese Dollar"],
  ["HNL", "Honduran Lempira"],
  ["HRK", "Croatian Kuna"],
  ["HTG", "Haitian Gourde"],
  ["IQD", "Iraqi Dinar"],
  ["IRR", "Iranian Rial"],
  ["ISK", "Icelandic Króna"],
  ["JMD", "Jamaican Dollar"],
  ["JOD", "Jordanian Dinar"],
  ["KGS", "Kyrgystani Som"],
  ["KHR", "Cambodian Riel"],
  ["KMF", "Comorian Franc"],
  ["KYD", "Cayman Islands Dollar"],
  ["KZT", "Kazakhstani Tenge"],
  ["LAK", "Lao Kip"],
  ["LBP", "Lebanese Pound"],
  ["LRD", "Liberian Dollar"],
  ["LSL", "Lesotho Loti"],
  ["LYD", "Libyan Dinar"],
  ["MAD", "Moroccan Dirham"],
  ["MDL", "Moldovan Leu"],
  ["MGA", "Malagasy Ariary"],
  ["MKD", "Macedonian Denar"],
  ["MMK", "Myanmar Kyat"],
  ["MNT", "Mongolian Tugrik"],
  ["MOP", "Macanese Pataca"],
  ["MRU", "Mauritanian Ouguiya"],
  ["MUR", "Mauritian Rupee"],
  ["MVR", "Maldivian Rufiyaa"],
  ["MWK", "Malawian Kwacha"],
  ["MZN", "Mozambican Metical"],
  ["NAD", "Namibian Dollar"],
  ["NIO", "Nicaraguan Córdoba"],
  ["PAB", "Panamanian Balboa"],
  ["PEN", "Peruvian Sol"],
  ["PGK", "Papua New Guinean Kina"],
  ["PYG", "Paraguayan Guarani"],
  ["RON", "Romanian Leu"],
  ["RSD", "Serbian Dinar"],
  ["RWF", "Rwandan Franc"],
  ["SBD", "Solomon Islands Dollar"],
  ["SCR", "Seychellois Rupee"],
  ["SDG", "Sudanese Pound"],
  ["SOS", "Somali Shilling"],
  ["SRD", "Surinamese Dollar"],
  ["SSP", "South Sudanese Pound"],
  ["STN", "São Tomé and Príncipe Dobra"],
  ["SYP", "Syrian Pound"],
  ["SZL", "Eswatini Lilangeni"],
  ["TJS", "Tajikistani Somoni"],
  ["TMT", "Turkmenistan Manat"],
  ["TND", "Tunisian Dinar"],
  ["TOP", "Tongan Paʻanga"],
  ["TTD", "Trinidad and Tobago Dollar"],
  ["TWD", "New Taiwan Dollar"],
  ["TZS", "Tanzanian Shilling"],
  ["UAH", "Ukrainian Hryvnia"],
  ["UGX", "Ugandan Shilling"],
  ["UYU", "Uruguayan Peso"],
  ["UZS", "Uzbekistani Som"],
  ["VES", "Venezuelan Bolívar"],
  ["VUV", "Vanuatu Vatu"],
  ["WST", "Samoan Tala"],
  ["XAF", "Central African CFA Franc"],
  ["XCD", "East Caribbean Dollar"],
  ["XOF", "West African CFA Franc"],
  ["XPF", "CFP Franc"],
  ["YER", "Yemeni Rial"],
  ["ZWL", "Zimbabwean Dollar"]
];

function CurrencySelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const selected = FX_CURRENCIES.find(([code]) => code === value);
  const currName = selected ? selected[1] : "";

  return (
    <div className="relative w-full">
      {/* Custom styled visible trigger button */}
      <div className="glass-chip flex items-center justify-between min-w-0 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[12px] sm:text-[12.5px] font-medium transition-all pointer-events-none">
        <span className="truncate flex items-center gap-1 min-w-0 pr-1">
          <span className="font-bold text-xs sm:text-sm text-foreground shrink-0">{value}</span>
          {currName && (
            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
              - {currName}
            </span>
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground ml-0.5" />
      </div>

      {/* Invisible native select for full mobile OS picker support */}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer text-foreground bg-background"
      >
        {FX_CURRENCIES.map(([code, name]) => (
          <option key={code} value={code} className="bg-background text-foreground">
            {code} - {name}
          </option>
        ))}
      </select>
    </div>
  );
}

async function fetchFxDirect(base: string, target: string) {
  if (base === target) {
    const today = new Date();
    const trend = Array.from({ length: 30 }, (_, i) => ({
      d: new Date(today.getTime() - (29 - i) * 864e5).toISOString().slice(5, 10),
      v: 1,
    }));
    return { rate: 1, base, target, trend };
  }

  let rate = 0;
  let trend: { d: string; v: number }[] = [];

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (res.ok) {
      const json = await res.json();
      if (json.rates && typeof json.rates[target] === "number") {
        rate = json.rates[target];
      }
    }
  } catch {
    // fallback
  }

  const from = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  try {
    const frankRes = await fetch(
      `https://api.frankfurter.dev/v1/${from}..?base=${base}&symbols=${target}`,
    );
    if (frankRes.ok) {
      const series = await frankRes.json();
      trend = Object.entries(series.rates ?? {})
        .map(([d, r]: [string, any]) => ({ d, v: r[target] as number }))
        .filter((t) => typeof t.v === "number" && !isNaN(t.v))
        .sort((a, b) => a.d.localeCompare(b.d));
      if (!rate && trend.length > 0) {
        rate = trend.at(-1)?.v ?? 0;
      }
    }
  } catch {
    // optional trend fallback
  }

  if (!rate) {
    try {
      const serverResult = await getFx({ data: { base, target } });
      rate = serverResult?.rate ?? 0;
      if (serverResult?.trend?.length) {
        trend = serverResult.trend;
      }
    } catch {
      // return empty
    }
  }

  // Synthesize a smooth realistic 30-day trend series if trend is empty
  if (rate > 0 && trend.length === 0) {
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const dateStr = new Date(today.getTime() - i * 864e5).toISOString().slice(5, 10);
      const wave = Math.sin((i / 29) * Math.PI * 3) * 0.004 * rate;
      const val = Number((rate + wave).toFixed(4));
      trend.push({ d: dateStr, v: val });
    }
  }

  return { rate, base, target, trend };
}

export function CurrencyConverter() {
  const { data: country } = useCountry();
  const localCode = country?.currencyCode ?? "";
  const supported = FX_CURRENCIES.some(([c]) => c === localCode);

  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [touched, setTouched] = useState(false);

  // Whenever user searches any city or country, default to comparing 1 USD to that country's local currency
  useEffect(() => {
    if (localCode) {
      setBase("USD");
      setTarget(localCode === "USD" ? "EUR" : localCode);
      setAmount("1");
    }
  }, [localCode]);

  const {
    data: fx,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["fx-convert", base, target],
    queryFn: () => fetchFxDirect(base, target),
    staleTime: 5 * 60_000,
    retry: 2,
  });

  const trend = fx?.trend ?? [];
  const values = trend.map((t: { v: number }) => t.v);
  const min = Math.min(...values, Infinity);
  const max = Math.max(...values, -Infinity);
  const span = max - min || 1;
  const pts = trend.map(
    (t: { v: number }, i: number) => `${(i / Math.max(1, trend.length - 1)) * 100},${42 - ((t.v - min) / span) * 34}`,
  );
  const amt = Number(amount.replace(",", ".")) || 0;

  const swap = () => {
    setTouched(true);
    setBase(target);
    setTarget(base);
  };

  const yTicks = [
    max,
    max - span * 0.33,
    max - span * 0.66,
    min,
  ];

  const xLabels = trend.length > 0 ? [
    trend[0]?.d,
    trend[Math.floor(trend.length * 0.33)]?.d,
    trend[Math.floor(trend.length * 0.66)]?.d,
    trend[trend.length - 1]?.d,
  ] : [];

  return (
    <Card title="Currency Converter" className="flex flex-col justify-between h-full p-4 sm:p-5">
      <div className="flex flex-1 flex-col justify-between space-y-3 pt-0.5">
        {/* Currency Selectors & Swap Button */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <CurrencySelect
            value={base}
            label="From currency"
            onChange={(v) => {
              setTouched(true);
              setBase(v);
            }}
          />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap currencies"
            className="glass-chip grid h-8.5 w-8.5 shrink-0 place-items-center rounded-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </button>
          <CurrencySelect
            value={target}
            label="To currency"
            onChange={(v) => {
              setTouched(true);
              setTarget(v);
            }}
          />
        </div>

        {/* Amount Input & Converted Result Boxes */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount"
              className="glass-chip w-full min-w-0 rounded-2xl px-3.5 py-2.5 text-lg font-bold outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="glass-chip flex items-center truncate rounded-2xl px-3.5 py-2.5 text-lg font-bold">
            <span>{fx ? nf(amt * fx.rate, 2) : "—"}</span>
          </div>
        </div>

        {/* Integrated Rate Info Line */}
        <div className="flex items-center justify-between text-[11.5px] font-medium text-muted-foreground px-1 py-0.5 border-b border-white/5">
          <span>1 {base} = {nf(fx?.rate ?? 0, 4)} {target}</span>
          <span className="text-[10px] text-blue-500 font-semibold">Live Rate</span>
        </div>

        {/* 30-Day Exchange Rate Trend Chart */}
        {isError || (fx && fx.rate === 0) ? (
          <Failed what="exchange rates" />
        ) : isPending ? (
          <CurrencySkeleton />
        ) : (
          <div className="pt-1 my-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[12px] font-semibold tracking-tight mb-2 text-muted-foreground">
              Exchange Rate Trend (30 Days)
            </h3>
            <div className="grid grid-cols-[34px_1fr] gap-2 items-center">
              <div className="flex h-[80px] flex-col justify-between text-[9.5px] font-medium text-muted-foreground tabular-nums">
                {yTicks.map((v, i) => (
                  <span key={i}>{nf(v, v > 10 ? 0 : 2)}</span>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="relative h-[80px] w-full overflow-hidden rounded-xl bg-primary/5 p-1">
                  <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-full w-full">
                    <defs>
                      <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.17 254 / 40%)" />
                        <stop offset="100%" stopColor="oklch(0.62 0.17 254 / 0%)" />
                      </linearGradient>
                    </defs>
                    <polygon points={`0,44 ${pts.join(" ")} 100,44`} fill="url(#fxFill)" />
                    <polyline
                      points={pts.join(" ")}
                      fill="none"
                      stroke="oklch(0.62 0.17 254)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    {pts.map((p: string, i: number) => {
                      const [x, y] = p.split(",");
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="1.2"
                          fill="oklch(0.62 0.17 254)"
                          stroke="white"
                          strokeWidth="0.4"
                        />
                      );
                    })}
                  </svg>
                </div>
                {xLabels.length > 0 && (
                  <div className="flex justify-between text-[9.5px] font-medium text-muted-foreground px-0.5">
                    {xLabels.map((lbl, i) => (
                      <span key={i}>{lbl}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


/* --------------------------------- quick info -------------------------------- */

export function QuickInfo() {
  const { place } = useCity();
  const { data: country } = useCountry();
  const facts = travelFacts(country?.code, country?.region);

  const rows: [typeof Sun, string, string][] = [
    [Globe, "Internet TLD", country?.tld ?? "—"],
    [Wifi, "IPv4 Availability", facts.ipv4],
    [Signal, "IPv6 Adoption", facts.ipv6],
    [Zap, "Speed Rank", facts.speedRank],
    [Building2, "Top ISP", facts.isp],
    [Signal, "City Population", place.population ? nf(place.population) : "—"],
  ];

  return (
    <Card title="Quick Internet Info">
      <ul className="space-y-2.5 text-[12px]">
        {rows.map(([Icon, label, value]) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
            <span className="truncate text-secondary-foreground">{label}</span>
            <span className="ml-auto truncate font-medium">{value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* --------------------------------- status bar -------------------------------- */

export function StatusBar() {
  return (
    <footer className="glass flex flex-col items-center justify-center gap-1 rounded-3xl px-5 py-3.5 text-center text-xs text-muted-foreground">
      <p className="text-[11px] font-medium tracking-tight text-muted-foreground/90">
        Live Sources: Open-Meteo, OpenStreetMap, World Bank, Frankfurter, Wikipedia
      </p>
      <p className="mt-0.5 text-xs font-semibold tracking-wide text-foreground/90">
        © Made by Muhammad Usama
      </p>
    </footer>
  );
}

/* ----------------------------- wikipedia summary ---------------------------- */

export function WikipediaSummary() {
  const { place } = useCity();

  const { data, isError, isPending } = useQuery({
    queryKey: ["wiki-summary-card", place.name, place.country],
    queryFn: async () => {
      const queryName = place.name === "New York" ? "New_York_City" : place.name;
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryName)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.extract) {
            return {
              title: (json.title || place.name) as string,
              extract: json.extract as string,
              image: (json.thumbnail?.source || json.originalimage?.source) as string | undefined,
              url: (json.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(queryName)}`) as string,
            };
          }
        }
      } catch {
        // fallback
      }

      const fallbackQuery = place.country || "Earth";
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fallbackQuery)}`
      );
      const json = await res.json();
      return {
        title: (json.title || place.name) as string,
        extract: json.extract as string,
        image: (json.thumbnail?.source || json.originalimage?.source) as string | undefined,
        url: (json.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(fallbackQuery)}`) as string,
      };
    },
    staleTime: 30 * 60_000,
  });

  return (
    <Card
      title="Wikipedia Summary"
      titleIcon={
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-900 font-serif font-bold text-[13px] leading-none shadow-sm border border-slate-200 shrink-0">
          W
        </span>
      }
      className="flex flex-col justify-between h-full"
    >
      {isError ? (
        <Failed what="Wikipedia summary" />
      ) : isPending ? (
        <WikipediaSkeleton />
      ) : (
        <div className="flex flex-1 flex-col justify-between pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="block overflow-hidden">
            <div className="float-left mr-3.5 mb-2 mt-1 h-[125px] w-[112px] sm:w-[125px] overflow-hidden rounded-[20px] border border-white/10 shadow-sm shrink-0 bg-primary/5">
              {data?.image ? (
                <img
                  src={data.image}
                  alt={data.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <Globe className="h-8 w-8 opacity-40" />
                </div>
              )}
            </div>

            <p className="text-[12px] leading-relaxed text-secondary-foreground font-normal">
              {data?.extract}
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href={data?.url}
              target="_blank"
              rel="noreferrer"
              className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              View on Wikipedia
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}

/* --------------------------- compare countries --------------------------- */

interface WorldCountry {
  name: string;
  code: string;
  region: string;
  capital: string;
  pop: string;
  currency: string;
  side: string;
  emergency: string;
}

const WORLD_COUNTRIES: WorldCountry[] = [
  { name: "Japan", code: "jp", region: "Asia", capital: "Tokyo", pop: "125.1M", currency: "JPY", side: "Left-hand", emergency: "119" },
  { name: "France", code: "fr", region: "Europe", capital: "Paris", pop: "67.8M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "United States", code: "us", region: "Americas", capital: "Washington D.C.", pop: "331.9M", currency: "USD", side: "Right-hand", emergency: "911" },
  { name: "United Kingdom", code: "gb", region: "Europe", capital: "London", pop: "67.3M", currency: "GBP", side: "Left-hand", emergency: "999" },
  { name: "Pakistan", code: "pk", region: "Asia", capital: "Islamabad", pop: "235.8M", currency: "PKR", side: "Right-hand", emergency: "1122" },
  { name: "Germany", code: "de", region: "Europe", capital: "Berlin", pop: "83.2M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Italy", code: "it", region: "Europe", capital: "Rome", pop: "58.9M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Spain", code: "es", region: "Europe", capital: "Madrid", pop: "47.4M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Canada", code: "ca", region: "Americas", capital: "Ottawa", pop: "38.2M", currency: "CAD", side: "Right-hand", emergency: "911" },
  { name: "Australia", code: "au", region: "Oceania", capital: "Canberra", pop: "25.6M", currency: "AUD", side: "Left-hand", emergency: "000" },
  { name: "Brazil", code: "br", region: "Americas", capital: "Brasília", pop: "214.3M", currency: "BRL", side: "Right-hand", emergency: "192" },
  { name: "China", code: "cn", region: "Asia", capital: "Beijing", pop: "1.41B", currency: "CNY", side: "Right-hand", emergency: "120" },
  { name: "India", code: "in", region: "Asia", capital: "New Delhi", pop: "1.40B", currency: "INR", side: "Right-hand", emergency: "112" },
  { name: "Saudi Arabia", code: "sa", region: "Asia", capital: "Riyadh", pop: "35.9M", currency: "SAR", side: "Right-hand", emergency: "997" },
  { name: "United Arab Emirates", code: "ae", region: "Asia", capital: "Abu Dhabi", pop: "9.9M", currency: "AED", side: "Right-hand", emergency: "999" },
  { name: "Turkey", code: "tr", region: "Eurasia", capital: "Ankara", pop: "84.7M", currency: "TRY", side: "Right-hand", emergency: "112" },
  { name: "South Korea", code: "kr", region: "Asia", capital: "Seoul", pop: "51.7M", currency: "KRW", side: "Right-hand", emergency: "119" },
  { name: "Switzerland", code: "ch", region: "Europe", capital: "Bern", pop: "8.7M", currency: "CHF", side: "Right-hand", emergency: "144" },
  { name: "Netherlands", code: "nl", region: "Europe", capital: "Amsterdam", pop: "17.5M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Egypt", code: "eg", region: "Africa", capital: "Cairo", pop: "109.3M", currency: "EGP", side: "Right-hand", emergency: "123" },
  { name: "South Africa", code: "za", region: "Africa", capital: "Pretoria", pop: "59.3M", currency: "ZAR (Rand)", side: "Left-hand", emergency: "10111" },
  { name: "Singapore", code: "sg", region: "Asia", capital: "Singapore", pop: "5.45M", currency: "SGD (Dollar)", side: "Left-hand", emergency: "995" },
  { name: "Malaysia", code: "my", region: "Asia", capital: "Kuala Lumpur", pop: "32.7M", currency: "MYR (Ringgit)", side: "Left-hand", emergency: "999" },
  { name: "Indonesia", code: "id", region: "Asia", capital: "Jakarta", pop: "273.8M", currency: "IDR (Rupiah)", side: "Left-hand", emergency: "112" },
  { name: "Mexico", code: "mx", region: "Americas", capital: "Mexico City", pop: "126.7M", currency: "MXN (Peso)", side: "Right-hand", emergency: "911" },
  { name: "Afghanistan", code: "af", region: "Asia", capital: "Kabul", pop: "40.1M", currency: "AFN", side: "Right-hand", emergency: "119" },
  { name: "Albania", code: "al", region: "Europe", capital: "Tirana", pop: "2.8M", currency: "ALL", side: "Right-hand", emergency: "112" },
  { name: "Algeria", code: "dz", region: "Africa", capital: "Algiers", pop: "44.9M", currency: "DZD", side: "Right-hand", emergency: "14" },
  { name: "Andorra", code: "ad", region: "Europe", capital: "Andorra la Vella", pop: "77K", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Angola", code: "ao", region: "Africa", capital: "Luanda", pop: "34.5M", currency: "AOA", side: "Right-hand", emergency: "113" },
  { name: "Argentina", code: "ar", region: "Americas", capital: "Buenos Aires", pop: "45.8M", currency: "ARS", side: "Right-hand", emergency: "911" },
  { name: "Armenia", code: "am", region: "Asia", capital: "Yerevan", pop: "2.8M", currency: "AMD", side: "Right-hand", emergency: "911" },
  { name: "Austria", code: "at", region: "Europe", capital: "Vienna", pop: "8.9M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Azerbaijan", code: "az", region: "Asia", capital: "Baku", pop: "10.1M", currency: "AZN", side: "Right-hand", emergency: "112" },
  { name: "Bahamas", code: "bs", region: "Americas", capital: "Nassau", pop: "408K", currency: "BSD", side: "Left-hand", emergency: "911" },
  { name: "Bahrain", code: "bh", region: "Asia", capital: "Manama", pop: "1.5M", currency: "BHD", side: "Right-hand", emergency: "999" },
  { name: "Bangladesh", code: "bd", region: "Asia", capital: "Dhaka", pop: "169.4M", currency: "BDT", side: "Left-hand", emergency: "999" },
  { name: "Barbados", code: "bb", region: "Americas", capital: "Bridgetown", pop: "281K", currency: "BBD", side: "Left-hand", emergency: "911" },
  { name: "Belarus", code: "by", region: "Europe", capital: "Minsk", pop: "9.2M", currency: "BYN", side: "Right-hand", emergency: "112" },
  { name: "Belgium", code: "be", region: "Europe", capital: "Brussels", pop: "11.6M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Belize", code: "bz", region: "Americas", capital: "Belmopan", pop: "400K", currency: "BZD", side: "Right-hand", emergency: "911" },
  { name: "Benin", code: "bj", region: "Africa", capital: "Porto-Novo", pop: "13.0M", currency: "XOF", side: "Right-hand", emergency: "117" },
  { name: "Bhutan", code: "bt", region: "Asia", capital: "Thimphu", pop: "777K", currency: "BTN", side: "Left-hand", emergency: "112" },
  { name: "Bolivia", code: "bo", region: "Americas", capital: "Sucre", pop: "12.1M", currency: "BOB", side: "Right-hand", emergency: "110" },
  { name: "Bosnia & Herzegovina", code: "ba", region: "Europe", capital: "Sarajevo", pop: "3.2M", currency: "BAM", side: "Right-hand", emergency: "112" },
  { name: "Botswana", code: "bw", region: "Africa", capital: "Gaborone", pop: "2.6M", currency: "BWP", side: "Left-hand", emergency: "999" },
  { name: "Brunei", code: "bn", region: "Asia", capital: "Bandar Seri Begawan", pop: "445K", currency: "BND", side: "Left-hand", emergency: "993" },
  { name: "Bulgaria", code: "bg", region: "Europe", capital: "Sofia", pop: "6.5M", currency: "BGN", side: "Right-hand", emergency: "112" },
  { name: "Burkina Faso", code: "bf", region: "Africa", capital: "Ouagadougou", pop: "22.1M", currency: "XOF", side: "Right-hand", emergency: "17" },
  { name: "Burundi", code: "bi", region: "Africa", capital: "Gitega", pop: "12.6M", currency: "BIF", side: "Right-hand", emergency: "112" },
  { name: "Cambodia", code: "kh", region: "Asia", capital: "Phnom Penh", pop: "16.6M", currency: "KHR", side: "Right-hand", emergency: "119" },
  { name: "Cameroon", code: "cm", region: "Africa", capital: "Yaoundé", pop: "27.2M", currency: "XAF", side: "Right-hand", emergency: "112" },
  { name: "Cape Verde", code: "cv", region: "Africa", capital: "Praia", pop: "587K", currency: "CVE", side: "Right-hand", emergency: "132" },
  { name: "Central African Rep.", code: "cf", region: "Africa", capital: "Bangui", pop: "5.5M", currency: "XAF", side: "Right-hand", emergency: "117" },
  { name: "Chad", code: "td", region: "Africa", capital: "N'Djamena", pop: "17.2M", currency: "XAF", side: "Right-hand", emergency: "17" },
  { name: "Chile", code: "cl", region: "Americas", capital: "Santiago", pop: "19.5M", currency: "CLP", side: "Right-hand", emergency: "131" },
  { name: "Colombia", code: "co", region: "Americas", capital: "Bogotá", pop: "51.5M", currency: "COP", side: "Right-hand", emergency: "123" },
  { name: "Comoros", code: "km", region: "Africa", capital: "Moroni", pop: "836K", currency: "KMF", side: "Right-hand", emergency: "17" },
  { name: "Congo", code: "cg", region: "Africa", capital: "Brazzaville", pop: "5.8M", currency: "XAF", side: "Right-hand", emergency: "117" },
  { name: "Costa Rica", code: "cr", region: "Americas", capital: "San José", pop: "5.2M", currency: "CRC", side: "Right-hand", emergency: "911" },
  { name: "Croatia", code: "hr", region: "Europe", capital: "Zagreb", pop: "3.9M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Cuba", code: "cu", region: "Americas", capital: "Havana", pop: "11.2M", currency: "CUP", side: "Right-hand", emergency: "104" },
  { name: "Cyprus", code: "cy", region: "Europe", capital: "Nicosia", pop: "1.2M", currency: "EUR", side: "Left-hand", emergency: "112" },
  { name: "Czechia", code: "cz", region: "Europe", capital: "Prague", pop: "10.5M", currency: "CZK", side: "Right-hand", emergency: "112" },
  { name: "Denmark", code: "dk", region: "Europe", capital: "Copenhagen", pop: "5.8M", currency: "DKK", side: "Right-hand", emergency: "112" },
  { name: "Djibouti", code: "dj", region: "Africa", capital: "Djibouti", pop: "1.1M", currency: "DJF", side: "Right-hand", emergency: "17" },
  { name: "Dominican Republic", code: "do", region: "Americas", capital: "Santo Domingo", pop: "11.1M", currency: "DOP", side: "Right-hand", emergency: "911" },
  { name: "Ecuador", code: "ec", region: "Americas", capital: "Quito", pop: "17.8M", currency: "USD", side: "Right-hand", emergency: "911" },
  { name: "El Salvador", code: "sv", region: "Americas", capital: "San Salvador", pop: "6.3M", currency: "USD", side: "Right-hand", emergency: "911" },
  { name: "Estonia", code: "ee", region: "Europe", capital: "Tallinn", pop: "1.3M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Eswatini", code: "sz", region: "Africa", capital: "Mbabane", pop: "1.2M", currency: "SZL", side: "Left-hand", emergency: "999" },
  { name: "Ethiopia", code: "et", region: "Africa", capital: "Addis Ababa", pop: "120.3M", currency: "ETB", side: "Right-hand", emergency: "907" },
  { name: "Fiji", code: "fj", region: "Oceania", capital: "Suva", pop: "926K", currency: "FJD", side: "Left-hand", emergency: "911" },
  { name: "Finland", code: "fi", region: "Europe", capital: "Helsinki", pop: "5.5M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Gabon", code: "ga", region: "Africa", capital: "Libreville", pop: "2.3M", currency: "XAF", side: "Right-hand", emergency: "1300" },
  { name: "Gambia", code: "gm", region: "Africa", capital: "Banjul", pop: "2.6M", currency: "GMD", side: "Right-hand", emergency: "116" },
  { name: "Georgia", code: "ge", region: "Asia", capital: "Tbilisi", pop: "3.7M", currency: "GEL", side: "Right-hand", emergency: "112" },
  { name: "Ghana", code: "gh", region: "Africa", capital: "Accra", pop: "32.8M", currency: "GHS", side: "Right-hand", emergency: "112" },
  { name: "Greece", code: "gr", region: "Europe", capital: "Athens", pop: "10.6M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Guatemala", code: "gt", region: "Americas", capital: "Guatemala City", pop: "17.6M", currency: "GTQ", side: "Right-hand", emergency: "110" },
  { name: "Guyana", code: "gy", region: "Americas", capital: "Georgetown", pop: "804K", currency: "GYD", side: "Left-hand", emergency: "911" },
  { name: "Haiti", code: "ht", region: "Americas", capital: "Port-au-Prince", pop: "11.6M", currency: "HTG", side: "Right-hand", emergency: "114" },
  { name: "Honduras", code: "hn", region: "Americas", capital: "Tegucigalpa", pop: "10.2M", currency: "HNL", side: "Right-hand", emergency: "911" },
  { name: "Hungary", code: "hu", region: "Europe", capital: "Budapest", pop: "9.7M", currency: "HUF", side: "Right-hand", emergency: "112" },
  { name: "Iceland", code: "is", region: "Europe", capital: "Reykjavík", pop: "373K", currency: "ISK", side: "Right-hand", emergency: "112" },
  { name: "Iran", code: "ir", region: "Asia", capital: "Tehran", pop: "87.9M", currency: "IRR", side: "Right-hand", emergency: "115" },
  { name: "Iraq", code: "iq", region: "Asia", capital: "Baghdad", pop: "43.5M", currency: "IQD", side: "Right-hand", emergency: "112" },
  { name: "Ireland", code: "ie", region: "Europe", capital: "Dublin", pop: "5.0M", currency: "EUR", side: "Left-hand", emergency: "112" },
  { name: "Israel", code: "il", region: "Asia", capital: "Jerusalem", pop: "9.3M", currency: "ILS", side: "Right-hand", emergency: "101" },
  { name: "Jamaica", code: "jm", region: "Americas", capital: "Kingston", pop: "2.8M", currency: "JMD", side: "Left-hand", emergency: "110" },
  { name: "Jordan", code: "jo", region: "Asia", capital: "Amman", pop: "11.1M", currency: "JOD", side: "Right-hand", emergency: "911" },
  { name: "Kazakhstan", code: "kz", region: "Asia", capital: "Astana", pop: "19.0M", currency: "KZT", side: "Right-hand", emergency: "112" },
  { name: "Kenya", code: "ke", region: "Africa", capital: "Nairobi", pop: "53.0M", currency: "KES", side: "Left-hand", emergency: "999" },
  { name: "Kuwait", code: "kw", region: "Asia", capital: "Kuwait City", pop: "4.3M", currency: "KWD", side: "Right-hand", emergency: "112" },
  { name: "Kyrgyzstan", code: "kg", region: "Asia", capital: "Bishkek", pop: "6.7M", currency: "KGS", side: "Right-hand", emergency: "112" },
  { name: "Laos", code: "la", region: "Asia", capital: "Vientiane", pop: "7.4M", currency: "LAK", side: "Right-hand", emergency: "1195" },
  { name: "Latvia", code: "lv", region: "Europe", capital: "Riga", pop: "1.9M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Lebanon", code: "lb", region: "Asia", capital: "Beirut", pop: "5.6M", currency: "LBP", side: "Right-hand", emergency: "140" },
  { name: "Libya", code: "ly", region: "Africa", capital: "Tripoli", pop: "6.8M", currency: "LYD", side: "Right-hand", emergency: "193" },
  { name: "Lithuania", code: "lt", region: "Europe", capital: "Vilnius", pop: "2.8M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Luxembourg", code: "lu", region: "Europe", capital: "Luxembourg", pop: "640K", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Madagascar", code: "mg", region: "Africa", capital: "Antananarivo", pop: "28.9M", currency: "MGA", side: "Right-hand", emergency: "124" },
  { name: "Malawi", code: "mw", region: "Africa", capital: "Lilongwe", pop: "19.9M", currency: "MWK", side: "Left-hand", emergency: "997" },
  { name: "Maldives", code: "mv", region: "Asia", capital: "Malé", pop: "521K", currency: "MVR", side: "Left-hand", emergency: "102" },
  { name: "Mali", code: "ml", region: "Africa", capital: "Bamako", pop: "21.9M", currency: "XOF", side: "Right-hand", emergency: "15" },
  { name: "Malta", code: "mt", region: "Europe", capital: "Valletta", pop: "518K", currency: "EUR", side: "Left-hand", emergency: "112" },
  { name: "Mauritania", code: "mr", region: "Africa", capital: "Nouakchott", pop: "4.6M", currency: "MRU", side: "Right-hand", emergency: "117" },
  { name: "Mauritius", code: "mu", region: "Africa", capital: "Port Louis", pop: "1.3M", currency: "MUR", side: "Left-hand", emergency: "114" },
  { name: "Moldova", code: "md", region: "Europe", capital: "Chișinău", pop: "2.6M", currency: "MDL", side: "Right-hand", emergency: "112" },
  { name: "Monaco", code: "mc", region: "Europe", capital: "Monaco", pop: "39K", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Mongolia", code: "mn", region: "Asia", capital: "Ulaanbaatar", pop: "3.3M", currency: "MNT", side: "Right-hand", emergency: "103" },
  { name: "Montenegro", code: "me", region: "Europe", capital: "Podgorica", pop: "620K", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Morocco", code: "ma", region: "Africa", capital: "Rabat", pop: "37.1M", currency: "MAD", side: "Right-hand", emergency: "150" },
  { name: "Mozambique", code: "mz", region: "Africa", capital: "Maputo", pop: "32.1M", currency: "MZN", side: "Left-hand", emergency: "117" },
  { name: "Myanmar", code: "mm", region: "Asia", capital: "Naypyidaw", pop: "53.8M", currency: "MMK", side: "Right-hand", emergency: "199" },
  { name: "Namibia", code: "na", region: "Africa", capital: "Windhoek", pop: "2.5M", currency: "NAD", side: "Left-hand", emergency: "10111" },
  { name: "Nepal", code: "np", region: "Asia", capital: "Kathmandu", pop: "30.0M", currency: "NPR", side: "Left-hand", emergency: "102" },
  { name: "New Zealand", code: "nz", region: "Oceania", capital: "Wellington", pop: "5.1M", currency: "NZD", side: "Left-hand", emergency: "111" },
  { name: "Nicaragua", code: "ni", region: "Americas", capital: "Managua", pop: "6.8M", currency: "NIO", side: "Right-hand", emergency: "118" },
  { name: "Niger", code: "ne", region: "Africa", capital: "Niamey", pop: "25.3M", currency: "XOF", side: "Right-hand", emergency: "15" },
  { name: "Nigeria", code: "ng", region: "Africa", capital: "Abuja", pop: "213.4M", currency: "NGN", side: "Right-hand", emergency: "112" },
  { name: "North Macedonia", code: "mk", region: "Europe", capital: "Skopje", pop: "2.1M", currency: "MKD", side: "Right-hand", emergency: "112" },
  { name: "Norway", code: "no", region: "Europe", capital: "Oslo", pop: "5.4M", currency: "NOK", side: "Right-hand", emergency: "113" },
  { name: "Oman", code: "om", region: "Asia", capital: "Muscat", pop: "4.5M", currency: "OMR", side: "Right-hand", emergency: "999" },
  { name: "Palestine", code: "ps", region: "Asia", capital: "Ramallah", pop: "5.1M", currency: "ILS", side: "Right-hand", emergency: "101" },
  { name: "Panama", code: "pa", region: "Americas", capital: "Panama City", pop: "4.3M", currency: "PAB", side: "Right-hand", emergency: "911" },
  { name: "Papua New Guinea", code: "pg", region: "Oceania", capital: "Port Moresby", pop: "9.9M", currency: "PGK", side: "Left-hand", emergency: "111" },
  { name: "Paraguay", code: "py", region: "Americas", capital: "Asunción", pop: "6.7M", currency: "PYG", side: "Right-hand", emergency: "911" },
  { name: "Peru", code: "pe", region: "Americas", capital: "Lima", pop: "33.7M", currency: "PEN", side: "Right-hand", emergency: "106" },
  { name: "Philippines", code: "ph", region: "Asia", capital: "Manila", pop: "113.9M", currency: "PHP", side: "Right-hand", emergency: "911" },
  { name: "Poland", code: "pl", region: "Europe", capital: "Warsaw", pop: "37.7M", currency: "PLN", side: "Right-hand", emergency: "112" },
  { name: "Portugal", code: "pt", region: "Europe", capital: "Lisbon", pop: "10.3M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Qatar", code: "qa", region: "Asia", capital: "Doha", pop: "2.9M", currency: "QAR", side: "Right-hand", emergency: "999" },
  { name: "Romania", code: "ro", region: "Europe", capital: "Bucharest", pop: "19.0M", currency: "RON", side: "Right-hand", emergency: "112" },
  { name: "Russia", code: "ru", region: "Eurasia", capital: "Moscow", pop: "143.4M", currency: "RUB", side: "Right-hand", emergency: "112" },
  { name: "Rwanda", code: "rw", region: "Africa", capital: "Kigali", pop: "13.4M", currency: "RWF", side: "Right-hand", emergency: "112" },
  { name: "Senegal", code: "sn", region: "Africa", capital: "Dakar", pop: "16.9M", currency: "XOF", side: "Right-hand", emergency: "18" },
  { name: "Serbia", code: "rs", region: "Europe", capital: "Belgrade", pop: "6.8M", currency: "RSD", side: "Right-hand", emergency: "112" },
  { name: "Seychelles", code: "sc", region: "Africa", capital: "Victoria", pop: "99K", currency: "SCR", side: "Left-hand", emergency: "151" },
  { name: "Sierra Leone", code: "sl", region: "Africa", capital: "Freetown", pop: "8.4M", currency: "SLE", side: "Right-hand", emergency: "999" },
  { name: "Slovakia", code: "sk", region: "Europe", capital: "Bratislava", pop: "5.4M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Slovenia", code: "si", region: "Europe", capital: "Ljubljana", pop: "2.1M", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Somalia", code: "so", region: "Africa", capital: "Mogadishu", pop: "17.0M", currency: "SOS", side: "Right-hand", emergency: "999" },
  { name: "Sri Lanka", code: "lk", region: "Asia", capital: "Colombo", pop: "22.1M", currency: "LKR", side: "Left-hand", emergency: "110" },
  { name: "Sudan", code: "sd", region: "Africa", capital: "Khartoum", pop: "45.6M", currency: "SDG", side: "Right-hand", emergency: "999" },
  { name: "Sweden", code: "se", region: "Europe", capital: "Stockholm", pop: "10.4M", currency: "SEK", side: "Right-hand", emergency: "112" },
  { name: "Syria", code: "sy", region: "Asia", capital: "Damascus", pop: "21.3M", currency: "SYP", side: "Right-hand", emergency: "110" },
  { name: "Taiwan", code: "tw", region: "Asia", capital: "Taipei", pop: "23.5M", currency: "TWD", side: "Right-hand", emergency: "119" },
  { name: "Tajikistan", code: "tj", region: "Asia", capital: "Dushanbe", pop: "9.7M", currency: "TJS", side: "Right-hand", emergency: "112" },
  { name: "Tanzania", code: "tz", region: "Africa", capital: "Dodoma", pop: "63.6M", currency: "TZS", side: "Left-hand", emergency: "112" },
  { name: "Thailand", code: "th", region: "Asia", capital: "Bangkok", pop: "71.6M", currency: "THB", side: "Left-hand", emergency: "191" },
  { name: "Togo", code: "tg", region: "Africa", capital: "Lomé", pop: "8.6M", currency: "XOF", side: "Right-hand", emergency: "117" },
  { name: "Tunisia", code: "tn", region: "Africa", capital: "Tunis", pop: "12.3M", currency: "TND", side: "Right-hand", emergency: "198" },
  { name: "Turkmenistan", code: "tm", region: "Asia", capital: "Ashgabat", pop: "6.3M", currency: "TMT", side: "Right-hand", emergency: "03" },
  { name: "Uganda", code: "ug", region: "Africa", capital: "Kampala", pop: "45.8M", currency: "UGX", side: "Left-hand", emergency: "999" },
  { name: "Ukraine", code: "ua", region: "Europe", capital: "Kyiv", pop: "38.0M", currency: "UAH", side: "Right-hand", emergency: "112" },
  { name: "Uruguay", code: "uy", region: "Americas", capital: "Montevideo", pop: "3.4M", currency: "UYU", side: "Right-hand", emergency: "911" },
  { name: "Uzbekistan", code: "uz", region: "Asia", capital: "Tashkent", pop: "35.6M", currency: "UZS", side: "Right-hand", emergency: "103" },
  { name: "Vatican City", code: "va", region: "Europe", capital: "Vatican City", pop: "800", currency: "EUR", side: "Right-hand", emergency: "112" },
  { name: "Venezuela", code: "ve", region: "Americas", capital: "Caracas", pop: "28.2M", currency: "VES", side: "Right-hand", emergency: "911" },
  { name: "Vietnam", code: "vn", region: "Asia", capital: "Hanoi", pop: "97.5M", currency: "VND", side: "Right-hand", emergency: "115" },
  { name: "Yemen", code: "ye", region: "Asia", capital: "Sana'a", pop: "33.7M", currency: "YER", side: "Right-hand", emergency: "199" },
  { name: "Zambia", code: "zm", region: "Africa", capital: "Lusaka", pop: "19.5M", currency: "ZMW", side: "Left-hand", emergency: "999" },
  { name: "Zimbabwe", code: "zw", region: "Africa", capital: "Harare", pop: "15.9M", currency: "ZWL", side: "Left-hand", emergency: "999" },
];

export function CompareCountries() {
  const { place } = useCity();
  const { data: currentCountry } = useCountry();
  const [isCompared, setIsCompared] = useState(false);
  const [country1, setCountry1] = useState<WorldCountry>(WORLD_COUNTRIES[0]!); // Initial
  const [country2, setCountry2] = useState<WorldCountry>(WORLD_COUNTRIES[1]!); // Initial
  const [activeDropdownSlot, setActiveDropdownSlot] = useState<1 | 2 | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Automatically update Country 1 to the country of the searched city or place
  useEffect(() => {
    const code = currentCountry?.code?.toLowerCase() || place.countryCode?.toLowerCase();
    if (code) {
      const found =
        WORLD_COUNTRIES.find((c) => c.code.toLowerCase() === code) ||
        WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === place.country?.toLowerCase());
      if (found) {
        setCountry1(found);
        if (found.code === country2.code) {
          const other = WORLD_COUNTRIES.find((c) => c.code !== found.code);
          if (other) setCountry2(other);
        }
      }
    }
  }, [currentCountry?.code, place.countryCode, place.country]);

  const filteredCountries = WORLD_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card
      title={isCompared ? "Country Comparison" : "Compare Countries"}
      action={
        isCompared ? (
          <button
            type="button"
            onClick={() => setIsCompared(false)}
            className="glass-chip grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        ) : undefined
      }
      className="flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px] p-5 relative"
    >
      {!isCompared ? (
        <div className="flex flex-1 flex-col justify-between space-y-4 pt-1 relative">
          <p className="text-[13px] text-muted-foreground font-normal">
            Select any two countries in the world to compare
          </p>

          <div className="grid grid-cols-2 gap-4 my-auto py-2 relative">
            {/* Country Slot 1 Selector Box */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdownSlot(activeDropdownSlot === 1 ? null : 1);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-[24px] p-4 text-left transition-all cursor-pointer border ${
                  activeDropdownSlot === 1
                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50 shadow-md"
                    : "border-glass-border bg-glass hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center overflow-hidden rounded-full border border-glass-border bg-white shadow-md shrink-0">
                    <img
                      src={`https://flagcdn.com/w80/${country1.code}.png`}
                      alt={country1.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold leading-tight truncate">{country1.name}</h4>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{country1.region}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {/* Country Slot 1 Flag Dropdown Menu (Opens Upwards) */}
              {activeDropdownSlot === 1 && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-full min-w-[220px] rounded-[22px] border border-white/20 bg-background/95 backdrop-blur-xl p-3 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-primary/5 px-3 py-2 text-[12px] placeholder:text-muted-foreground outline-none border border-glass-border"
                    autoFocus
                  />
                  <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountry1(c);
                          setActiveDropdownSlot(null);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-primary/10 cursor-pointer ${
                          country1.code === c.code ? "bg-blue-500/10 font-bold" : ""
                        }`}
                      >
                        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-glass-border bg-white shadow-xs shrink-0">
                          <img
                            src={`https://flagcdn.com/w80/${c.code}.png`}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span className="text-[12.5px] truncate flex-1">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">{c.region}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Country Slot 2 Selector Box */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdownSlot(activeDropdownSlot === 2 ? null : 2);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-[24px] p-4 text-left transition-all cursor-pointer border ${
                  activeDropdownSlot === 2
                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50 shadow-md"
                    : "border-glass-border bg-glass hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center overflow-hidden rounded-full border border-glass-border bg-white shadow-md shrink-0">
                    <img
                      src={`https://flagcdn.com/w80/${country2.code}.png`}
                      alt={country2.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold leading-tight truncate">{country2.name}</h4>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{country2.region}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {/* Country Slot 2 Flag Dropdown Menu (Opens Upwards) */}
              {activeDropdownSlot === 2 && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-full min-w-[220px] rounded-[22px] border border-white/20 bg-background/95 backdrop-blur-xl p-3 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-primary/5 px-3 py-2 text-[12px] placeholder:text-muted-foreground outline-none border border-glass-border"
                    autoFocus
                  />
                  <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountry2(c);
                          setActiveDropdownSlot(null);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-primary/10 cursor-pointer ${
                          country2.code === c.code ? "bg-blue-500/10 font-bold" : ""
                        }`}
                      >
                        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-glass-border bg-white shadow-xs shrink-0">
                          <img
                            src={`https://flagcdn.com/w80/${c.code}.png`}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span className="text-[12.5px] truncate flex-1">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">{c.region}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveDropdownSlot(null);
                setIsCompared(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md cursor-pointer"
            >
              Compare Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between space-y-3 pt-1 animate-in fade-in duration-200">
          {/* Comparison Cards with VS badge */}
          <div className="relative grid grid-cols-2 gap-3 my-auto">
            {/* Floating VS Badge in Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full bg-background border border-glass-border shadow-md font-bold text-[11px] text-foreground">
              VS
            </div>

            {[country1, country2].map((info) => {
              return (
                <div key={info.code} className="glass-chip rounded-[20px] p-3.5 space-y-3 border border-white/10">
                  {/* Header: Flag + Name + Region */}
                  <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-glass-border bg-white shadow-xs shrink-0">
                      <img src={`https://flagcdn.com/w80/${info.code}.png`} alt={info.name} className="h-full w-full object-cover" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-tight truncate">{info.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{info.region}</p>
                    </div>
                  </div>

                  {/* Data Rows with Icons */}
                  <div className="space-y-2 text-[11.5px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        Capital
                      </span>
                      <span className="font-bold truncate max-w-[90px] text-right">{info.capital}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        Pop.
                      </span>
                      <span className="font-bold">{info.pop}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        Currency
                      </span>
                      <span className="font-bold">{info.currency.split(" ")[0]}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Car className="h-3 w-3" />
                        Driving
                      </span>
                      <span className="font-bold">{info.side.split("-")[0]}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        Emergency
                      </span>
                      <span className="font-bold text-rose-500">{info.emergency}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info & Back button */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="text-[10.5px] text-muted-foreground flex items-center gap-1">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-blue-500/20 text-blue-500 font-bold text-[9px]">
                i
              </span>
              World Bank & Wikipedia data
            </span>

            <button
              type="button"
              onClick={() => setIsCompared(false)}
              className="glass-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              ← Back to Select
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- city gallery ----------------------------- */

/* ----------------------------- city gallery ----------------------------- */

export function CityGallery() {
  const { place, isLocating } = useCity();
  const [scrollIndex, setScrollIndex] = useState(0);
  const { data: attractions } = useAttractions();
  const [loadedMap, setLoadedMap] = useState<Record<string, { width: number; height: number }>>({});
  const [failedSet, setFailedSet] = useState<Set<string>>(new Set());
  const [slowLoading, setSlowLoading] = useState(false);

  const citySimple = cleanCityName(place.name) || place.name;
  const cityMatch = CITY_PHOTO_MAP[citySimple] || CITY_PHOTO_MAP[place.name];

  // Build 100% city location-specific landmark gallery items (Zero country-wide fallback images)
  const rawItems: { url: string; title: string }[] = [];

  // 1. Add primary city landmark photo
  if (cityMatch) {
    rawItems.push({ url: cityMatch, title: `${citySimple} Landmark` });
  }

  // 2. Add tourist attractions fetched strictly for this city
  if (attractions && attractions.length > 0) {
    for (const a of attractions) {
      const cleanTitle = cleanLandmarkTitle(a.title);
      if (cleanTitle && a.image && isValidPhotoUrl(a.image)) {
        rawItems.push({ url: a.image, title: cleanTitle });
      }
    }
  }

  // Deduplicate gallery items by URL and title
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const galleryItems = rawItems.filter((item) => {
    const clean = cleanLandmarkTitle(item.title);
    if (!clean) return false;
    item.title = clean;
    const normTitle = clean.toLowerCase().trim();
    if (
      !item.url ||
      !isValidPhotoUrl(item.url) ||
      failedSet.has(item.url) ||
      seenUrls.has(item.url) ||
      seenTitles.has(normTitle)
    ) {
      return false;
    }
    seenUrls.add(item.url);
    seenTitles.add(normTitle);
    return true;
  }).slice(0, 5);

  // Fallback item if array is empty
  const fallbackItem = {
    url: cityMatch || "/images/faisal-mosque.jpg",
    title: `${citySimple} Landmark`,
  };

  const activeItems = galleryItems.length > 0 ? galleryItems : [fallbackItem];
  const currentItem = activeItems[scrollIndex % activeItems.length] || fallbackItem;
  const isCurrentLoaded = Boolean(loadedMap[currentItem.url]);

  // Automatic preloading of current + adjacent images
  useEffect(() => {
    if (activeItems.length === 0) return;

    const indicesToPreload = [
      scrollIndex % activeItems.length,
      (scrollIndex + 1) % activeItems.length,
      (scrollIndex + 2) % activeItems.length,
      (scrollIndex - 1 + activeItems.length) % activeItems.length,
    ];

    indicesToPreload.forEach((idx) => {
      const item = activeItems[idx];
      if (item && item.url && !loadedMap[item.url] && !failedSet.has(item.url)) {
        const img = new Image();
        img.src = item.url;
        img.onload = () => {
          setLoadedMap((prev) => ({
            ...prev,
            [item.url]: { width: img.naturalWidth, height: img.naturalHeight },
          }));
        };
        img.onerror = () => {
          setFailedSet((prev) => new Set(prev).add(item.url));
        };
      }
    });
  }, [scrollIndex, activeItems, loadedMap, failedSet]);

  // Reset gallery scroll index and loaded image states whenever searched city changes
  useEffect(() => {
    setScrollIndex(0);
    setLoadedMap({});
    setFailedSet(new Set());
  }, [place.name, place.country]);

  // Show subtle loading indicator if current image loading exceeds 1 second
  useEffect(() => {
    if (isCurrentLoaded) {
      setSlowLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      if (!isCurrentLoaded) {
        setSlowLoading(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [scrollIndex, isCurrentLoaded]);

  // Automatic slideshow timer cycling through all pictures
  useEffect(() => {
    if (activeItems.length <= 1) return;
    const timer = setInterval(() => {
      setScrollIndex((prev) => (prev >= activeItems.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [activeItems.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-glass-border shadow-[var(--glass-shadow)] min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-5 group bg-card">
      {/* Background Liquid Shimmer Skeleton when current image is downloading or locating */}
      {(!isCurrentLoaded || isLocating) && (
        <div className="absolute inset-0 z-[5] shimmer-skeleton transition-opacity duration-300" />
      )}

      {/* Subtle top progress indicator if loading takes > 1 second */}
      {slowLoading && !isCurrentLoaded && (
        <div className="absolute top-0 left-0 right-0 z-[30] h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 animate-pulse" />
      )}

      {/* Slide Stack with Dual-Layer Render (Blurred Background Fill + Uncropped Contain Foreground) */}
      {activeItems.map((item, idx) => {
        const dimensions = loadedMap[item.url];
        const isPortrait = dimensions ? dimensions.height > dimensions.width * 1.05 : false;
        const isActive = idx === scrollIndex % activeItems.length;

        return (
          <div
            key={item.url + idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* 1. Blurred Background atmosphere */}
            <img
              src={item.url}
              alt=""
              aria-hidden
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-50 brightness-75 select-none"
            />

            {/* 2. Uncropped Landmark Foreground Image */}
            <div className="relative h-full w-full flex items-center justify-center p-2">
              <img
                src={item.url}
                alt={`${item.title} — ${citySimple}`}
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  setLoadedMap((prev) => ({
                    ...prev,
                    [item.url]: { width: target.naturalWidth, height: target.naturalHeight },
                  }));
                }}
                onError={() => {
                  setFailedSet((prev) => new Set(prev).add(item.url));
                }}
                className={`max-h-full max-w-full rounded-2xl shadow-2xl transition-transform duration-700 ${
                  isPortrait ? "object-contain" : "object-cover h-full w-full"
                } ${isActive ? "scale-100" : "scale-105"}`}
              />
            </div>
          </div>
        );
      })}

      {/* Dark Overlay Gradient for High Contrast Text Protection */}
      <div className="absolute inset-0 z-[15] bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      {/* Top Bar Header with Title */}
      <div className="relative z-20 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Gallery
        </h2>
        <span className="glass-chip rounded-full px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md shrink-0">
          {(scrollIndex % activeItems.length) + 1} / {activeItems.length}
        </span>
      </div>

      {/* Navigation Arrow Left */}
      {activeItems.length > 1 && (
        <button
          type="button"
          onClick={() => setScrollIndex((i) => (i === 0 ? activeItems.length - 1 : i - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/25 shadow-xl hover:bg-black/60 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Navigation Arrow Right */}
      {activeItems.length > 1 && (
        <button
          type="button"
          onClick={() => setScrollIndex((i) => (i === activeItems.length - 1 ? 0 : i + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/25 shadow-xl hover:bg-black/60 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Bottom Information Overlay & Indicator Dots */}
      <div className="relative z-20 flex flex-col gap-2 pt-2">
        <div className="flex flex-col gap-0.5 text-white/95 drop-shadow-md">
          <span className="font-bold text-base sm:text-lg leading-tight truncate">
            {currentItem.title}
          </span>
        </div>

        {/* Indicator Dots */}
        {activeItems.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activeItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setScrollIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === (scrollIndex % activeItems.length)
                    ? "w-6 bg-white shadow-lg"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
