"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function TouchButton({
  variant = "primary",
  size = "lg",
  left,
  right,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "blue";
  size?: "lg" | "md";
  left?: ReactNode;
  right?: ReactNode;
}) {
  const base =
    "w-full select-none rounded-2xl font-semibold tracking-tight active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100";
  const sizes = {
    lg: "h-14 px-5 text-[17px]",
    md: "h-11 px-4 text-[15px]",
  }[size];

  const variants = {
    primary:
      "bg-emerald-400 text-zinc-950 shadow-[0_12px_30px_-18px_rgba(52,211,153,0.75)]",
    blue: "bg-sky-400 text-zinc-950 shadow-[0_12px_30px_-18px_rgba(56,189,248,0.75)]",
    secondary: "bg-white/10 text-white border border-white/10",
    ghost: "bg-transparent text-white/80 hover:bg-white/5",
    danger: "bg-red-500 text-white shadow-[0_12px_30px_-18px_rgba(239,68,68,0.8)]",
  }[variant];

  return (
    <button
      {...props}
      className={`${base} ${sizes} ${variants} ${className}`}
    >
      <span className="flex items-center justify-center gap-3">
        {left ? <span className="grid place-items-center">{left}</span> : null}
        <span className="truncate">{children}</span>
        {right ? <span className="grid place-items-center">{right}</span> : null}
      </span>
    </button>
  );
}

