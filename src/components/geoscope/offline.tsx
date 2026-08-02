import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { CloudOff, Wifi } from "lucide-react";

/** True when the browser reports a network connection (always true during SSR). */
export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}

/**
 * Mirrors the query cache into localStorage so the dashboard still renders
 * the last known weather / air / country data with no connection.
 */
export function OfflineCache() {
  const queryClient = useQueryClient();
  const online = useOnline();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const [unsubscribe, restorePromise] = persistQueryClient({
      queryClient,
      persister: createSyncStoragePersister({
        storage: window.localStorage,
        key: "geoscope-cache",
        throttleTime: 1500,
      }),
      maxAge: 24 * 60 * 60 * 1000,
      buster: "v1",
    });
    restorePromise.then(() => setRestored(true));
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    if (online && restored) queryClient.invalidateQueries();
  }, [online, restored, queryClient]);

  if (online) return null;

  return (
    <div className="glass-strong fixed bottom-4 left-1/2 z-[900] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium shadow-[var(--glass-shadow)]">
      <CloudOff className="h-4 w-4 text-destructive" strokeWidth={1.9} />
      Offline — showing last saved data
    </div>
  );
}

/** Small pill for the status bar. */
export function ConnectionPill() {
  const online = useOnline();
  return (
    <span className="flex items-center gap-1.5" suppressHydrationWarning>
      {online ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-good" strokeWidth={2} />
          Online
        </>
      ) : (
        <>
          <CloudOff className="h-3.5 w-3.5 text-destructive" strokeWidth={2} />
          Offline · cached
        </>
      )}
    </span>
  );
}
