import { useEffect } from "react";

const BASE = "TAMS Infotech";

/** Sets document.title; null = home title. */
export function usePageTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — SAP Gold Partner for manufacturers`;
  }, [title]);
}
