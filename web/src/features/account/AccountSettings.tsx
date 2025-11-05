import { useEffect, useState } from "react";

export default function AccountSettings() {
  const [largeText, setLargeText] = useState<boolean>(() => localStorage.getItem('access-large-text') === 'true');
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('access-high-contrast') === 'true');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => localStorage.getItem('access-reduced-motion') === 'true');
  const [magnifier, setMagnifier] = useState<boolean>(() => localStorage.getItem('access-magnifier') === 'true');

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
    document.documentElement.classList.toggle('access-magnifier', magnifier);
    localStorage.setItem('access-magnifier', String(magnifier));
  }, [magnifier]);

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

        <label className="flex items-center gap-3">
          <input aria-label="Magnifier" type="checkbox" checked={magnifier} onChange={(e) => setMagnifier(e.target.checked)} />
          <div>
            <div className="font-medium flex items-center gap-2">Magnifier
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-sm text-gray-500">Increase interface scale and show a visible magnifier indicator for easier reading.</div>
          </div>
        </label>
      </div>
    </div>
  );
}
