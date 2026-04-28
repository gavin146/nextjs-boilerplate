"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProgramExercise } from "../../../_lib/exerciseMedia";
import { alternativesFor } from "../../../_lib/exerciseLibrary";
import { useVisualViewportInset } from "../../../_lib/useVisualViewportInset";
import { useAppProgram } from "../../providers/AppProgramProvider";
import { Card, TopBar } from "../../../_ui/blocks";
import { APP_FOCUS_RING } from "../../../_ui/focusRing";
import { SwapExerciseVideoThumb } from "../../../_ui/SwapExerciseVideoThumb";
import { TouchButton } from "../../../_ui/TouchButton";
import { ChevronRightIcon, PlayIcon } from "../../../_ui/icons";

export function WorkoutDetailClient({ workoutId }: { workoutId: string }) {
  const { workouts, swapExercise } = useAppProgram();
  const keyboardInset = useVisualViewportInset();
  const workout = useMemo(
    () => workouts.find((w) => w.id === workoutId),
    [workouts, workoutId],
  );

  const [swapIdx, setSwapIdx] = useState<number | null>(null);
  const swapTarget =
    swapIdx != null ? workout?.exercises[swapIdx] ?? null : null;
  const swapOptions = swapTarget ? alternativesFor(swapTarget) : [];

  useEffect(() => {
    if (swapIdx == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [swapIdx]);

  useEffect(() => {
    if (swapIdx == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSwapIdx(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swapIdx]);

  if (!workout) {
    return (
      <div className="min-h-dvh">
        <TopBar backHref="/workout" title="Workout" subtitle="Not found" />
        <div className="px-4 pt-4">
          <Card className="p-4">
            <div className="text-[15px]">That workout does not exist.</div>
            <div className="mt-3">
              <Link href="/workout" className="block">
                <TouchButton variant="secondary">Back to workouts</TouchButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalSets = workout.exercises.reduce((n, e) => n + e.sets.length, 0);
  const first = workout.exercises[0];

  function applySwap(template: ProgramExercise) {
    if (swapIdx == null || !workout) return;
    swapExercise(workout.id, swapIdx, template);
    setSwapIdx(null);
  }

  const sheetLift =
    keyboardInset > 0 ? ({ marginBottom: keyboardInset } as const) : undefined;

  return (
    <div className="pb-6">
      <TopBar
        backHref="/workout"
        title={workout.title}
        subtitle={`${workout.dayLabel} · ~${workout.estimatedMinutes} min`}
      />

      <div className="space-y-3 px-4 pt-3">
        <Card className="border border-white/10 bg-gradient-to-b from-sky-400/[0.06] to-transparent p-4">
          <div className="text-[12px] text-white/45">First lift</div>
          <div className="mt-1 text-[17px] font-semibold leading-snug">
            {first?.name ?? "Exercise"}
          </div>
          <div className="mt-2 text-[13px] text-white/50">
            {workout.exercises.length} moves · {totalSets} sets · {workout.focus}
          </div>

          <div className="mt-4 space-y-2">
            <Link href={`/workout/${workout.id}/exercise/0`} className="block">
              <TouchButton left={<PlayIcon className="text-zinc-950" />}>
                Start workout
              </TouchButton>
            </Link>
            <p className="text-center text-[11px] leading-snug text-white/40">
              Mid-session: tap Ask coach on each exercise screen for instant cues.
            </p>
            <Link
              href="/coach"
              className="block text-center text-[13px] font-medium text-sky-300/90"
            >
              Coach tab — general questions
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">Exercises</div>
          <p className="mt-1 text-[13px] text-white/48">
            Tap to log sets. Swap before you start if you need a different move.
          </p>
          <div className="mt-4 space-y-2">
            {workout.exercises.map((ex, idx) => (
              <div key={`${ex.id}-${idx}`} className="space-y-2">
                <Link
                  href={`/workout/${workout.id}/exercise/${idx}`}
                  className={`block rounded-2xl ${APP_FOCUS_RING}`}
                >
                  <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition active:bg-white/[0.07]">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-900 text-[14px] font-bold tabular-nums text-sky-200/90">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-semibold leading-tight tracking-tight">
                        {ex.name}
                      </div>
                      <div className="mt-0.5 text-[13px] text-white/48">
                        {ex.sets.length} sets · {ex.sets[0]?.reps ?? ""} reps
                        {ex.sets[0]?.suggestedWeight
                          ? ` · ${ex.sets[0].suggestedWeight}`
                          : null}
                      </div>
                    </div>
                    <ChevronRightIcon className="shrink-0 text-white/30" />
                  </div>
                </Link>
                <TouchButton
                  variant="ghost"
                  size="md"
                  className="!h-10 border border-white/10 bg-white/[0.03] text-[13px] text-white/75"
                  type="button"
                  onClick={() => setSwapIdx(idx)}
                >
                  Swap exercise
                </TouchButton>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {swapIdx != null && swapTarget ? (
        <div
          className="fixed inset-0 z-[90] flex flex-col justify-end bg-black/60 backdrop-blur-[3px] pt-[env(safe-area-inset-top,0px)] [touch-action:manipulation]"
          role="dialog"
          aria-modal="true"
          aria-label="Pick replacement exercise"
        >
          <button
            type="button"
            className="min-h-[44px] flex-1 cursor-default sm:min-h-0"
            aria-label="Dismiss"
            onClick={() => setSwapIdx(null)}
          />
          <div
            style={sheetLift}
            className="flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8px))] w-full max-w-[430px] flex-col overflow-hidden self-center rounded-t-[1.35rem] border border-white/12 border-b-0 bg-zinc-950 shadow-[0_-8px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="shrink-0 px-3 pb-2 pt-2 sm:px-4 sm:pb-3 sm:pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25 sm:w-12" />
              <div className="mb-4 flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
                  <SwapExerciseVideoThumb
                    exercise={swapTarget}
                    videoClassName="object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/42">
                    Replacing
                  </div>
                  <div className="truncate text-[15px] font-semibold leading-snug text-white">
                    {swapTarget.name}
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-semibold leading-snug tracking-tight text-white">
                Pick a replacement
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-white/50">
                Preview loops muted · tap an exercise to swap.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-1 app-scroll-touch [-webkit-overflow-scrolling:touch] sm:px-4 sm:pb-2">
              {swapOptions.length ? (
                <div className="flex flex-col gap-3 pb-4">
                  {swapOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-label={`Replace with ${opt.name}`}
                      onClick={() => applySwap(opt)}
                      className={`flex min-h-[72px] w-full gap-3 rounded-2xl border border-white/10 bg-white/[0.04] py-2 pl-2 pr-3 text-left [touch-action:manipulation] transition active:bg-white/[0.07] focus-visible:bg-white/[0.06] ${APP_FOCUS_RING}`}
                    >
                      <div className="relative h-[108px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/8">
                        <SwapExerciseVideoThumb
                          exercise={opt}
                          videoClassName="object-top"
                        />
                      </div>
                      <div className="flex min-h-[108px] min-w-0 flex-1 flex-col justify-center gap-1 py-1">
                        <span className="text-[15px] font-semibold leading-snug text-white sm:text-[16px]">
                          {opt.name}
                        </span>
                        <span className="line-clamp-3 text-[12px] leading-snug text-white/52 sm:text-[13px]">
                          {opt.cue}
                        </span>
                      </div>
                      <ChevronRightIcon className="mt-auto mb-auto h-5 w-5 shrink-0 self-center text-white/28" aria-hidden />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="pb-6 text-[13px] text-white/50">
                  No alternates in the library yet for this pattern.
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
              <TouchButton
                variant="secondary"
                size="md"
                type="button"
                className="!h-[52px] w-full text-[15px]"
                onClick={() => setSwapIdx(null)}
              >
                Cancel
              </TouchButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
