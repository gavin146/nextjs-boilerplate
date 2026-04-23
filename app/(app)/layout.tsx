import type { ReactNode } from "react";
import { AppShellWithTabs } from "./AppShellWithTabs";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShellWithTabs>{children}</AppShellWithTabs>;
}

