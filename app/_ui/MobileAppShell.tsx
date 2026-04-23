"use client";

import type { ReactNode } from "react";

export function MobileAppShell({
  children,
  bottomBar,
}: {
  children: ReactNode;
  bottomBar?: ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-50">
      <div className="mx-auto min-h-dvh w-full max-w-[430px]">
        <div className="min-h-dvh w-full bg-zinc-950">
          <div className="pb-[calc(88px+env(safe-area-inset-bottom))]">
            {children}
          </div>

          {bottomBar ? (
            <div className="fixed bottom-0 left-0 right-0">
              <div className="mx-auto w-full max-w-[430px]">
                <div className="border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl">
                  <div className="pb-[env(safe-area-inset-bottom)]">
                    {bottomBar}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

