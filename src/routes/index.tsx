import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Sidebar } from "@/components/geoscope/Sidebar";
import { CityProvider } from "../context/city-context";
import { ThemeProvider } from "../context/theme-context";
import { OfflineCache } from "@/components/geoscope/offline";

import { TopBar } from "@/components/geoscope/TopBar";
import {
  CityHero,
  MapPanel,
  TimeGlance,
  AstronomyPanel,
  CurrentWeather,
  HourlyForecast,
  TenDayForecast,
  AirQuality,
  CountryInfo,
  Attractions,
  CurrencyConverter,
  QuickInfo,
  WikipediaSummary,
  CompareCountries,
  CityGallery,
  StatusBar,
} from "@/components/geoscope/panels";

import { Toaster } from "@/components/ui/sonner";
import { GeoScopeAssistant } from "@/components/geoscope/GeoScopeAssistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoScope AI — Global Location, Weather & Travel Explorer" },
      {
        name: "description",
        content:
          "Explore any city with live weather, air quality, maps, time zones, currency rates and travel essentials in one liquid-glass dashboard.",
      },
      { property: "og:title", content: "GeoScope AI — Global Location Explorer" },
      {
        property: "og:description",
        content:
          "Weather, air quality, astronomy, currency and travel data for any place on Earth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFocusKey, setActiveFocusKey] = useState<string>("Home");

  return (
    <ThemeProvider>
      <CityProvider>
        <Toaster position="top-right" />
        <main className="min-h-screen p-3 md:p-4">
          <div className="glass mx-auto flex max-w-[1560px] gap-3.5 rounded-[2rem] p-3.5">
            <Sidebar
              mobileOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              activeFocusKey={activeFocusKey}
              onSelectFocus={(key) => setActiveFocusKey(key)}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-3.5">
              <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

              <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,1.3fr)]">
                <CityHero />
                <MapPanel />
                <div className="flex flex-col gap-3.5">
                  <TimeGlance />
                  <AstronomyPanel />
                </div>
              </div>

              <div className="grid items-stretch gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                <CurrentWeather />
                <HourlyForecast />
                <TenDayForecast />
              </div>

              <div className="grid items-start gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                <AirQuality />
                <CountryInfo />
                <Attractions />
              </div>

              <div className="grid items-stretch gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                <CurrencyConverter />
                <QuickInfo />
                <WikipediaSummary />
              </div>

              <div className="grid items-stretch gap-3.5 sm:grid-cols-2">
                <CompareCountries />
                <CityGallery />
              </div>

              <StatusBar />
              <OfflineCache />
            </div>
          </div>

          {/* Spotlight Focus Overlay — Seamlessly blurs background page and merges into card borders */}
          {activeFocusKey && activeFocusKey !== "Home" && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-200">
              {/* Click background backdrop to close */}
              <button
                type="button"
                aria-label="Close focus view"
                onClick={() => setActiveFocusKey("Home")}
                className="absolute inset-0 cursor-default"
              />

              {/* Exact Card Component directly rendered in center with seamlessly merged borders & rounded corners */}
              <div
                className={`relative z-10 w-full max-h-[94vh] overflow-y-auto rounded-[2.2rem] shadow-[0_20px_80px_rgba(0,0,0,0.75)] ring-1 ring-white/40 backdrop-blur-3xl animate-in zoom-in-95 duration-200 ${
                  activeFocusKey === "Weather"
                    ? "max-w-5xl"
                    : activeFocusKey === "Map"
                    ? "max-w-3xl"
                    : activeFocusKey === "Compare" || activeFocusKey === "Gallery"
                    ? "max-w-2xl"
                    : "max-w-md"
                }`}
              >
                {/* Floating Glass Close Button on top-right of merged card border */}
                <button
                  type="button"
                  onClick={() => setActiveFocusKey("Home")}
                  className="absolute top-3.5 right-3.5 z-30 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-800 shadow-xl hover:scale-110 hover:bg-white active:scale-95 transition-all cursor-pointer border border-white/60 backdrop-blur-md"
                  aria-label="Close focus view"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                {activeFocusKey === "Map" && <MapPanel />}
                {activeFocusKey === "Weather" && (
                  <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    <CurrentWeather />
                    <HourlyForecast />
                    <TenDayForecast />
                  </div>
                )}
                {activeFocusKey === "Air Quality" && <AirQuality />}
                {activeFocusKey === "Astronomy" && <AstronomyPanel />}
                {activeFocusKey === "Country" && <CountryInfo />}
                {activeFocusKey === "Travel" && <Attractions />}
                {activeFocusKey === "Currency" && <CurrencyConverter />}
                {activeFocusKey === "Compare" && <CompareCountries />}
                {activeFocusKey === "Gallery" && <CityGallery />}
                {activeFocusKey === "Wikipedia" && <WikipediaSummary />}
                {activeFocusKey === "Internet" && <QuickInfo />}
              </div>
            </div>
          )}
        </main>
        <GeoScopeAssistant />
      </CityProvider>
    </ThemeProvider>
  );
}

