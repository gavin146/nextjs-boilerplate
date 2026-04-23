"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ProgramExercise } from "../../../../../_lib/exerciseMedia";
import { exerciseVideoSources } from "../../../../../_lib/exerciseMedia";
import { demoWeekWorkouts } from "../../../../../_lib/programData";
import { TouchButton } from "../../../../../_ui/TouchButton";
import { CheckIcon } from "../../../../../_ui/icons";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const DEFAULT_REST_SEC = 90;

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Infer load unit for display (demo data is mostly lb / dumbbell pairs "55s"). */
function displayWeightUnit(suggestedWeight: string): string {
  const t = suggestedWeight.toLowerCase();
  if (t.includes("kg")) return "kg";
  return "lb";
}

function stripLoadUnit(s: string): string {
  return s.replace(/\s*(lb|lbs|kg)\s*$/i, "").trim();
}

/** Top row inside frosted card: fixed-width side actions, flexible truncating label. */
function VoltWorkoutTopBar({
  backHref,
  finishHref,
  sessionTitle,
}: {
  backHref: string;
  finishHref: string;
  sessionTitle: string;
}) {
  const label = sessionTitle.trim() || "Workout";
  const actionShell =
    "box-border size-8 max-h-8 max-w-8 min-h-8 min-w-8 shrink-0 select-none [touch-action:manipulation] transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400/50";
  return (
    <div className="flex w-full min-w-0 max-w-full items-center gap-1.5 overflow-hidden sm:gap-2">
      <Link
        href={backHref}
        className={`${actionShell} flex items-center justify-center rounded-md border border-white/10 bg-zinc-900/50 text-[14px] font-bold leading-none text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/15 hover:bg-zinc-800/60`}
        aria-label="Workout menu and overview"
      >
        ···
      </Link>
      <p
        className="min-w-0 flex-1 truncate text-center text-[12px] font-semibold leading-tight text-white/85 sm:text-[13px] sm:leading-snug"
        title={label}
        aria-label={`Session: ${label}`}
      >
        {label}
      </p>
      <Link
        href={finishHref}
        className="box-border flex h-8 w-12 min-w-12 max-w-12 shrink-0 select-none items-center justify-center rounded-md border border-sky-400/30 bg-sky-500/15 text-[7px] font-bold leading-none tracking-tight text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [touch-action:manipulation] transition hover:border-sky-400/50 hover:bg-sky-500/20 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400/50 sm:text-[8px]"
        aria-label="Finish workout"
      >
        FINISH
      </Link>
    </div>
  );
}

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(circle_at_70%_20%,rgba(52,211,153,0.16),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 max-h-40 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-[16px] font-semibold leading-tight tracking-tight text-white/95">
          {label}
        </div>
        <div className="mt-1 text-[12px] text-white/55">
          Video unavailable — add asset or check connection.
        </div>
      </div>
    </div>
  );
}

function DemoExerciseMedia({
  exercise,
  hideBottomLabel = false,
}: {
  exercise: ProgramExercise;
  /** Hide title under video when the page header already shows the name. */
  hideBottomLabel?: boolean;
}) {
  const movekitKey =
    exercise.movekit?.kind === "key"
      ? exercise.movekit.key
      : exercise.movekit?.kind === "mp4"
        ? exercise.movekit.src
        : "";

  const sources = useMemo(() => exerciseVideoSources(exercise), [
    exercise.id,
    exercise.name,
    exercise.movekit?.kind,
    movekitKey,
  ]);
  const sourcesKey = useMemo(() => {
    return `${exercise.id}|${exercise.movekit?.kind ?? "none"}|${movekitKey}`;
  }, [exercise.id, exercise.movekit?.kind, movekitKey]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setSourceIndex(0);
    setFailed(false);
  }, [sourcesKey]);

  const demo = sources[sourceIndex] ?? sources[0];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.controls = false;
    v.disablePictureInPicture = true;

    const kick = async () => {
      try {
        await v.play();
      } catch {
        // Autoplay policies: if blocked, user interaction elsewhere can restart later.
      }
    };

    void kick();

    const onPause = () => {
      void kick();
    };

    v.addEventListener("pause", onPause);
    return () => v.removeEventListener("pause", onPause);
  }, [demo.src, sourcesKey, sourceIndex]);

  if (failed) {
    return <VideoPlaceholder label={exercise.mediaLabel} />;
  }

  const videoBase = "h-full w-full min-h-0 bg-zinc-950";

  if (hideBottomLabel) {
    return (
      <div className="relative h-full w-full min-h-0 overflow-hidden bg-zinc-950">
        <video
          ref={videoRef}
          className={`${videoBase} object-cover object-center`}
          src={demo.src}
          autoPlay
          muted
          playsInline
          loop
          disablePictureInPicture
          preload="metadata"
          tabIndex={-1}
          onContextMenu={(e) => e.preventDefault()}
          onError={() => {
            setSourceIndex((idx) => {
              const next = idx + 1;
              if (next < sources.length) return next;
              setFailed(true);
              return idx;
            });
          }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 max-h-40 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <video
        ref={videoRef}
        className={`${videoBase} object-contain`}
        src={demo.src}
        autoPlay
        muted
        playsInline
        loop
        disablePictureInPicture
        preload="metadata"
        tabIndex={-1}
        onContextMenu={(e) => e.preventDefault()}
        onError={() => {
          setSourceIndex((idx) => {
            const next = idx + 1;
            if (next < sources.length) return next;
            setFailed(true);
            return idx;
          });
        }}
      />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 max-h-56 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
        <div className="text-[16px] font-semibold leading-tight tracking-tight sm:text-[18px]">
          {exercise.name}
        </div>
        <div className="mt-0.5 text-[11px] text-white/65 sm:mt-1 sm:text-[12px]">
          {demo.label} · {demo.credit}
        </div>
      </div>
    </div>
  );
}

export function ExerciseSessionClient({
  workoutId,
  indexParam,
}: {
  workoutId: string;
  indexParam: string;
}) {
  const workout = useMemo(
    () => demoWeekWorkouts().find((w) => w.id === workoutId),
    [workoutId],
  );
  const idx = clamp(Number(indexParam || 0), 0, 999);

  const exercise = workout?.exercises[idx];
  const total = workout?.exercises.length ?? 0;

  const [doneSetIds, setDoneSetIds] = useState<Record<string, true>>({});
  const [performed, setPerformed] = useState<
    Record<string, { reps: string; weight: string }>
  >({});
  /** Remaining rest seconds, only after a set is completed with more to go; not shown before first log. */
  const [restRemaining, setRestRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!exercise) return;
    const next: Record<string, { reps: string; weight: string }> = {};
    for (const s of exercise.sets) {
      next[`${exercise.id}:${s.id}`] = {
        reps: s.reps,
        weight: s.suggestedWeight,
      };
    }
    setPerformed(next);
    setDoneSetIds({});
    setRestRemaining(null);
  }, [exercise, indexParam, workoutId]);

  useEffect(() => {
    if (restRemaining == null) return;
    if (restRemaining > 0) {
      const t = setTimeout(
        () => setRestRemaining((r) => (r == null ? null : r - 1)),
        1000,
      );
      return () => clearTimeout(t);
    }
    if (restRemaining === 0) {
      setRestRemaining(null);
    }
  }, [restRemaining]);

  const allSetsDone = useMemo(() => {
    if (!exercise) return false;
    return exercise.sets.every(
      (s) => doneSetIds[`${exercise.id}:${s.id}`],
    );
  }, [doneSetIds, exercise]);

  function setKey(setId: string) {
    if (!exercise) return "";
    return `${exercise.id}:${setId}`;
  }

  function onToggleSetDone(rowIndex: number) {
    if (!exercise) return;
    if (restRemaining != null && restRemaining > 0) return;

    const s = exercise.sets[rowIndex] ?? exercise.sets[0]!;
    const k = setKey(s.id);

    if (doneSetIds[k]) {
      setRestRemaining(null);
      setDoneSetIds((prev) => {
        const c = { ...prev };
        delete c[k];
        return c;
      });
      return;
    }

    const afterMark: Record<string, true> = { ...doneSetIds, [k]: true };
    setDoneSetIds(afterMark);
    const firstIncomplete = exercise.sets.findIndex(
      (s2) => !afterMark[setKey(s2.id)],
    );
    if (firstIncomplete >= 0) {
      setRestRemaining(DEFAULT_REST_SEC);
    }
  }

  function skipRest() {
    if (restRemaining == null) return;
    setRestRemaining(0);
  }

  function unlogLastSet() {
    if (!exercise) return;
    for (let i = exercise.sets.length - 1; i >= 0; i--) {
      const s = exercise.sets[i]!;
      const k = setKey(s.id);
      if (doneSetIds[k]) {
        setRestRemaining(null);
        setDoneSetIds((prev) => {
          const c = { ...prev };
          delete c[k];
          return c;
        });
        return;
      }
    }
  }

  if (!workout || !exercise) {
    return (
      <div className="min-h-dvh px-4 pt-[calc(env(safe-area-inset-top)+16px)]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-[16px] font-semibold">Exercise not found</div>
          <div className="mt-4">
            <Link href="/workout" className="block">
              <TouchButton variant="secondary">Back</TouchButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const prevHref = idx > 0 ? `/workout/${workout.id}/exercise/${idx - 1}` : null;
  const nextHref =
    idx < total - 1 ? `/workout/${workout.id}/exercise/${idx + 1}` : null;

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
    >
      <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col bg-zinc-950">
        <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col px-0">
          <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] sm:rounded-3xl">
            <div className="shrink-0 border-b border-white/6 bg-zinc-950/30 py-1.5 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] pt-[env(safe-area-inset-top,0px)] sm:px-4 sm:py-2">
              <VoltWorkoutTopBar
                backHref={`/workout/${workout.id}`}
                finishHref={`/workout/${workout.id}`}
                sessionTitle={workout.title}
              />
            </div>
            <div className="min-w-0 shrink-0 border-b border-white/5 py-1.5 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] sm:pl-4 sm:pr-4">
              <div className="flex min-w-0 items-baseline justify-between gap-2 sm:gap-3">
                <h1
                  className="min-w-0 flex-1 truncate text-left text-[15px] font-medium leading-5 text-white/90 antialiased [text-rendering:optimizeLegibility] sm:text-[16px]"
                  title={exercise.name}
                >
                  {exercise.name}
                </h1>
                {total > 0 ? (
                  <span
                    className="shrink-0 pl-0.5 text-right text-[12px] font-medium tabular-nums leading-5 text-white/45 sm:text-[13px]"
                    aria-label={`Exercise ${idx + 1} of ${total}`}
                  >
                    {idx + 1}/{total}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,9fr)_minmax(0,13fr)]">
            <div className="min-h-0 w-full min-w-0 overflow-hidden bg-zinc-950">
              <DemoExerciseMedia exercise={exercise} hideBottomLabel />
            </div>

            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t border-white/10">
            {(() => {
              const n = exercise.sets.length;
              const firstIncomplete = exercise.sets.findIndex(
                (s2) => !doneSetIds[setKey(s2.id)],
              );
              const inRest =
                restRemaining != null && restRemaining > 0;

              return (
                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    className={`min-h-0 flex-1 overflow-y-auto pb-2 pt-2.5 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] sm:pl-4 sm:pr-4 ${
                      inRest ? "pointer-events-none select-none" : ""
                    } ${inRest ? "opacity-45" : ""}`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Sets
                    </div>
                    <p className="mt-0.5 text-[10px] text-white/40">
                      Tap ✓ when done — rest before the next set.
                    </p>
                    <div
                      className="mt-3 grid w-full min-w-0 items-center gap-x-2 gap-y-3 [grid-template-columns:1.4rem_1fr_1.15fr_2.4rem] sm:gap-x-2.5 [grid-template-columns:1.5rem_1fr_1.15fr_2.5rem]"
                      style={{ maxWidth: "100%" }}
                    >
                      <div className="text-[9px] font-medium uppercase tracking-wide text-white/30">
                        #
                      </div>
                      <div className="text-[9px] font-medium uppercase tracking-wide text-white/30">
                        Reps
                      </div>
                      <div className="text-[9px] font-medium uppercase tracking-wide text-white/30">
                        Weight
                      </div>
                      <div
                        className="text-center text-[9px] font-medium uppercase tracking-wide text-white/30"
                        title="Log set"
                      >
                        Log
                      </div>

                      {exercise.sets.map((s, i) => {
                        const pKey = setKey(s.id);
                        const rowDone = Boolean(doneSetIds[pKey]);
                        const isFocus =
                          i ===
                            (firstIncomplete >= 0
                              ? firstIncomplete
                              : n - 1) && !rowDone;
                        const repsValue = performed[pKey]?.reps ?? s.reps;
                        const wRaw = performed[pKey]?.weight ?? s.suggestedWeight;
                        const wUnit = displayWeightUnit(s.suggestedWeight);
                        const wDisplay = stripLoadUnit(wRaw);
                        const inputId = `${exercise.id}-${s.id}`;

                        return (
                          <Fragment key={s.id}>
                            <div
                              className={`flex h-12 w-full min-w-0 items-center justify-center rounded-lg border text-[13px] font-bold tabular-nums ${
                                rowDone
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100/90"
                                  : isFocus
                                    ? "border-sky-400/40 bg-sky-400/10 text-sky-100"
                                    : "border-white/6 bg-zinc-900/30 text-white/60"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <div className="relative min-w-0">
                              <input
                                id={`reps-${inputId}`}
                                type="text"
                                inputMode="text"
                                autoComplete="off"
                                disabled={rowDone}
                                aria-label={`Reps for set ${i + 1}`}
                                value={repsValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setPerformed((prev) => {
                                    const w =
                                      prev[pKey]?.weight ?? s.suggestedWeight;
                                    return {
                                      ...prev,
                                      [pKey]: { reps: v, weight: w },
                                    };
                                  });
                                }}
                                className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-zinc-900/85 py-0 pl-2.5 pr-10 text-left text-[17px] font-semibold text-white tabular-nums shadow-inner outline-none disabled:opacity-50 placeholder:text-white/35 focus:border-sky-400/50 sm:text-[18px]"
                              />
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-white/35">
                                reps
                              </span>
                            </div>
                            <div className="relative min-w-0">
                              <input
                                id={`w-${inputId}`}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                disabled={rowDone}
                                aria-label={`Weight for set ${i + 1} in ${wUnit}`}
                                value={wDisplay}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setPerformed((prev) => {
                                    const r = prev[pKey]?.reps ?? s.reps;
                                    return {
                                      ...prev,
                                      [pKey]: { reps: r, weight: v },
                                    };
                                  });
                                }}
                                className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-zinc-900/85 py-0 pl-2.5 pr-12 text-left text-[17px] font-semibold text-white tabular-nums shadow-inner outline-none disabled:opacity-50 placeholder:text-white/35 focus:border-sky-400/50 sm:text-[18px]"
                              />
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase text-white/35">
                                {wUnit}
                              </span>
                            </div>
                            <div className="flex h-12 w-full min-w-0 items-center justify-center">
                              <button
                                type="button"
                                disabled={inRest}
                                aria-label={
                                  rowDone
                                    ? `Set ${i + 1} logged, tap to unlog`
                                    : `Log set ${i + 1}`
                                }
                                onClick={() => onToggleSetDone(i)}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                  rowDone
                                    ? "border-emerald-400/70 bg-emerald-400/25"
                                    : "border-white/15 bg-white/10 hover:border-sky-400/40"
                                } ${inRest ? "opacity-40" : ""} disabled:cursor-not-allowed`}
                              >
                                <CheckIcon
                                  className={
                                    rowDone
                                      ? "h-4 w-4 text-zinc-950"
                                      : "h-4 w-4 text-white/90"
                                  }
                                />
                              </button>
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>

                    {allSetsDone && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={unlogLastSet}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-2.5 text-center text-[13px] font-medium text-white/75"
                        >
                          Unlog last set
                        </button>
                      </div>
                    )}
                  </div>

                  {inRest && (
                    <div className="absolute inset-0 z-10 flex flex-col items-stretch justify-end bg-zinc-950/55 pb-2 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] shadow-[0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:pl-4 sm:pr-4">
                      <div className="space-y-2 rounded-2xl border border-white/10 bg-zinc-900/90 p-3 shadow-xl">
                        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-white/45">
                          Rest before next set
                        </p>
                        <div className="text-center text-[40px] font-bold tabular-nums leading-none tracking-tight text-white">
                          {formatClock(restRemaining ?? 0)}
                        </div>
                        <TouchButton
                          onClick={skipRest}
                          variant="secondary"
                          size="md"
                          className="!h-11 w-full"
                        >
                          Skip rest
                        </TouchButton>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto shrink-0 space-y-2 pb-3 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] pt-0 sm:pl-4 sm:pr-4 sm:pb-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {prevHref ? (
                        <Link href={prevHref} className="block">
                          <TouchButton
                            variant="secondary"
                            size="md"
                            className="!h-11"
                          >
                            Previous
                          </TouchButton>
                        </Link>
                      ) : (
                        <TouchButton
                          variant="secondary"
                          size="md"
                          className="!h-11"
                          disabled
                        >
                          Previous
                        </TouchButton>
                      )}

                      {nextHref ? (
                        <Link href={nextHref} className="block">
                          <TouchButton size="md" className="!h-11">
                            Next
                          </TouchButton>
                        </Link>
                      ) : (
                        <Link href={`/workout/${workout.id}`} className="block">
                          <TouchButton variant="blue" size="md" className="!h-11">
                            Finish
                          </TouchButton>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
