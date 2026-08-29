import { useEffect, useRef, useState } from "react";

/**
 * Fades an element in once it scrolls near the viewport. Fires once (not on
 * every scroll back into view) and does nothing when the visitor has
 * prefers-reduced-motion set - `.reveal` in styles.css shows the content at
 * full opacity by default, so a visitor who never intersects (very short
 * page, no-JS) still sees the content, just without the animation.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
