"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileAppShell } from "../_ui/MobileAppShell";
import { BottomTabs } from "./tabs";

/**
 * In-session workout UI (active workout + per-exercise) runs full-bleed without bottom tabs.
 */
function hideAppBottomTabsForPathname(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/workout/active") return true;
  return /^\/workout\/[^/]+\/exercise\//.test(pathname);
}

export function AppShellWithTabs({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const immersive = hideAppBottomTabsForPathname(pathname);
  return (
    <MobileAppShell bottomBar={immersive ? undefined : <BottomTabs />}>
      {children}
    </MobileAppShell>
  );
}
