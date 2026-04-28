"use client";

import type { ReactNode } from "react";

/**
 * Single vertical scroll region for tabbed screens so touch scrolling works reliably on iOS.
 * Bottom tabs are fixed; content scrolls above them with padded clearance.
 */
export function MobileAppShell({
  children,
  bottomBar,
}: {
  children: ReactNode;
  bottomBar?: ReactNode;
}) {
  const tabPad = bottomBar
    ? "pb-[calc(88px+env(safe-area-inset-bottom,0px))]"
    : "pb-[env(safe-area-inset-bottom,0px)]";

  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex h-dvh max-h-dvh min-h-0 w-full max-w-[430px] flex-col overflow-hidden bg-zinc-950">
        <main
          className={`app-scroll-touch min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${tabPad}`}
        >
          {children}
        </main>

        {bottomBar ? (
          <div className="z-30 shrink-0 border-t border-white/10 bg-zinc-950/92 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/78">
            <div className="pb-[env(safe-area-inset-bottom,0px)]">{bottomBar}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

