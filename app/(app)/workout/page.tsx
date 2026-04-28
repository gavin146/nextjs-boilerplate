"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, Meter, TopBar } from "../../_ui/blocks";
import { APP_FOCUS_RING } from "../../_ui/focusRing";
import { TouchButton } from "../../_ui/TouchButton";
import { ChevronRightIcon, PlayIcon } from "../../_ui/icons";
import { useAppProgram } from "../providers/AppProgramProvider";

function statusPill(status: "up_next" | "scheduled" | "completed") {
  if (status === "up_next")
    return "bg-emerald-400/15 text-emerald-200 border border-emerald-400/20";
  if (status === "completed")
    return "bg-white/5 text-white/60 border border-white/10";
  return "bg-sky-400/15 text-sky-200 border border-sky-400/20";
}

export default function WorkoutPage() {
  const { workouts, state } = useAppProgram();

  const completedIds = useMemo(
    () => new Set(state.completedWorkoutIds),
    [state.completedWorkoutIds],
  );

  const { completedCount, upNext, weekProgressPct, pending } = useMemo(() => {
    const completedCount = workouts.filter((w) =>
      completedIds.has(w.id),
    ).length;
    const pending = workouts.filter((w) => !completedIds.has(w.id));
    const upNext =
      pending.find((w) => w.status === "up_next") ?? pending[0] ?? null;
    const weekProgressPct =
      workouts.length > 0
        ? Math.round((completedCount / workouts.length) * 100)
        : 0;
    return { completedCount, pending, upNext, weekProgressPct };
  }, [workouts, completedIds]);

  return (
    <div className="pb-6">
      <TopBar
        title="Train"
        subtitle={
          pending.length
            ? `${completedCount} of ${workouts.length} done`
            : "Week complete"
        }
      />

      <div className="space-y-3 px-4 pt-3">
        <Card className="p-4">
          <div className="flex items-end justify-between gap-2">
            <span className="text-[13px] text-white/50">Week</span>
            <span className="text-[22px] font-semibold tabular-nums">
              {completedCount}
              <span className="text-white/35">/{workouts.length}</span>
            </span>
          </div>
          <div className="mt-2">
            <Meter value={weekProgressPct} />
          </div>
        </Card>

        {upNext ? (
          <Card className="border-emerald-400/25 bg-emerald-400/[0.06] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/90">
              Next session
            </div>
            <div className="mt-2 text-[19px] font-semibold leading-snug">
              {upNext.title}
            </div>
            <div className="mt-1 text-[13px] text-white/55">
              {upNext.dayLabel} · {upNext.estimatedMinutes} min
            </div>
            <Link href={`/workout/${upNext.id}/exercise/0`} className="mt-4 block">
              <TouchButton left={<PlayIcon className="text-zinc-950" />}>
                Start session
              </TouchButton>
            </Link>
            <Link
              href={`/workout/${upNext.id}`}
              className="mt-2 block text-center text-[13px] font-medium text-sky-300/90"
            >
              Preview exercises & swaps
            </Link>
          </Card>
        ) : null}

        <div>
          <div className="mb-2 px-0.5 text-[14px] font-semibold tracking-tight text-white/58">
            Your week
          </div>
          <div className="space-y-2">
            {workouts.length ? (
              workouts.map((w) => {
                const done = completedIds.has(w.id);
                return (
                  <Link
                    key={w.id}
                    href={`/workout/${w.id}`}
                    className={`block rounded-2xl ${APP_FOCUS_RING}`}
                  >
                    <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 [touch-action:manipulation] transition active:bg-white/[0.07]">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-900 text-[12px] font-bold text-white/75">
                        {w.dayLabel}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[16px] font-semibold leading-tight tracking-tight">
                          {w.title}
                        </div>
                        <div className="mt-0.5 text-[13px] text-white/45">
                          {w.estimatedMinutes} min
                        </div>
                      </div>
                      <div
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill(
                          done ? "completed" : w.status,
                        )}`}
                      >
                        {done ? "Done" : "Open"}
                      </div>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-white/25" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <Card className="p-4">
                <p className="text-[14px] text-white/65">
                  No sessions yet. Tap Refresh my week on Today.
                </p>
              </Card>
            )}
          </div>
        </div>

        <p className="px-1 text-center text-[13px] leading-relaxed text-white/42">
          Questions mid-set? Use Ask coach on the exercise screen. Between
          sessions:{" "}
          <Link href="/coach" className="font-medium text-sky-400/90">
            Coach tab
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
