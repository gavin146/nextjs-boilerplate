"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DumbbellIcon, HomeIcon, SparkIcon } from "../_ui/icons";

type TabKey = "today" | "workout" | "coach";

const tabs: Array<{
  key: TabKey;
  href: string;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "today", href: "/today", label: "Today", icon: <HomeIcon /> },
  { key: "workout", href: "/workout", label: "Workout", icon: <DumbbellIcon /> },
  { key: "coach", href: "/coach", label: "Coach", icon: <SparkIcon /> },
];

export function BottomTabs() {
  const pathname = usePathname();
  const activeKey: TabKey =
    pathname?.startsWith("/coach")
      ? "coach"
      : pathname?.startsWith("/today")
        ? "today"
        : "workout";

  return (
    <nav className="px-4 pt-3">
      <div className="pb-3">
        <div className="flex items-stretch justify-between gap-2">
          {tabs.map((t) => {
            const isActive = t.key === activeKey;
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`flex w-full flex-col items-center justify-center gap-1 py-3 ${
                  isActive ? "text-sky-300" : "text-white/70"
                }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-80"}>
                  {t.icon}
                </span>
                <span className="text-[11px] font-medium tracking-tight">
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

