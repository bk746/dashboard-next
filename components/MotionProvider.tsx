"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/lib/motion/gsap";

type MotionMode = "window" | "element";

interface MotionProviderProps {
  children: React.ReactNode;
  mode?: MotionMode;
  /** Conteneur scrollable (ex. `<main>`) — requis si mode = element */
  wrapperRef?: RefObject<HTMLElement | null>;
  /** Contenu à l'intérieur du wrapper — requis si mode = element */
  contentRef?: RefObject<HTMLElement | null>;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollRoot(mode: MotionMode, wrapperRef: RefObject<HTMLElement | null>) {
  if (mode === "element" && wrapperRef.current) return wrapperRef.current;
  return undefined;
}

function runPageEnter(root: ParentNode | Document, reduced: boolean) {
  const staggerGroups = root.querySelectorAll<HTMLElement>(".stagger-cards");
  const cards = root.querySelectorAll<HTMLElement>(".motion-card");
  const staggerItems = [...staggerGroups].flatMap((g) => [...g.children]) as HTMLElement[];
  const cardsOutsideStagger = [...cards].filter(
    (card) => !card.closest(".stagger-cards")
  );
  const header = root.querySelector<HTMLElement>("[data-page-shell] header");
  const animated = [...staggerItems, ...cardsOutsideStagger, ...(header ? [header] : [])];

  gsap.set(animated, { clearProps: "all" });

  if (reduced) {
    gsap.set(animated, { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (staggerItems.length) {
    tl.from(
      staggerItems,
      {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.045,
      },
      0
    );
  }

  if (cardsOutsideStagger.length) {
    tl.from(
      cardsOutsideStagger,
      {
        opacity: 0,
        y: 14,
        duration: 0.5,
        stagger: 0.04,
      },
      staggerItems.length ? 0.08 : 0
    );
  }

  if (header) {
    tl.from(header, { opacity: 0, y: 10, duration: 0.45 }, 0);
  }
}

function setupScrollReveals(
  scroller: HTMLElement | Window | undefined,
  root: ParentNode | Document,
  reduced: boolean
) {
  ScrollTrigger.getAll().forEach((st) => st.kill());

  if (reduced) return;

  const targets = root.querySelectorAll<HTMLElement>("[data-reveal], section[aria-label]");

  targets.forEach((el) => {
    if (el.closest(".stagger-cards")) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? window,
          start: "top 90%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );
  });
}

export default function MotionProvider({
  children,
  mode = "window",
  wrapperRef,
  contentRef,
}: MotionProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const reducedRef = useRef(false);

  useLayoutEffect(() => {
    reducedRef.current = prefersReducedMotion();
    if (!reducedRef.current) {
      document.documentElement.classList.add("motion-js");
    }
    return () => {
      document.documentElement.classList.remove("motion-js");
    };
  }, []);

  useEffect(() => {
    if (reducedRef.current) return;

    ensureGsapPlugins();

    let cancelled = false;
    let lenis: Lenis | null = null;

    const mountLenis = () => {
      if (cancelled) return;

      const wrapperEl = mode === "element" ? wrapperRef?.current : null;
      const contentEl = mode === "element" ? contentRef?.current : null;

      if (mode === "element" && (!wrapperEl || !contentEl)) {
        requestAnimationFrame(mountLenis);
        return;
      }

      lenis = new Lenis({
        wrapper: wrapperEl ?? window,
        content: contentEl ?? document.documentElement,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
      });

      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
    };

    mountLenis();

    return () => {
      cancelled = true;
      lenis?.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [mode, wrapperRef, contentRef]);

  useEffect(() => {
    ensureGsapPlugins();

    const root =
      mode === "element" && contentRef?.current ? contentRef.current : document;
    const scroller = getScrollRoot(mode, wrapperRef ?? { current: null });

    runPageEnter(root, reducedRef.current);
    setupScrollReveals(scroller, root, reducedRef.current);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname, mode, wrapperRef, contentRef]);

  return <>{children}</>;
}
