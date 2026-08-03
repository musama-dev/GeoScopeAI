import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Check,
  CloudRain,
  Copy,
  Crosshair,
  Globe,
  Layers,
  Maximize2,
  Minus,
  PersonStanding,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useCity } from "../../context/city-context";
import { useTheme } from "../../context/theme-context";

type StyleKey = "Street" | "Satellite" | "Terrain" | "Dark" | "Vintage";

const LAYERS: Record<StyleKey, { url: string; attribution: string; max: number; subdomains?: string }> = {
  Street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO © OpenStreetMap",
    max: 20,
    subdomains: "abcd",
  },
  Satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    max: 19,
  },
  Terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri / USGS",
    max: 19,
  },
  Dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
    max: 20,
    subdomains: "abcd",
  },
  Vintage: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri / National Geographic",
    max: 16,
  },
};

const STYLES = Object.keys(LAYERS) as StyleKey[];

type OverlayKey = "Rain" | "Clouds" | "Hillshade" | "Labels" | "Sun";

const STATIC_OVERLAYS: Partial<Record<OverlayKey, { url: string; attribution: string; opacity: number; subdomains?: string }>> = {
  Hillshade: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    opacity: 0.55,
  },
  Labels: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
    opacity: 0.9,
    subdomains: "abcd",
  },
};

const OVERLAY_KEYS: OverlayKey[] = ["Sun", "Rain", "Clouds", "Hillshade", "Labels"];

const sunHtml = (size: "lg" | "sm") =>
  `<span class="sun-marker ${size === "sm" ? "sun-sm" : ""}"><span class="sun-rays">${Array.from(
    { length: 8 },
    (_, i) => `<i style="--a:${i * 45}deg"></i>`,
  ).join("")}</span><span class="sun-core"></span></span>`;

/** Point on Earth where the sun is directly overhead, right now. */
function subsolarPoint(d = new Date()): [number, number] {
  const rad = Math.PI / 180;
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const n = Math.floor((d.getTime() - start) / 86400000) + 1; // day of year
  const dec = -23.44 * Math.cos(((360 / 365) * (n + 10)) * rad);
  const b = ((360 / 364) * (n - 81)) * rad;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const utcHours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  let lng = -15 * (utcHours + eot / 60 - 12);
  lng = ((((lng + 180) % 360) + 360) % 360) - 180;
  return [dec, lng];
}


/** Solar elevation (deg) at a place right now. */
function sunElevation(lat: number, lng: number, sun: [number, number]) {
  const rad = Math.PI / 180;
  const h = (lng - sun[1]) * rad;
  return (
    Math.asin(
      Math.sin(lat * rad) * Math.sin(sun[0] * rad) +
        Math.cos(lat * rad) * Math.cos(sun[0] * rad) * Math.cos(h),
    ) / rad
  );
}

/** Draw: night shading, the sun over the sunlit side, and a sun over the current city if it's day there. */
function paintSun(group: L.LayerGroup, lat: number, lng: number) {
  const sun = subsolarPoint();
  group.clearLayers();

  // night hemisphere
  const rad = Math.PI / 180;
  const dec = sun[0];
  const ring: L.LatLngExpression[] = [];
  for (let x = -180; x <= 180; x += 2) {
    const t = Math.atan(-Math.cos((x - sun[1]) * rad) / Math.tan(dec * rad)) / rad;
    ring.push([t, x]);
  }
  const capLat = dec > 0 ? -90 : 90;
  ring.push([capLat, 180], [capLat, -180]);
  L.polygon(ring, {
    interactive: false,
    stroke: false,
    fillColor: "#0b1220",
    fillOpacity: 0.32,
  }).addTo(group);

  const icon = (size: number, kind: "lg" | "sm") =>
    L.divIcon({ className: "", html: sunHtml(kind), iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

  L.marker(sun, { interactive: false, keyboard: false, zIndexOffset: 400, icon: icon(64, "lg") }).addTo(group);

  if (sunElevation(lat, lng, sun) > -0.833) {
    L.marker([lat, lng], {
      interactive: false,
      keyboard: false,
      zIndexOffset: 300,
      icon: icon(40, "sm"),
    }).addTo(group);
  }
}


export default function LeafletMap() {
  const { place } = useCity();
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const overlayRefs = useRef<Partial<Record<OverlayKey, L.Layer>>>({});
  const sunRef = useRef<L.LayerGroup | null>(null);
  const [style, setStyle] = useState<StyleKey>("Street");
  const [overlays, setOverlays] = useState<OverlayKey[]>([]);
  const [radar, setRadar] = useState<{ radar?: string | undefined; satellite?: string | undefined }>(
    {},
  );
  const [streetView, setStreetView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // latest RainViewer frames for the weather overlays (keyless)
  useEffect(() => {
    let alive = true;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const host: string = d.host;
        const rainFrames = [...(d.radar?.past ?? []), ...(d.radar?.nowcast ?? [])];
        const irFrames = d.satellite?.infrared ?? [];
        setRadar({
          radar: rainFrames.length ? `${host}${rainFrames[rainFrames.length - 1].path}` : undefined,
          satellite: irFrames.length ? `${host}${irFrames[irFrames.length - 1].path}` : undefined,
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const lat = Number.isFinite(place?.latitude) ? place.latitude : 24.8607;
    const lng = Number.isFinite(place?.longitude) ? place.longitude : 67.0011;

    let cleanup = () => {};

    try {
      const map = L.map(hostRef.current, {
        center: [lat, lng],
        zoom: 9,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      });
      mapRef.current = map;
      map.whenReady(() => setMapReady(true));
      const t = setTimeout(() => setMapReady(true), 400);

      const icon = L.divIcon({
        className: "live-location-container",
        html: `<span class="live-location-marker">
          <span class="live-location-ripple"></span>
          <span class="live-location-dot"></span>
        </span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      markerRef.current = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindTooltip(place.name ? `${place.name}${place.country ? `, ${place.country}` : ""}` : "Location", {
          permanent: false,
          direction: "top",
          offset: [0, -14],
          className: "live-location-hover-tooltip",
        });

      cleanup = () => {
        clearTimeout(t);
        try {
          map.remove();
        } catch {}
        mapRef.current = null;
        tileRef.current = null;
      };
    } catch (err) {
      console.error("Leaflet map init error:", err);
    }

    return cleanup;
  }, []);

  // swap tiles when style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const cfg = LAYERS[style];
      const layer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        maxZoom: cfg.max,
        subdomains: cfg.subdomains || "abc",
      });
      layer.addTo(map);
      const prev = tileRef.current;
      layer.once("load", () => prev?.remove());
      window.setTimeout(() => prev?.remove(), 700);
      tileRef.current = layer;
    } catch {}
  }, [style]);

  // recenter when city changes — glide directly to exact coordinates
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    setStreetView(false);

    const lat = Number.isFinite(place?.latitude) ? place.latitude : 24.8607;
    const lng = Number.isFinite(place?.longitude) ? place.longitude : 67.0011;

    try {
      map.invalidateSize();
      marker.setTooltipContent(place.name ? `${place.name}${place.country ? `, ${place.country}` : ""}` : "Location");
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 9);
    } catch (err) {
      console.error("Leaflet map view update error:", err);
    }
  }, [place.name, place.latitude, place.longitude]);

  // add / remove data overlays
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const wanted = new Set(overlays);

    for (const key of OVERLAY_KEYS) {
      const existing = overlayRefs.current[key];
      if (!wanted.has(key)) {
        existing?.remove();
        delete overlayRefs.current[key];
        if (key === "Sun") sunRef.current = null;
        continue;
      }
      if (existing) continue;

      let layer: L.Layer | undefined;
      if (key === "Sun") {
        const group = L.layerGroup();
        sunRef.current = group;
        paintSun(group, place.latitude, place.longitude);
        layer = group;
      } else if (key === "Rain" && radar.radar) {
        layer = L.tileLayer(`${radar.radar}/256/{z}/{x}/{y}/4/1_1.png`, {
          attribution: "© RainViewer",
          opacity: 0.7,
        });
      } else if (key === "Clouds" && radar.satellite) {
        layer = L.tileLayer(`${radar.satellite}/256/{z}/{x}/{y}/0/0_0.png`, {
          attribution: "© RainViewer",
          opacity: 0.55,
        });
      } else {
        const cfg = STATIC_OVERLAYS[key];
        if (cfg)
          layer = L.tileLayer(cfg.url, {
            attribution: cfg.attribution,
            opacity: cfg.opacity,
            subdomains: cfg.subdomains || "abc",
          });
      }
      if (layer) {
        layer.addTo(map);
        overlayRefs.current[key] = layer;
      }
    }
  }, [overlays, radar]);

  // keep the sun, daylight band and local sun in sync
  useEffect(() => {
    const group = sunRef.current;
    if (!overlays.includes("Sun") || !group) return;
    paintSun(group, place.latitude, place.longitude);
    const id = window.setInterval(() => paintSun(group, place.latitude, place.longitude), 60000);
    return () => window.clearInterval(id);
  }, [overlays, place.latitude, place.longitude]);


  const toggleOverlay = (key: OverlayKey) =>
    setOverlays((prev) => (prev.includes(key) ? prev.filter((o) => o !== key) : [...prev, key]));

  const shareUrl = () => {
    const u = new URL(window.location.href);
    u.search = new URLSearchParams({
      name: place.name,
      country: place.country,
      cc: place.countryCode,
      tz: place.timezone,
      lat: String(place.latitude),
      lng: String(place.longitude),
    }).toString();
    return u.toString();
  };

  const share = async () => {
    const url = shareUrl();
    const data = { title: `GeoScope AI — ${place.name}`, text: `Explore ${place.name} on GeoScope AI`, url };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
    } catch {
      /* user dismissed the share sheet */
    }
    await navigator.clipboard?.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  };

  const copy = () => {
    navigator.clipboard?.writeText(`${place.latitude}, ${place.longitude}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const fullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
    window.setTimeout(() => mapRef.current?.invalidateSize(), 300);
  };

  return (
    <section
      ref={shellRef}
      className="glass-edge relative isolate z-0 min-h-[340px] overflow-hidden rounded-3xl bg-card"
    >
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />

      {!mapReady && (
        <div className="absolute inset-0 z-[600] flex flex-col justify-between p-4 bg-card/75 backdrop-blur-md transition-opacity duration-500 shimmer-skeleton">
          {/* Top Map Style Pills Skeleton */}
          <div className="flex gap-2 overflow-x-auto">
            <div className="h-8 w-16 rounded-full bg-white/20 shimmer-skeleton shrink-0" />
            <div className="h-8 w-20 rounded-full bg-white/20 shimmer-skeleton shrink-0" />
            <div className="h-8 w-18 rounded-full bg-white/20 shimmer-skeleton shrink-0" />
            <div className="h-8 w-16 rounded-full bg-white/20 shimmer-skeleton shrink-0" />
            <div className="h-8 w-24 rounded-full bg-white/20 shimmer-skeleton shrink-0" />
          </div>

          {/* Right Action Chips Skeleton */}
          <div className="absolute top-16 right-4 flex flex-col gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 shimmer-skeleton" />
            <div className="h-9 w-9 rounded-xl bg-white/20 shimmer-skeleton" />
            <div className="h-9 w-9 rounded-xl bg-white/20 shimmer-skeleton" />
            <div className="h-9 w-9 rounded-xl bg-white/20 shimmer-skeleton" />
          </div>

          {/* Bottom Overlays & Coordinates Skeleton */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="h-8 w-64 rounded-full bg-white/20 shimmer-skeleton" />
            <div className="h-7 w-40 rounded-xl bg-white/20 shimmer-skeleton" />
          </div>
        </div>
      )}

      {streetView && (
        <div className="absolute inset-0 bg-card">
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-xs text-muted-foreground">
            <span>
              Street view unavailable here —{" "}
              <a
                className="text-primary underline"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.latitude},${place.longitude}`}
              >
                open in Google Maps
              </a>
            </span>
          </div>
          <iframe
            key={`sv-${place.latitude}-${place.longitude}`}
            title={`Street view of ${place.name}`}
            src={`https://www.google.com/maps?layer=c&cbll=${place.latitude},${place.longitude}&cbp=11,0,0,0,0&output=svembed`}
            className="relative h-full w-full border-0"
            loading="lazy"
          />
        </div>
      )}

      <div className="glass-chip absolute top-3 right-3 left-3 z-[500] flex gap-1.5 overflow-x-auto rounded-full p-1.5 text-[12px] font-medium [scrollbar-width:none] sm:top-4 sm:right-16 sm:left-16 sm:gap-1 sm:p-1 [&::-webkit-scrollbar]:hidden">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStyle(s);
              setStreetView(false);
            }}
            className={`min-h-9 shrink-0 touch-manipulation rounded-full px-3.5 py-2 transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 ${
              !streetView && style === s
                ? "glass-strong text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setStreetView((v) => !v)}
          className={`flex min-h-9 shrink-0 touch-manipulation items-center gap-1 rounded-full px-3.5 py-2 whitespace-nowrap transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 ${
            streetView ? "glass-strong text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PersonStanding className="h-3.5 w-3.5" strokeWidth={2} />
          Street View
        </button>
      </div>

      <div
        aria-hidden={streetView}
        className={`glass-chip absolute bottom-14 left-1/2 z-[500] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-full p-1.5 text-[11px] font-medium transition-opacity duration-200 [scrollbar-width:none] sm:bottom-16 sm:max-w-[calc(100%-2rem)] sm:gap-1 sm:p-1 [&::-webkit-scrollbar]:hidden ${
          streetView ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="hidden shrink-0 items-center gap-1 px-2 text-muted-foreground sm:flex">
          <CloudRain className="h-3.5 w-3.5" strokeWidth={2} />
          Overlays
        </span>
        {OVERLAY_KEYS.map((o) => {
          const on = overlays.includes(o);
          const pending = (o === "Rain" && !radar.radar) || (o === "Clouds" && !radar.satellite);
          return (
            <button
              key={o}
              disabled={pending || streetView}
              onClick={() => toggleOverlay(o)}
              className={`min-h-9 shrink-0 touch-manipulation rounded-full px-3.5 py-2 transition-colors disabled:opacity-40 sm:min-h-0 sm:px-3 sm:py-1.5 ${
                on ? "glass-strong text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>



      {!streetView && (
        <>
          <div className="absolute top-16 left-3 z-[500] flex flex-col gap-2.5 sm:left-4 sm:gap-2">
            <button
              aria-label="Zoom in"
              onClick={() => mapRef.current?.zoomIn()}
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl active:scale-95"
            >
              <Plus className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => mapRef.current?.zoomOut()}
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl active:scale-95"
            >
              <Minus className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
            </button>
          </div>



          <div className="absolute top-16 right-3 z-[500] flex flex-col gap-2.5 sm:right-4 sm:gap-2">
            <button
              aria-label="Cycle base map"
              onClick={() => setStyle(STYLES[(STYLES.indexOf(style) + 1) % STYLES.length]!)}
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl"
            >
              <Layers className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
            </button>
            <button
              aria-label="Recenter"
              onClick={() =>
                mapRef.current?.flyTo([place.latitude, place.longitude], 13, { duration: 0.7 })
              }
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl"
            >
              <Crosshair className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
            </button>
            <button
              aria-label="Share this location"
              title={shared ? "Link copied" : "Share this location"}
              onClick={share}
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl"
            >
              {shared ? (
                <Check className="h-4 w-4 text-good" strokeWidth={2.2} />
              ) : (
                <Share2 className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
              )}
            </button>
            <button
              aria-label="Fullscreen"
              onClick={fullscreen}
              className="glass-chip grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:h-9 sm:w-9 sm:rounded-xl"
            >
              <Maximize2 className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
            </button>
          </div>
        </>
      )}

      {streetView && (
        <button
          aria-label="Close street view"
          onClick={() => setStreetView(false)}
          className="glass-chip absolute top-16 right-3 z-[500] grid h-11 w-11 touch-manipulation place-items-center rounded-2xl sm:right-4 sm:h-9 sm:w-9 sm:rounded-xl"
        >
          <X className="h-4 w-4 text-secondary-foreground" strokeWidth={1.9} />
        </button>
      )}

      <button
        onClick={copy}
        className="glass-chip absolute bottom-3 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-mono"
      >
        {copied ? (
          "Coordinates copied"
        ) : (
          <>
            {Math.abs(place.latitude).toFixed(4)}° {place.latitude >= 0 ? "N" : "S"},{" "}
            {Math.abs(place.longitude).toFixed(4)}° {place.longitude >= 0 ? "E" : "W"}
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </>
        )}
      </button>
    </section>
  );
}
