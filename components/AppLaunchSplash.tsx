"use client";

import Image from "next/image";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Segoe_UI',sans-serif]";

interface AppLaunchSplashOverlayProps {
  /** `exit` = fondu de sortie ; `hidden` = non rendu */
  phase: "splash" | "exit" | "hidden";
}

/**
 * Écran d’ouverture premium — fond noir, icône lumineuse, animation douce.
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
      {/* Fond noir profond + lueurs */}
      <div className="absolute inset-0 bg-[#000000]" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(0,122,255,0.14),transparent_68%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_40%_at_50%_100%,rgba(0,122,255,0.06),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />

      <div
        className={`relative flex flex-col items-center px-8 transition-all duration-[520ms] ease-out ${
          exiting ? "scale-[0.97] opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* Halo + icône */}
        <div className="splash-logo-enter relative mb-8">
          <div
            className="absolute inset-0 -m-6 rounded-[32px] bg-[#007AFF]/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_64px_-16px_rgba(0,122,255,0.45)] ring-1 ring-white/[0.12] backdrop-blur-sm">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={76}
              height={76}
              className="h-[76px] w-[76px] rounded-[19px]"
              priority
            />
          </div>
        </div>

        <div className="splash-text-enter text-center">
          <h1 className="bg-gradient-to-b from-white to-white/75 bg-clip-text text-[28px] font-semibold tracking-[-0.04em] text-transparent">
            BK Copilot
          </h1>
          <p className="mt-2.5 text-[11px] font-medium tracking-[0.22em] text-white/35 uppercase">
            Finance · Clients · Prospection
          </p>
        </div>
      </div>

      {/* Barre de progression fine */}
      <div
        className={`absolute bottom-[max(2.75rem,env(safe-area-inset-bottom))] left-1/2 flex w-28 -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-300 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div className="splash-progress h-full w-full origin-left rounded-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]" />
        </div>
      </div>
    </div>
  );
}
