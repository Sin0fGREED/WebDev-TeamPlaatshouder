import { useEffect } from "react";

export default function Magnifier() {
  useEffect(() => {
    // Read initial config from document dataset or fall back to defaults
    let ZOOM = parseFloat(document.documentElement.dataset.magnifierZoom || '') || 1.75;
    let LENS_SIZE = parseInt(document.documentElement.dataset.magnifierSize || '') || 220;

    // Create lens container
    const lens = document.createElement('div');
  lens.className = 'magnifier-lens';
  lens.style.width = `${LENS_SIZE}px`;
  lens.style.height = `${LENS_SIZE}px`;
    lens.style.display = 'none';
    lens.setAttribute('aria-hidden', 'true');

    // Create a wrapper which will hold the cloned document for scaling
    const inner = document.createElement('div');
    inner.className = 'magnifier-inner';
    inner.style.position = 'absolute';
    inner.style.left = '0';
    inner.style.top = '0';
    inner.style.willChange = 'transform';

  lens.appendChild(inner);
  // ensure the lens never intercepts pointer events so clicks pass through
  lens.style.pointerEvents = 'none';
  inner.style.pointerEvents = 'none';
  document.body.appendChild(lens);

    // Clone the page once when enabled to reduce DOM thrash
    let cloned: HTMLElement | null = null;

    function enableMagnifier() {
      if (!cloned) {
        // shallow clone of html/body content (deep clone to capture markup)
        cloned = document.documentElement.cloneNode(true) as HTMLElement;
        // Remove the magnifier component itself from the clone if present
        const found = cloned.querySelector('.magnifier-lens');
        if (found && found.parentNode) found.parentNode.removeChild(found);

        // Strip out script tags to be safe
        cloned.querySelectorAll('script').forEach(s => s.remove());

        // Reset IDs that could conflict
        cloned.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        // Style the cloned root so it appears identical
        (cloned as HTMLElement).style.boxSizing = 'border-box';
        cloned.style.width = `${window.innerWidth}px`;
        cloned.style.height = `${window.innerHeight}px`;
        cloned.style.overflow = 'hidden';
  cloned.style.position = 'relative';

        // Place the cloned content inside the inner wrapper
        inner.appendChild(cloned);
        // Ensure cloned content is non-interactive
        cloned.querySelectorAll('*').forEach((n: Element) => (n as HTMLElement).style.pointerEvents = 'none');
      }
      // ensure lens dimensions reflect current setting
      lens.style.width = `${LENS_SIZE}px`;
      lens.style.height = `${LENS_SIZE}px`;
      lens.style.display = 'block';
    }

    function disableMagnifier() {
      lens.style.display = 'none';
    }

    function onMove(e: MouseEvent) {
      if (lens.style.display === 'none') return;
      const lx = LENS_SIZE / 2;
      const ly = LENS_SIZE / 2;
      const x = e.clientX;
      const y = e.clientY;

      // Position lens centered on cursor
      lens.style.left = `${x - lx}px`;
      lens.style.top = `${y - ly}px`;

      if (!cloned) return;

      // Compute translation so that the cursor point becomes centered in the lens
      // Using transform-origin: top left; transform: translate(tx, ty) scale(ZOOM)
      const tx = -(x - lx / ZOOM);
      const ty = -(y - ly / ZOOM);
      cloned.style.transformOrigin = 'top left';
      cloned.style.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM})`;
    }

    // When the user clicks/touches while the magnifier is visible some browsers
    // may target the lens. To ensure native clicks reach the page, briefly hide
    // the lens on pointerdown/touchstart and restore it after the event.
    function forwardPointer() {
      if (lens.style.display === 'none') return;
      lens.style.display = 'none';
      // restore shortly after to keep UX smooth
      setTimeout(() => {
        if (document.documentElement.classList.contains('access-magnifier')) {
          lens.style.display = 'block';
        }
      }, 60);
    }

    // Observe class changes on <html> to know when magnifier is toggled
    const observer = new MutationObserver((mutations) => {
      let recalc = false;
      for (const m of mutations) {
        if (m.type === 'attributes') {
          const attr = (m as MutationRecord).attributeName;
          if (attr === 'class') {
            const active = document.documentElement.classList.contains('access-magnifier');
            if (active) enableMagnifier(); else disableMagnifier();
          }
          if (attr === 'data-magnifier-zoom') {
            const v = parseFloat(document.documentElement.dataset.magnifierZoom || '') || ZOOM;
            if (v !== ZOOM) { ZOOM = v; recalc = true; }
          }
          if (attr === 'data-magnifier-size') {
            const s = parseInt(document.documentElement.dataset.magnifierSize || '') || LENS_SIZE;
            if (s !== LENS_SIZE) { LENS_SIZE = s; recalc = true; }
          }
        }
      }
      if (recalc) {
        // apply new size immediately
        lens.style.width = `${LENS_SIZE}px`;
        lens.style.height = `${LENS_SIZE}px`;
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-magnifier-zoom', 'data-magnifier-size'] });

  // Listen for moves and pointer events that should be forwarded
  window.addEventListener('mousemove', onMove);
  window.addEventListener('pointerdown', forwardPointer, true);
  window.addEventListener('touchstart', forwardPointer, true);

    // Initialize based on current state
    // Ensure dataset defaults are present for other code
    if (!document.documentElement.dataset.magnifierZoom) document.documentElement.dataset.magnifierZoom = String(ZOOM);
    if (!document.documentElement.dataset.magnifierSize) document.documentElement.dataset.magnifierSize = String(LENS_SIZE);
    if (document.documentElement.classList.contains('access-magnifier')) {
      enableMagnifier();
    }

    // Listen for storage events (cross-window changes)
    function onStorage(e: StorageEvent) {
      if (e.key === 'access-magnifier-zoom') {
        const v = parseFloat(String(e.newValue)) || ZOOM;
        ZOOM = v;
      }
      if (e.key === 'access-magnifier-size') {
        const s = parseInt(String(e.newValue)) || LENS_SIZE;
        LENS_SIZE = s;
        lens.style.width = `${LENS_SIZE}px`;
        lens.style.height = `${LENS_SIZE}px`;
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerdown', forwardPointer, true);
      window.removeEventListener('touchstart', forwardPointer, true);
      window.removeEventListener('storage', onStorage);
      if (lens.parentNode) lens.parentNode.removeChild(lens);
      cloned = null;
    };
  }, []);

  return null;
}
