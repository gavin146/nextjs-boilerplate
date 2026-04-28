"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { coachFocusBlurb, deriveReadinessScore } from "../../_lib/domain";
import { useAppProgram } from "../providers/AppProgramProvider";
import { Card, Meter, TopBar } from "../../_ui/blocks";
import { APP_FOCUS_RING } from "../../_ui/focusRing";
import { TouchButton } from "../../_ui/TouchButton";
import { PlayIcon } from "../../_ui/icons";

const SORENESS = [
  "None",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Low back",
  "Shoulders",
];

export default function TodayPage() {
  const { state, workouts, saveDailyCheckIn, generateProgramFromCoach } =
    useAppProgram();

  const readiness = deriveReadinessScore(state.checkIns);
  const focus = coachFocusBlurb(state.checkIns);

  const weeklyPlanned = workouts.length;
  const weeklyDone = state.completedWorkoutIds.filter((id) =>
    workouts.some((w) => w.id === id),
  ).length;
  const weekPct =
    weeklyPlanned > 0 ? Math.round((weeklyDone / weeklyPlanned) * 100) : 0;

  const [sleepQ, setSleepQ] = useState(7);
  const [readyQ, setReadyQ] = useState(7);
  const [stressQ, setStressQ] = useState(5);
  const [sorePick, setSorePick] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [coachMsg, setCoachMsg] = useState<string | null>(null);

  const todaySaved = useMemo(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return state.checkIns.some((c) => c.dateISO === iso);
  }, [state.checkIns]);

  function toggleSore(label: string) {
    setSorePick((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label],
    );
  }

  async function onGenerateWeek() {
    setBusy(true);
    setCoachMsg(null);
    const r = await generateProgramFromCoach();
    setBusy(false);
    setCoachMsg(
      r.ok
        ? r.message ?? "Week updated. Open Train when you are ready."
        : r.message ?? "Could not generate",
    );
  }

  return (
    <div className="pb-6">
      <TopBar title="Today" subtitle="One minute check in, smarter sessions" />

      <div className="space-y-3 px-4 pt-3">
        {/* At-a-glance */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3.5">
            <div className="text-[12px] text-white/48">Ready score</div>
            <div className="mt-1 text-[26px] font-semibold tabular-nums text-emerald-200">
              {readiness}
            </div>
            <Meter value={readiness} />
          </Card>
          <Card className="p-3.5">
            <div className="text-[12px] text-white/48">This week</div>
            <div className="mt-1 text-[26px] font-semibold tabular-nums text-sky-200">
              {weekPct}%
            </div>
            <Meter value={weekPct} tone="blue" />
            <div className="mt-1 text-[12px] text-white/42">
              {weeklyDone}/{weeklyPlanned} sessions
            </div>
          </Card>
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/workout" className="block">
            <TouchButton left={<PlayIcon className="text-zinc-950" />} variant="blue">
              Train
            </TouchButton>
          </Link>
          <Link href="/progress" className="block">
            <TouchButton variant="secondary">Progress</TouchButton>
          </Link>
        </div>

        {/* Check-in */}
        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">
            Quick check in
          </div>
          <p className="mt-1 text-[13px] text-white/50">
            Slide once per day. Coach uses this for load.
          </p>

          <div className="mt-4 space-y-3">
            <SliderRow
              label="Sleep"
              value={sleepQ}
              onChange={setSleepQ}
              accent="accent-emerald-400"
            />
            <SliderRow
              label="Ready to lift"
              value={readyQ}
              onChange={setReadyQ}
              accent="accent-sky-400"
            />
            <SliderRow
              label="Stress"
              value={stressQ}
              onChange={setStressQ}
              accent="accent-amber-400"
            />

            <div>
              <div className="text-[12px] text-white/50">Sore spots</div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {SORENESS.map((label) => {
                  const on = sorePick.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleSore(label)}
                      className={`min-h-[44px] shrink-0 rounded-full border px-3 py-2 text-[13px] font-medium [touch-action:manipulation] transition active:opacity-90 ${APP_FOCUS_RING} ${
                        on
                          ? "border-sky-400/45 bg-sky-400/15 text-white"
                          : "border-white/12 bg-white/[0.05] text-white/75"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <TouchButton
              variant="secondary"
              size="md"
              type="button"
              onClick={() =>
                saveDailyCheckIn({
                  sleepQuality: sleepQ,
                  readiness: readyQ,
                  stress: stressQ,
                  soreness: sorePick,
                })
              }
            >
              {todaySaved ? "Saved · tap to update" : "Save check in"}
            </TouchButton>
          </div>
        </Card>

        {/* Coach */}
        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">
            Coach tip
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-white/75">
            {focus}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <TouchButton
              variant="secondary"
              size="md"
              type="button"
              disabled={busy}
              onClick={() => void onGenerateWeek()}
            >
              {busy ? "Updating plan…" : "Refresh my week"}
            </TouchButton>
            {coachMsg ? (
              <p className="text-[12px] leading-relaxed text-white/50">
                {coachMsg}
              </p>
            ) : null}
            <p className="text-[11px] leading-snug text-white/42">
              During sets, answers live on each exercise screen (Ask coach).
            </p>
            <Link
              href="/coach"
              className={`flex min-h-[52px] items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[15px] font-semibold text-sky-200/95 [touch-action:manipulation] transition active:bg-white/[0.08] ${APP_FOCUS_RING}`}
            >
              Coach tab →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  accent: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[12px] text-white/55">
        <span>{label}</span>
        <span className="tabular-nums font-medium text-white/90">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1.5 h-3 w-full ${accent}`}
      />
    </div>
  );
}
