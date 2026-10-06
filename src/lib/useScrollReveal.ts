import { useEffect } from "react";

/**
 * Revela elementos marcados com [data-reveal] conforme entram na viewport
 * (fade + leve subida). Usa IntersectionObserver — sem dependências.
 *
 * Acessibilidade / robustez:
 * - Se o usuário prefere menos movimento, ou o navegador não suporta
 *   IntersectionObserver, todos os elementos ficam visíveis de imediato.
 */
export function useScrollReveal(): void {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (els.length === 0) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
