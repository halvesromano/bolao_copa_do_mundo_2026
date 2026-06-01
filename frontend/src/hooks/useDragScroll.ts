import { useRef, useCallback } from "react";

/**
 * Hook que habilita scroll horizontal por arrastar com o mouse (mouse drag scroll).
 * Compatível com desktop e não interfere com touch em mobile.
 *
 * Uso:
 *   const { ref, onMouseDown } = useDragScroll();
 *   <div ref={ref} onMouseDown={onMouseDown} className="overflow-x-auto ...">
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDown.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    isDown.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
  }, []);

  const onMouseUp = useCallback(() => {
    if (!ref.current) return;
    isDown.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
}
