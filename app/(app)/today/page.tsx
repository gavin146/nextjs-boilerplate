"use client";

import Link from "next/link";
import { Card, Meter, TopBar } from "../../_ui/blocks";
import { TouchButton } from "../../_ui/TouchButton";
import { PlayIcon } from "../../_ui/icons";

export default function TodayPage() {
  // Demo dashboard numbers (will eventually come from client profile + workout logs).
  const weeklyWorkoutsDone = 1;
  const weeklyWorkoutsPlanned = 3;
  const weeklyCompletion = Math.round(
    (weeklyWorkoutsDone / weeklyWorkoutsPlanned) * 100,
  );

  const tonnageThisWeek = 18250;
  const prCount30d = 3;
  const readiness = 82;

  return (
    <div className="min-h-dvh">
      <TopBar title="Today" subtitle="Client dashboard" />
      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="text-[12px] text-white/60">Readiness</div>
            <div className="mt-2 text-[28px] font-semibold tracking-tight text-emerald-200">
              {readiness}
            </div>
            <div className="mt-2">
              <Meter value={readiness} />
            </div>
            <div className="mt-2 text-[12px] text-white/50">
              Sleep + soreness + stress
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[12px] text-white/60">Week completion</div>
            <div className="mt-2 text-[28px] font-semibold tracking-tight text-sky-200">
              {weeklyCompletion}%
            </div>
            <div className="mt-2">
              <Meter value={weeklyCompletion} tone="blue" />
            </div>
            <div className="mt-2 text-[12px] text-white/50">
              {weeklyWorkoutsDone}/{weeklyWorkoutsPlanned} workouts
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">
                Lifting stats
              </div>
              <div className="mt-1 text-[13px] text-white/60">
                This week’s training load + recent PRs.
              </div>
            </div>
            <div className="mt-1 rounded-2xl bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-200">
              Live
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-[12px] text-white/60">Tonnage</div>
              <div className="mt-2 text-[18px] font-semibold tracking-tight">
                {tonnageThisWeek.toLocaleString()} lb
              </div>
              <div className="mt-1 text-[12px] text-white/50">7 days</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-[12px] text-white/60">PRs</div>
              <div className="mt-2 text-[18px] font-semibold tracking-tight">
                {prCount30d}
              </div>
              <div className="mt-1 text-[12px] text-white/50">last 30 days</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/workout" className="block">
              <TouchButton
                left={<PlayIcon className="text-zinc-950" />}
                variant="blue"
              >
                Workouts
              </TouchButton>
            </Link>
            <TouchButton variant="secondary">Progress</TouchButton>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">
            AI focus
          </div>
          <div className="mt-2 text-[13px] leading-6 text-white/70">
            Today is about crisp reps and consistency. Keep the first set
            conservative, then let the final set be the honest one.
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TouchButton variant="secondary" size="md">
              Warm-up
            </TouchButton>
            <TouchButton variant="secondary" size="md">
              Mobility
            </TouchButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

