"use client";

import Link from "next/link";
import { useMemo } from "react";
import { deriveReadinessScore } from "../../_lib/domain";
import { useAppProgram } from "../providers/AppProgramProvider";
import { Card, Meter, TopBar } from "../../_ui/blocks";
import { TouchButton } from "../../_ui/TouchButton";

export default function ProgressPage() {
  const { state } = useAppProgram();

  const readinessNow = deriveReadinessScore(state.checkIns);

  const last14 = useMemo(() => {
    const sorted = [...state.checkIns].sort((a, b) =>
      a.dateISO < b.dateISO ? 1 : -1,
    );
    return sorted.slice(0, 14);
  }, [state.checkIns]);

  const avgSleep =
    last14.length > 0
      ? Math.round(
          last14.reduce((s, c) => s + c.sleepQuality, 0) / last14.length,
        )
      : null;

  return (
    <div className="pb-6">
      <TopBar backHref="/today" title="Progress" subtitle="Recovery & history" />

      <div className="space-y-3 px-4 pt-3">
        <Card className="p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] text-white/50">Readiness</div>
              <div className="text-[36px] font-semibold tabular-nums leading-none text-emerald-200">
                {readinessNow}
              </div>
            </div>
            {avgSleep != null ? (
              <div className="text-right">
                <div className="text-[12px] text-white/50">Avg sleep</div>
                <div className="text-[22px] font-semibold tabular-nums text-sky-200">
                  {avgSleep}
                </div>
                <div className="text-[11px] text-white/40">last {last14.length} days</div>
              </div>
            ) : null}
          </div>
          <div className="mt-3">
            <Meter value={readinessNow} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[14px] font-semibold">Recent check ins</div>
          <div className="mt-3 space-y-2">
            {last14.length ? (
              last14.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[13px] leading-snug"
                >
                  <span className="text-white/40">{c.dateISO}</span>
                  <span className="tabular-nums text-white/78">
                    sleep {c.sleepQuality} · ready {c.readiness}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-white/50">
                Save a check in on Today to see history here.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">
            Coach memory
          </div>
          <p className="mt-1 text-[12px] text-white/45">
            Used when building your next week.
          </p>
          <div className="mt-3 space-y-2">
            {state.coachMemory.facts.slice(-6).length ? (
              state.coachMemory.facts.slice(-6).map((f, i) => (
                <div
                  key={`${i}-${f.slice(0, 16)}`}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] leading-relaxed text-white/75"
                >
                  {f}
                </div>
              ))
            ) : (
              <p className="text-[13px] text-white/45">
                Chat with Coach or refresh your week from Today.
              </p>
            )}
          </div>
        </Card>

        <Link href="/today" className="block">
          <TouchButton variant="secondary">← Today</TouchButton>
        </Link>
      </div>
    </div>
  );
}
