import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, Globe, Navigation, LayoutGrid, ChevronRight, Sparkles, Loader2, Menu } from "lucide-react";
import { searchPlaces, fetchPlacePhoto, fetchCurrentLocationPlace, fetchIpLocationPlace, type Place } from "../../services/geo-api";
import { useCity } from "../../context/city-context";
import { ThemeToggle } from "../../context/theme-context";
import { toast } from "sonner";

const quickDestinations = [
  "Islamabad",
  "Lahore",
  "Karachi",
  "Dubai",
  "London",
  "Tokyo",
  "Paris",
  "New York",
  "Istanbul",
  "Riyadh",
  "Singapore",
  "Sydney",
];
const suggestions = ["London", "Istanbul", "Singapore", "Cape Town", "Reykjavík", "Rio de Janeiro"];

/** Small circular city photo used inside the trending / suggestion chips. */
function CityBubble({ name, size = 28 }: { name: string; size?: number }) {
  const { data: photo } = useQuery({
    queryKey: ["place-photo-v9", name],
    queryFn: async () => (await fetchPlacePhoto(name)) ?? null,
    staleTime: 24 * 60 * 60_000,
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-[11px] font-semibold text-accent-foreground ring-1 ring-glass-border"
      style={{ width: size, height: size }}
    >
      {photo && !imgError ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        name.slice(0, 2)
      )}
    </span>
  );
}

export function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { place, setPlace, recents, setIsLocating } = useCity();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["places", debounced],
    queryFn: () => searchPlaces(debounced),
    enabled: debounced.length >= 2,
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const pick = (p: Place) => {
    setPlace(p);
    setQuery("");
    setOpen(false);
  };

  const selectByName = async (name: string) => {
    const found = await searchPlaces(name);
    if (found[0]) setPlace(found[0]);
  };

  const useMyLocation = () => {
    setLocating(true);
    toast.info("Detecting location...", { id: "geo-toast" });

    const handleSuccess = async (lat: number, lng: number) => {
      try {
        const locatedPlace = await fetchCurrentLocationPlace(lat, lng);
        if (locatedPlace && locatedPlace.name) {
          setPlace(locatedPlace);
          toast.success(`Located: ${locatedPlace.name}, ${locatedPlace.country || "Your Location"}`, {
            id: "geo-toast",
          });
        } else {
          await handleIpFallback();
        }
      } catch (e) {
        console.error("Location resolution error:", e);
        await handleIpFallback();
      } finally {
        setLocating(false);
      }
    };

    const handleIpFallback = async () => {
      try {
        const ipPlace = await fetchIpLocationPlace();
        if (ipPlace && ipPlace.name) {
          setPlace(ipPlace);
          toast.success(`Located via IP: ${ipPlace.name}, ${ipPlace.country || "Your Region"}`, {
            id: "geo-toast",
          });
        }
      } catch (e) {
        console.error("IP location error:", e);
        toast.error("Could not detect location. Please search manually.", { id: "geo-toast" });
      } finally {
        setLocating(false);
      }
    };

    if (!navigator.geolocation) {
      handleIpFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handleSuccess(coords.latitude, coords.longitude);
      },
      () => {
        handleIpFallback();
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  };

  return (
    <div className="relative z-[1100] flex flex-col gap-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_minmax(0,640px)_1fr] items-center gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="glass-strong grid h-11 w-11 shrink-0 place-items-center rounded-2xl lg:hidden hover:bg-glass"
          >
            <Menu className="h-5 w-5 text-primary" strokeWidth={1.8} />
          </button>
          <div className="glass-strong grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl overflow-hidden p-1 shadow-md border border-glass-border">
            <img
              src="/images/geoscope-icon-dark.png"
              alt="GeoScope AI Logo"
              className="h-full w-full object-contain dark:hidden"
            />
            <img
              src="/images/geoscope-icon-light.png"
              alt="GeoScope AI Logo"
              className="hidden h-full w-full object-contain dark:block"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-[22px] leading-tight font-bold tracking-tight whitespace-nowrap">
              GeoScope AI
            </h1>
            <p className="hidden sm:block truncate text-xs text-muted-foreground">
              Intelligent Global Location Explorer
            </p>
          </div>
        </div>

        <div
          ref={boxRef}
          className="relative order-last col-span-2 md:order-none md:col-span-1 w-full max-w-[640px] mx-auto"
        >
          <label className="glass flex h-12 items-center gap-3 rounded-full px-4">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (results?.length) pick(results[0]!);
                  else if (query.trim().length >= 2) {
                    selectByName(query.trim());
                    setOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                  inputRef.current?.blur();
                }
              }}
              placeholder="Search any city, country or place..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {isFetching ? (
              <span className="relative flex h-2 w-2 shrink-0 my-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            ) : (
              <kbd className="glass-chip hidden rounded-lg px-2 py-0.5 text-[11px] text-muted-foreground sm:block">
                /
              </kbd>
            )}
          </label>

          {open && (
            <div className="glass-strong absolute top-14 z-[1200] max-h-80 w-full overflow-auto rounded-2xl p-1.5 shadow-[var(--glass-shadow)]">
              {debounced.length >= 2 ? (
                results?.length ? (
                  results.map((r) => (
                    <button
                      key={`${r.id}-${r.latitude}`}
                      onClick={() => pick(r)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <CityBubble name={r.name} size={28} />
                      <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {[r.admin1, r.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-[12px] text-muted-foreground flex items-center gap-2">
                    {isFetching ? (
                      <>
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Searching...
                      </>
                    ) : (
                      "No matching places."
                    )}
                  </p>
                )
              ) : (
                <>
                  {recents.length > 0 && (
                    <>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Recent
                      </p>
                      {recents.map((r) => (
                        <button
                          key={`recent-${r.latitude}-${r.longitude}`}
                          onClick={() => pick(r)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          <CityBubble name={r.name} size={24} />
                          <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {r.country}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Popular destinations
                  </p>
                  {suggestions.map((c) => (
                    <button
                      key={`sugg-${c}`}
                      onClick={() => {
                        selectByName(c);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <CityBubble name={c} size={24} />
                      <span className="min-w-0 flex-1 truncate font-medium">{c}</span>
                    </button>
                  ))}
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">
                    Type at least 2 letters to search every city on Earth.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 justify-end ml-auto">
          <ThemeToggle className="w-[92px]" />
          <button
            onClick={useMyLocation}
            title="Use my location"
            className="glass-chip grid h-12 w-12 place-items-center rounded-2xl text-primary"
          >
            {locating ? (
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            ) : (
              <Navigation className="h-[18px] w-[18px]" strokeWidth={1.9} />
            )}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickDestinations.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => selectByName(c)}
            className={`glass-chip flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-[13px] font-medium hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              place.name.toLowerCase() === c.toLowerCase() ? "text-primary ring-1 ring-primary/40 glass-strong" : ""
            }`}
          >
            <CityBubble name={c} size={26} />
            <span>{c}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
