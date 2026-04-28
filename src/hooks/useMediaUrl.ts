import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/mediaStore";

/**
 * Resolve a stored media id (or legacy data URL) to a usable src.
 * - If `value` looks like a data:/blob:/http URL, returns it as-is (legacy support).
 * - Otherwise treats it as an IndexedDB media id and returns a cached object URL.
 */
export function useMediaUrl(value?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    value && /^(data:|blob:|https?:)/.test(value) ? value : undefined
  );

  useEffect(() => {
    if (!value) { setUrl(undefined); return; }
    if (/^(data:|blob:|https?:)/.test(value)) { setUrl(value); return; }
    let cancelled = false;
    getMediaUrl(value).then((u) => { if (!cancelled) setUrl(u ?? undefined); });
    return () => { cancelled = true; };
  }, [value]);

  return url;
}