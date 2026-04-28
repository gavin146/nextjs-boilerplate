"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_FOCUS_RING } from "../_ui/focusRing";
import { DumbbellIcon, HomeIcon, SparkIcon } from "../_ui/icons";

type TabKey = "today" | "workout" | "coach";

const tabs: Array<{
  key: TabKey;
  href: string;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "today", href: "/today", label: "Today", icon: <HomeIcon /> },
  { key: "workout", href: "/workout", label: "Train", icon: <DumbbellIcon /> },
  { key: "coach", href: "/coach", label: "Coach", icon: <SparkIcon /> },
];

export function BottomTabs() {
  const pathname = usePathname();
  const activeKey: TabKey =
    pathname?.startsWith("/coach")
      ? "coach"
      : pathname?.startsWith("/today") || pathname?.startsWith("/progress")
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
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2.5 outline-none transition ${APP_FOCUS_RING} ${
                  isActive ? "text-sky-300" : "text-white/72"
                }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-85"}>
                  {t.icon}
                </span>
                <span className="text-[12px] font-semibold tracking-tight">
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

