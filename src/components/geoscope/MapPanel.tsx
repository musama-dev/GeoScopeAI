import { lazy, Suspense, useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LeafletMap = lazy(() => import("./LeafletMap"));

function MapSkeleton() {
  return (
    <section className="glass-edge relative isolate z-0 min-h-[340px] overflow-hidden rounded-3xl bg-card shimmer-skeleton p-4 flex flex-col justify-between border border-glass-border shadow-[var(--glass-shadow)]">
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
    </section>
  );
}

export function MapPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <MapSkeleton />;
  return (
    <Suspense fallback={<MapSkeleton />}>
      <LeafletMap />
    </Suspense>
  );
}
