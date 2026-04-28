import type { ReactNode } from "react";
import { AppShellWithTabs } from "./AppShellWithTabs";
import { AppProgramProvider } from "./providers/AppProgramProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProgramProvider>
      <AppShellWithTabs>{children}</AppShellWithTabs>
    </AppProgramProvider>
  );
}

