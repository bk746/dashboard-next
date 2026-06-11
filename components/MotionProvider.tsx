"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/lib/motion/gsap";

interface MotionProviderProps {
  children: React.ReactNode;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

function setupScrollReveals(root: ParentNode | Document, reduced: boolean) {
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
          start: "top 90%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );
  });
}

/** Animations GSAP au changement de page — scroll natif (sans Lenis). */
export default function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    if (!reduced) {
      document.documentElement.classList.add("motion-js");
    }
    return () => {
      document.documentElement.classList.remove("motion-js");
    };
  }, []);

  useEffect(() => {
    ensureGsapPlugins();

    const root = document.querySelector<HTMLElement>("[data-page-shell]") ?? document;
    const reduced = prefersReducedMotion();

    runPageEnter(root, reduced);
    setupScrollReveals(root, reduced);

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname]);

  return <>{children}</>;
}
