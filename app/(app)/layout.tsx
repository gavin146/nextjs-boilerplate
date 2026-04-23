import type { ReactNode } from "react";
import { MobileAppShell } from "../_ui/MobileAppShell";
import { BottomTabs } from "./tabs";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <MobileAppShell bottomBar={<BottomTabs />}>{children}</MobileAppShell>;
}

