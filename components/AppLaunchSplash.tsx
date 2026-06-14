"use client";

import Image from "next/image";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Segoe_UI',sans-serif]";

interface AppLaunchSplashOverlayProps {
  /** `exit` = fondu de sortie ; `hidden` = non rendu */
  phase: "splash" | "exit" | "hidden";
}

/**
 * Écran d’ouverture premium — icône, wordmark, animation douce.
 */
export default function AppLaunchSplashOverlay({ phase }: AppLaunchSplashOverlayProps) {
  if (phase === "hidden") return null;

  const exiting = phase === "exit";

  return (
    <div
      className={`${sf} fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[520ms] ease-out ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={exiting}
      role="presentation"
    >
      {/* Fond premium — dégradé clair + lueur bleue */}
      <div className="absolute inset-0 bg-[#F5F5F7]" />
      <div
        className="absolute left-1/2 top-[38%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/[0.07] blur-3xl"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,122,255,0.08),transparent)]"
        aria-hidden
      />

      <div
        className={`relative flex flex-col items-center px-8 transition-all duration-[520ms] ease-out ${
          exiting ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div
          className={`splash-logo-enter relative mb-7 flex h-[88px] w-[88px] items-center justify-center rounded-[22px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(0,122,255,0.22)] ring-1 ring-black/[0.05]`}
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-[18px]"
            priority
          />
        </div>

        <div className="splash-text-enter text-center">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-zinc-900">BK Copilot</h1>
          <p className="mt-2 text-[13px] font-medium tracking-[0.06em] text-zinc-400 uppercase">
            Finance · Clients · Prospection
          </p>
        </div>
      </div>

      {/* Indicateur de chargement discret */}
      <div
        className={`absolute bottom-[max(2.75rem,env(safe-area-inset-bottom))] left-1/2 h-[3px] w-24 -translate-x-1/2 overflow-hidden rounded-full bg-zinc-200/80 transition-opacity duration-300 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <div className="splash-progress h-full w-full origin-left rounded-full bg-[#007AFF]" />
      </div>
    </div>
  );
}
