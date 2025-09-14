type Options = { handleSelector?: string; onPositionChange?: (x: number, y: number) => void };

export function draggable(node: HTMLElement, options: Options = {}) {
  let sx = 0, sy = 0, sl = 0, st = 0, dragging = false;
  if (getComputedStyle(node).position === 'static') node.style.position = 'absolute'; // Used AI to add this line
  const handle = options.handleSelector ? (node.querySelector(options.handleSelector) as HTMLElement) || node : node; // Used AI to add this line

  function onDown(e: PointerEvent) {
    if (e.button !== 0) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    const cs = getComputedStyle(node);// Used AI to add this line
    sl = parseInt(cs.left) || 0;
    st = parseInt(cs.top) || 0;
    node.setPointerCapture?.(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    node.style.left = `${sl + dx}px`;
    node.style.top = `${st + dy}px`;
    options.onPositionChange?.(sl + dx, st + dy);
  }

  function onUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    node.releasePointerCapture?.(e.pointerId);
  }

  handle.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  return {
    destroy() {
      handle.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
  };
}



