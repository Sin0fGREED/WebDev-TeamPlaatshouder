import { useEffect, useState } from "react";

export default function AccountSettings() {
  const [largeText, setLargeText] = useState<boolean>(() => localStorage.getItem('access-large-text') === 'true');
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('access-high-contrast') === 'true');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => localStorage.getItem('access-reduced-motion') === 'true');
  const [magnifierZoom, setMagnifierZoom] = useState<number>(() => {
    const v = localStorage.getItem('access-magnifier-zoom');
    return v ? Number(v) : 1;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('access-large-text', largeText);
    localStorage.setItem('access-large-text', String(largeText));
  }, [largeText]);

  useEffect(() => {
    document.documentElement.classList.toggle('access-high-contrast', highContrast);
    localStorage.setItem('access-high-contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle('access-reduced-motion', reducedMotion);
    localStorage.setItem('access-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    // Persist zoom and expose via data- attributes for the magnifier component
    localStorage.setItem('access-magnifier-zoom', String(magnifierZoom));
    document.documentElement.dataset.magnifierZoom = String(magnifierZoom);
  }, [magnifierZoom]);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Accessibility / Handicap Settings</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input aria-label="Large text" type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
          <div>
            <div className="font-medium">Large text</div>
            <div className="text-sm text-gray-500">Increase base font size across the app for readability.</div>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input aria-label="High contrast" type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
          <div>
            <div className="font-medium">High contrast</div>
            <div className="text-sm text-gray-500">Increase color contrast for better visibility.</div>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input aria-label="Reduce motion" type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
          <div>
            <div className="font-medium">Reduce motion</div>
            <div className="text-sm text-gray-500">Disable animations and transitions for motion sensitivity.</div>
          </div>
        </label>

        {/* Page zoom (acts like browser zoom) */}
        <div className="space-y-2 px-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Zoom level</div>
            <div className="text-xs text-gray-500">{magnifierZoom.toFixed(2)}x</div>
          </div>
          <input aria-label="Page zoom" type="range" min="1" max="2.5" step="0.05" value={magnifierZoom} onChange={(e) => setMagnifierZoom(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
