import { useEffect } from "react";

export default function Magnifier() {
  useEffect(() => {
    const root = document.documentElement;
    const appRoot = document.getElementById("root");
    if (!appRoot) return;

    const applyZoom = () => {
      const zoom = Number(root.dataset.magnifierZoom) || 1.25;
      // Prefer CSS zoom (Chromium). Fall back to transform scaling.
      (appRoot.style as unknown as { zoom?: string }).zoom = String(zoom);
      appRoot.style.transform = "";
      appRoot.style.transformOrigin = "";
      appRoot.style.width = "";
    };

    const clearZoom = () => {
      (appRoot.style as unknown as { zoom?: string }).zoom = "";
      appRoot.style.transform = "";
      appRoot.style.transformOrigin = "";
      appRoot.style.width = "";
    };

    // If `zoom` has no effect in a given browser context, use transform scaling.
    const ensureEffective = () => {
      const z = (appRoot.style as unknown as { zoom?: string }).zoom;
      if (!z) return;
      // Transform fallback: keeps visual zoom even if CSS zoom is ignored.
      if (getComputedStyle(appRoot).zoom === "1") {
        const zoom = Number(z) || 1.25;
        appRoot.style.transformOrigin = "top left";
        appRoot.style.transform = `scale(${zoom})`;
        appRoot.style.width = `${100 / zoom}%`;
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes") continue;
        const name = (m as MutationRecord).attributeName;
        if (name === "data-magnifier-zoom") {
          applyZoom();
          ensureEffective();
        }
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-magnifier-zoom"],
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "access-magnifier-zoom" && e.newValue) root.dataset.magnifierZoom = e.newValue;
    };

    if (!root.dataset.magnifierZoom) root.dataset.magnifierZoom = "1";
    applyZoom();
    ensureEffective();

    window.addEventListener("storage", onStorage);
    window.addEventListener("resize", ensureEffective);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("resize", ensureEffective);
      clearZoom();
    };
  }, []);

  return null;
}
