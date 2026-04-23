"use client";

import Link from "next/link";
import { Card, Meter, TopBar } from "../../_ui/blocks";
import { demoWeekWorkouts } from "../../_lib/programData";
import { TouchButton } from "../../_ui/TouchButton";
import { ChevronRightIcon, PlayIcon } from "../../_ui/icons";

function statusPill(status: "up_next" | "scheduled" | "completed") {
  if (status === "up_next")
    return "bg-emerald-400/15 text-emerald-200 border border-emerald-400/20";
  if (status === "completed")
    return "bg-white/5 text-white/60 border border-white/10";
  return "bg-sky-400/15 text-sky-200 border border-sky-400/20";
}

export default function WorkoutPage() {
  const all = demoWeekWorkouts();
  const workouts = all.filter((w) => w.status !== "completed");
  const upNext = all.find((w) => w.status === "up_next") ?? workouts[0];
  const completed = all.filter((w) => w.status === "completed").length;
  const weekProgressPct =
    all.length > 0 ? Math.round((completed / all.length) * 100) : 0;
  const remaining = workouts.length;

  return (
    <div className="min-h-dvh">
      <TopBar
        title="Workout"
        subtitle={
          remaining
            ? `${remaining} left this week · ${completed} done`
            : "Week complete"
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <Card className="p-4 border-white/5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-medium text-white/50">
                Week progress
              </div>
              <div className="mt-1 text-[28px] font-semibold tabular-nums tracking-tight text-white">
                {completed}
                <span className="text-white/40">/{all.length}</span>
              </div>
            </div>
            <div className="text-right text-[12px] text-white/50">
              sessions
            </div>
          </div>
          <div className="mt-3">
            <Meter value={weekProgressPct} />
          </div>
        </Card>

        {upNext ? (
          <Card className="p-4 border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.12] to-white/[0.04] shadow-[0_0_0_1px_rgba(52,211,153,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold tracking-wide text-emerald-200/95">
                  UP NEXT
                </div>
                <div className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">
                  {upNext.title}
                </div>
                <div className="mt-1.5 text-[13px] text-white/55">
                  {upNext.dayLabel} · {upNext.estimatedMinutes} min ·{" "}
                  {upNext.focus}
                </div>
              </div>
              <div className="shrink-0 rounded-2xl bg-emerald-400/20 px-3 py-1.5 text-[12px] font-semibold text-emerald-100">
                Ready
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Link href={`/workout/${upNext.id}`} className="block">
                <TouchButton
                  left={<PlayIcon className="text-zinc-950" />}
                  right={<span className="text-[13px] opacity-70">Start</span>}
                >
                  Open workout
                </TouchButton>
              </Link>
              <Link href={`/workout/${upNext.id}/exercise/0`} className="block">
                <TouchButton variant="blue" size="md">
                  Jump to first exercise
                </TouchButton>
              </Link>
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="text-[16px] font-semibold tracking-tight">Schedule</div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-white/55">
            Tap a session for the full list. Training order follows your
            program.
          </div>

          <div className="mt-4 space-y-2.5">
            {workouts.length ? (
              workouts.map((w) => (
                <Link key={w.id} href={`/workout/${w.id}`} className="block">
                  <div className="flex items-stretch gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-1.5 pl-1.5 transition active:scale-[0.99] active:bg-white/[0.07]">
                    <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-zinc-900/80 py-2 text-[11px] font-bold tabular-nums text-white/70">
                      {w.dayLabel}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[17px] font-semibold leading-tight tracking-tight">
                            {w.title}
                          </div>
                          <div className="mt-0.5 text-[13px] text-white/50">
                            {w.estimatedMinutes} min · {w.focus}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <div
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(
                              w.status,
                            )}`}
                          >
                            {w.status === "up_next"
                              ? "Up next"
                              : w.status === "scheduled"
                                ? "Scheduled"
                                : "Done"}
                          </div>
                          <ChevronRightIcon className="text-white/30" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-[15px] font-semibold tracking-tight">
                  No workouts left
                </div>
                <div className="mt-1 text-[13px] text-white/60">
                  You’re done for the week. We’ll load next week’s plan soon.
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] text-white/60">AI coach</div>
              <div className="mt-2 text-[15px] leading-6">
                If sleep is low or soreness is high, I’ll lower intensity and
                keep volume productive.
              </div>
            </div>
            <div className="mt-1 rounded-2xl bg-sky-400/15 px-3 py-1 text-[12px] font-semibold text-sky-200">
              Adaptive
            </div>
          </div>
          <div className="mt-4">
            <Link href="/coach" className="block">
              <TouchButton
                variant="blue"
                left={<PlayIcon className="text-zinc-950" />}
              >
                Ask the coach
              </TouchButton>
            </Link>
          </div>
        </Card>

        <div className="h-6" />
      </div>
    </div>
  );
}

