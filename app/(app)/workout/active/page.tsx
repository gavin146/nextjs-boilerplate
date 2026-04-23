"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { demoWorkout, pct, type WorkoutExercise } from "../../../_lib/workoutData";
import { Card, Meter, TopBar } from "../../../_ui/blocks";
import { TouchButton } from "../../../_ui/TouchButton";
import { BoltIcon, CheckIcon } from "../../../_ui/icons";

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function WorkoutActivePage() {
  const [restSeconds, setRestSeconds] = useState(75);
  const [restOpen, setRestOpen] = useState(false);
  const [restRemaining, setRestRemaining] = useState(restSeconds);
  const [restRunning, setRestRunning] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(demoWorkout());

  const { doneSets, totalSets, progress } = useMemo(() => {
    const all = exercises.flatMap((e) => e.sets);
    const done = all.filter((s) => s.state === "done").length;
    const total = all.length;
    return { doneSets: done, totalSets: total, progress: pct(done, total) };
  }, [exercises]);

  const nextUp = useMemo(() => {
    for (const ex of exercises) {
      const idx = ex.sets.findIndex((s) => s.state === "todo");
      if (idx !== -1) return { exId: ex.id, setId: ex.sets[idx]?.id };
    }
    return null;
  }, [exercises]);

  const nextSetInfo = useMemo(() => {
    if (!nextUp) return null;
    const ex = exercises.find((e) => e.id === nextUp.exId);
    const set = ex?.sets.find((s) => s.id === nextUp.setId);
    if (!ex || !set) return null;
    const setIndex = ex.sets.findIndex((s) => s.id === set.id);
    return { exName: ex.name, target: set.target, setIndex };
  }, [exercises, nextUp]);

  function toggleSet(exId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId
              ? { ...s, state: s.state === "done" ? "todo" : "done" }
              : s,
          ),
        };
      }),
    );
  }

  function markNextDone() {
    if (!nextUp) return;
    toggleSet(nextUp.exId, nextUp.setId);
  }

  function openRestSheet() {
    setRestRemaining(restSeconds);
    setRestRunning(true);
    setRestOpen(true);
  }

  function resetDemo() {
    setExercises(demoWorkout());
    setRestSeconds(75);
    setRestRemaining(75);
    setRestRunning(false);
    setRestOpen(false);
  }

  // Keep remaining time in sync with rest target when the timer isn't running.
  useEffect(() => {
    if (restRunning) return;
    setRestRemaining(restSeconds);
  }, [restSeconds, restRunning]);

  const lastTick = useRef<number | null>(null);
  useEffect(() => {
    if (!restRunning) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const prev = lastTick.current ?? now;
      lastTick.current = now;
      const delta = Math.max(0, now - prev);
      const dec = delta / 1000;
      setRestRemaining((t) => Math.max(0, t - dec));
    }, 250);
    return () => {
      window.clearInterval(id);
      lastTick.current = null;
    };
  }, [restRunning]);

  useEffect(() => {
    if (!restRunning) return;
    if (restRemaining > 0) return;
    setRestRunning(false);
  }, [restRemaining, restRunning]);

  return (
    <div className="min-h-dvh">
      <TopBar
        title="Workout"
        subtitle={`${doneSets}/${totalSets} sets · Rest ${restSeconds}s`}
        right={
          <div className="text-right">
            <div className="text-[12px] text-white/60">Progress</div>
            <div className="mt-1 text-[13px] font-semibold text-emerald-300">
              {progress}%
            </div>
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <div className="sticky top-[calc(env(safe-area-inset-top)+64px)] z-10">
          <Card className="p-4 border-sky-400/10 bg-gradient-to-b from-sky-400/10 to-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold tracking-tight text-sky-200">
                  NOW
                </div>
                <div className="mt-1 text-[16px] font-semibold tracking-tight">
                  {nextSetInfo ? nextSetInfo.exName : "Workout complete"}
                </div>
                <div className="mt-1 text-[13px] text-white/70">
                  {nextSetInfo
                    ? `Set ${nextSetInfo.setIndex + 1} · ${nextSetInfo.target}`
                    : "All sets done. Nice work."}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-white/60">Rest</div>
                <div className="mt-1 text-[13px] font-semibold text-sky-200">
                  {formatClock(restRemaining)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[16px] font-semibold tracking-tight">
                Strength Session A
              </div>
              <div className="mt-1 text-[13px] text-white/60">
                Big compounds, crisp execution.
              </div>
            </div>
            <div className="min-w-[92px]">
              <Meter value={progress} />
              <div className="mt-2 text-right text-[12px] text-white/60">
                {doneSets}/{totalSets}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <TouchButton variant="secondary" onClick={openRestSheet}>
              Rest timer
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => setRestSeconds(Math.min(180, restSeconds + 15))}
            >
              +15s
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => setRestSeconds(Math.max(30, restSeconds - 15))}
            >
              -15s
            </TouchButton>
            <TouchButton
              variant="blue"
              onClick={resetDemo}
              left={<BoltIcon className="text-zinc-950" />}
            >
              Reset demo
            </TouchButton>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] text-white/60">AI cue</div>
              <div className="mt-2 text-[15px] leading-6">
                Keep bar speed consistent. If reps slow early, drop 5–10 lb and
                keep the pattern sharp.
              </div>
            </div>
            <div className="mt-1 rounded-2xl bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-200">
              Live
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex} onToggleSet={toggleSet} />
          ))}
        </div>

        <div className="h-6" />
      </div>

      <BottomActionBar
        canComplete={Boolean(nextUp)}
        onComplete={markNextDone}
        onRest={openRestSheet}
      />

      <RestSheet
        open={restOpen}
        remaining={restRemaining}
        target={restSeconds}
        running={restRunning}
        onClose={() => setRestOpen(false)}
        onToggleRunning={() => setRestRunning((v) => !v)}
        onReset={() => {
          setRestRemaining(restSeconds);
          setRestRunning(false);
        }}
        onAdd15={() => {
          setRestRemaining((t) => Math.min(600, t + 15));
          setRestRunning(true);
        }}
        onSub15={() => setRestRemaining((t) => Math.max(0, t - 15))}
      />
    </div>
  );
}

function BottomActionBar({
  canComplete,
  onComplete,
  onRest,
}: {
  canComplete: boolean;
  onComplete: () => void;
  onRest: () => void;
}) {
  return (
    <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-0 right-0 z-30">
      <div className="mx-auto w-full max-w-[430px] px-4">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/75 backdrop-blur-xl p-3 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRest}
              className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-white/5 text-white/80 active:scale-[0.99]"
              aria-label="Open rest timer"
            >
              <span className="text-[12px] font-semibold">REST</span>
            </button>
            <div className="flex-1">
              <TouchButton
                disabled={!canComplete}
                onClick={onComplete}
                left={<CheckIcon className="text-zinc-950" />}
              >
                {canComplete ? "Complete set" : "Workout complete"}
              </TouchButton>
            </div>
          </div>
          <div className="mt-2 text-[12px] text-white/50">
            Thumb-first controls · always on screen
          </div>
        </div>
      </div>
    </div>
  );
}

function RestSheet({
  open,
  remaining,
  target,
  running,
  onClose,
  onToggleRunning,
  onReset,
  onAdd15,
  onSub15,
}: {
  open: boolean;
  remaining: number;
  target: number;
  running: boolean;
  onClose: () => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onAdd15: () => void;
  onSub15: () => void;
}) {
  const pctDone = useMemo(() => {
    if (target <= 0) return 0;
    const v = 1 - remaining / target;
    return Math.max(0, Math.min(1, v));
  }, [remaining, target]);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;
    wasOpen.current = true;
    closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close rest timer"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-[430px] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="rounded-[28px] border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-[0_30px_90px_-60px_rgba(0,0,0,0.95)] overflow-hidden">
            <div className="px-4 py-4 border-b border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] font-semibold text-sky-200">
                    REST TIMER
                  </div>
                  <div className="mt-1 text-[22px] font-semibold tracking-tight">
                    {formatClock(remaining)}
                  </div>
                  <div className="mt-1 text-[13px] text-white/60">
                    Target {target}s
                  </div>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-white/80 active:scale-[0.99]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400 transition-[width]"
                  style={{ width: `${Math.round(pctDone * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  variant={running ? "secondary" : "blue"}
                  onClick={onToggleRunning}
                >
                  {running ? "Pause" : "Start"}
                </TouchButton>
                <TouchButton variant="secondary" onClick={onReset}>
                  Reset
                </TouchButton>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <TouchButton variant="secondary" size="md" onClick={onSub15}>
                  -15
                </TouchButton>
                <TouchButton variant="secondary" size="md" onClick={onAdd15}>
                  +15
                </TouchButton>
                <TouchButton variant="secondary" size="md" onClick={onClose}>
                  Done
                </TouchButton>
              </div>

              <div className="text-[12px] leading-5 text-white/50">
                Quick tip: start rest as you rack the weight. Keep the timer
                honest and the pace consistent.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({
  ex,
  onToggleSet,
}: {
  ex: WorkoutExercise;
  onToggleSet: (exId: string, setId: string) => void;
}) {
  const done = ex.sets.filter((s) => s.state === "done").length;
  const total = ex.sets.length;
  const p = pct(done, total);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold tracking-tight">
              {ex.name}
            </div>
            {ex.note ? (
              <div className="mt-1 text-[13px] leading-6 text-white/60">
                {ex.note}
              </div>
            ) : null}
          </div>
          <div className="min-w-[84px] text-right">
            <div className="text-[12px] text-white/60">Sets</div>
            <div className="mt-1 text-[13px] font-semibold text-white/90">
              {done}/{total}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Meter value={p} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="px-4 py-3 space-y-2">
          {ex.sets.map((s, idx) => {
            const isDone = s.state === "done";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggleSet(ex.id, s.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isDone
                    ? "border-emerald-400/20 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/7"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] text-white/60">
                      Set {idx + 1}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold tracking-tight">
                      {s.target}
                    </div>
                  </div>
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-2xl border ${
                      isDone
                        ? "border-emerald-400/30 bg-emerald-400 text-zinc-950"
                        : "border-white/10 bg-white/5 text-white/70"
                    }`}
                    aria-hidden
                  >
                    <CheckIcon className={isDone ? "text-zinc-950" : ""} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

