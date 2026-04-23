"use client";

import Link from "next/link";
import { ChevronBackIcon } from "./icons";

export function TopBar({
  title,
  subtitle,
  backHref,
  right,
}: {
  title: string;
  subtitle?: string;
  /** When set, shows a tappable back control (e.g. workout detail). */
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)] pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-1">
            {backHref ? (
              <Link
                href={backHref}
                className="-ml-1 mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white/85 ring-1 ring-white/0 transition active:bg-white/10 active:ring-white/10"
                aria-label="Back"
              >
                <ChevronBackIcon className="opacity-90" />
              </Link>
            ) : null}
            <div className="min-w-0">
              <div className="text-[22px] font-semibold tracking-tight">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-[13px] text-white/60">{subtitle}</div>
              ) : null}
            </div>
          </div>
          {right ? <div className="pt-1 shrink-0">{right}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Meter({ value, tone = "green" }: { value: number; tone?: "green" | "blue" }) {
  const bar = tone === "blue" ? "bg-sky-400" : "bg-emerald-400";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-[width] ${bar}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

