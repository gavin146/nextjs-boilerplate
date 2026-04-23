"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProgramExercise } from "../../../../../_lib/exerciseMedia";
import { exerciseVideoSources } from "../../../../../_lib/exerciseMedia";
import { demoWeekWorkouts } from "../../../../../_lib/programData";
import { TouchButton } from "../../../../../_ui/TouchButton";
import { CheckIcon } from "../../../../../_ui/icons";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const DEFAULT_REST_SEC = 90;

/** RPE 1 to 10: one plain sentence per value (last set, perceived effort). */
const RPE_STEPS: ReadonlyArray<{ value: number; line: string }> = [
  { value: 1, line: "Warmup. Almost no work you can feel." },
  { value: 2, line: "Very light. You still have many easy reps in you." },
  { value: 3, line: "Light. The set is still light and in control." },
  { value: 4, line: "Medium. The work is real. Many more good reps in you." },
  { value: 5, line: "Strong. Several more good reps in you." },
  { value: 6, line: "Hard. Only a few more good reps in you." },
  { value: 7, line: "Very hard. At most two or three more good reps." },
  { value: 8, line: "Brutal. At most one or two more good reps." },
  {
    value: 9,
    line: "On the edge. You might do one more hard rep. That is all you can get.",
  },
  { value: 10, line: "All out. You could not do one more good rep." },
];

function rpeCellClass(value: number): string {
  if (value <= 2)
    return "border-emerald-400/30 bg-emerald-500/10 ring-1 ring-emerald-400/15";
  if (value <= 4) return "border-sky-400/30 bg-sky-500/10 ring-1 ring-sky-400/12";
  if (value <= 6) return "border-amber-400/30 bg-amber-500/10 ring-1 ring-amber-400/12";
  if (value <= 8) return "border-orange-400/35 bg-orange-500/9 ring-1 ring-orange-400/12";
  return "border-rose-400/40 bg-rose-500/12 ring-1 ring-rose-400/15";
}

/** Short buzz on supported phones when picking RPE, like native app feedback. */
function rpeSelectionHaptic() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  } catch {
    // ignore
  }
}

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
  return s
    .replace(/\s*(lb|lbs|kg)\s*$/i, "")
    .trim()
    /* Demo data uses e.g. "55s" for dumbbell load; strip the pair shorthand "s" */
    .replace(/^(\d+(?:\.\d+)?)s$/i, "$1");
}

/** Single header: menu, exercise name (primary), index fraction, finish. */
function ExerciseSessionHeader({
  backHref,
  finishHref,
  exerciseName,
  exerciseIndex,
  exerciseCount,
  navLocked = false,
}: {
  backHref: string;
  finishHref: string;
  exerciseName: string;
  exerciseIndex: number;
  exerciseCount: number;
  /** When true, menu + finish are non-navigating (e.g. last-set RPE is required). */
  navLocked?: boolean;
}) {
  const actionShell =
    "box-border size-9 min-h-9 min-w-9 max-h-9 max-w-9 shrink-0 select-none [touch-action:manipulation] transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400/50";
  return (
    <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden sm:gap-2.5">
      {navLocked ? (
        <span
          className={`${actionShell} flex cursor-not-allowed items-center justify-center rounded-lg border border-white/6 bg-zinc-900/35 text-[15px] font-bold leading-none text-white/35 opacity-60`}
          aria-hidden
        >
          ···
        </span>
      ) : (
        <Link
          href={backHref}
          className={`${actionShell} flex items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 text-[15px] font-bold leading-none text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/15 hover:bg-zinc-800/60`}
          aria-label="Workout menu and overview"
        >
          ···
        </Link>
      )}
      <h1
        className="min-w-0 flex-1 truncate text-left text-[16px] font-bold leading-tight text-white [text-rendering:optimizeLegibility] antialiased sm:text-[18px] sm:leading-snug"
        title={exerciseName}
      >
        {exerciseName}
      </h1>
      {exerciseCount > 0 ? (
        <span
          className="shrink-0 tabular-nums text-[14px] font-semibold text-white/45 sm:text-[15px]"
          aria-label={`Exercise ${exerciseIndex + 1} of ${exerciseCount}`}
        >
          {exerciseIndex + 1}/{exerciseCount}
        </span>
      ) : null}
      {navLocked ? (
        <span
          className="box-border flex h-9 w-14 min-w-14 max-w-14 cursor-not-allowed shrink-0 select-none items-center justify-center rounded-lg border border-white/8 bg-zinc-900/40 text-[10px] font-semibold leading-none tracking-tight text-white/30 opacity-70 sm:text-[11px]"
          aria-disabled
        >
          Finish
        </span>
      ) : (
        <Link
          href={finishHref}
          className="box-border flex h-9 w-14 min-w-14 max-w-14 shrink-0 select-none items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-[10px] font-semibold leading-none tracking-tight text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [touch-action:manipulation] transition hover:border-sky-400/50 hover:bg-sky-500/20 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400/50 sm:text-[11px]"
          aria-label="Finish workout"
        >
          Finish
        </Link>
      )}
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
  /** 1–10 when last-set difficulty is recorded after all sets are logged; `null` = not asked / reset. */
  const [lastSetDifficulty, setLastSetDifficulty] = useState<number | null>(
    null,
  );
  const router = useRouter();

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
    setLastSetDifficulty(null);
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

  useEffect(() => {
    if (!allSetsDone) setLastSetDifficulty(null);
  }, [allSetsDone]);

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

  const inRest = restRemaining != null && restRemaining > 0;
  const showLastSetDifficulty =
    allSetsDone && lastSetDifficulty === null && !inRest;
  const blockNextUntilLastSetRated = allSetsDone && lastSetDifficulty === null;

  const onLastSetRpe = useCallback(
    (n: number) => {
      rpeSelectionHaptic();
      setLastSetDifficulty(n);
      if (idx < total - 1) {
        router.push(`/workout/${workout.id}/exercise/${idx + 1}`);
      } else {
        router.push(`/workout/${workout.id}`);
      }
    },
    [idx, total, router, workout.id],
  );

  return (
    <>
    <div
      className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
    >
      <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col bg-zinc-950">
        <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col px-0">
          <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] sm:rounded-3xl">
            <div className="shrink-0 border-b border-white/6 bg-zinc-950/30 py-2.5 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] pt-[env(safe-area-inset-top,0px)] sm:px-4 sm:py-3">
              <ExerciseSessionHeader
                backHref={`/workout/${workout.id}`}
                finishHref={`/workout/${workout.id}`}
                exerciseName={exercise.name}
                exerciseIndex={idx}
                exerciseCount={total}
                navLocked={showLastSetDifficulty}
              />
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

              return (
                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    className={`min-h-0 flex-1 overflow-y-auto scroll-pb-2 pb-3 pt-3 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] sm:pl-4 sm:pr-4 ${
                      inRest ? "pointer-events-none select-none" : ""
                    } ${inRest ? "opacity-45" : ""}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/55 sm:text-[12px]">
                      Sets
                    </div>
                    <p className="mt-1 max-w-[42ch] text-[11px] leading-relaxed text-white/45 sm:text-[12px]">
                      Tap ✓ when done — rest before the next set.
                    </p>
                    <div
                      className="mt-4 grid w-full min-w-0 items-center gap-x-2.5 gap-y-3.5 [grid-template-columns:2rem_1fr_1fr_3rem] sm:gap-x-3 sm:gap-y-4 sm:[grid-template-columns:2.25rem_1fr_1fr_3.25rem]"
                      style={{ maxWidth: "100%" }}
                    >
                      <div className="pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">
                        #
                      </div>
                      <div className="pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">
                        Reps
                      </div>
                      <div className="pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">
                        Weight
                      </div>
                      <div
                        className="pb-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
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
                              className={`flex h-14 w-full min-w-0 items-center justify-center rounded-xl border text-[15px] font-bold tabular-nums sm:text-[16px] ${
                                rowDone
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100/90"
                                  : isFocus
                                    ? "border-sky-400/40 bg-sky-400/10 text-sky-100"
                                    : "border-white/6 bg-zinc-900/30 text-white/70"
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
                                className="h-14 w-full min-w-0 rounded-2xl border border-white/10 bg-zinc-900/85 py-0 pl-3 pr-12 text-left text-[18px] font-semibold text-white tabular-nums shadow-inner outline-none ring-offset-0 transition-[box-shadow,colors] disabled:opacity-50 placeholder:text-white/35 focus:border-sky-400/55 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)] sm:text-[19px] sm:pr-14"
                              />
                              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/40 sm:text-[12px] sm:right-3">
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
                                className="h-14 w-full min-w-0 rounded-2xl border border-white/10 bg-zinc-900/85 py-0 pl-3 pr-14 text-left text-[18px] font-semibold text-white tabular-nums shadow-inner outline-none ring-offset-0 transition-[box-shadow,colors] disabled:opacity-50 placeholder:text-white/35 focus:border-sky-400/55 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)] sm:text-[19px] sm:pr-16"
                              />
                              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase text-white/40 sm:text-[12px] sm:right-3">
                                {wUnit}
                              </span>
                            </div>
                            <div className="flex h-14 w-full min-w-0 items-center justify-center self-center">
                              <button
                                type="button"
                                disabled={inRest}
                                aria-label={
                                  rowDone
                                    ? `Set ${i + 1} logged, tap to unlog`
                                    : `Log set ${i + 1}`
                                }
                                onClick={() => onToggleSetDone(i)}
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 [touch-action:manipulation] transition active:scale-95 ${
                                  rowDone
                                    ? "border-emerald-400/70 bg-emerald-400/25"
                                    : "border-white/20 bg-white/10 hover:border-sky-400/50 hover:bg-white/[0.12]"
                                } ${inRest ? "opacity-40" : ""} disabled:cursor-not-allowed`}
                              >
                                <CheckIcon
                                  className={
                                    rowDone
                                      ? "h-5 w-5 text-zinc-950"
                                      : "h-5 w-5 text-white/90"
                                  }
                                />
                              </button>
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>

                    {allSetsDone && (
                      <div className="mt-4 space-y-2">
                        {lastSetDifficulty != null ? (
                          <p className="text-center text-[11px] text-white/45 sm:text-[12px]">
                            Last set effort: {lastSetDifficulty}/10
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={unlogLastSet}
                          className="min-h-12 w-full rounded-2xl border border-white/10 bg-zinc-900/50 py-3 text-center text-[15px] font-medium text-white/85 [touch-action:manipulation] active:scale-[0.99] sm:min-h-[3.25rem] sm:text-[16px]"
                        >
                          Unlog last set
                        </button>
                      </div>
                    )}
                  </div>

                  {inRest && (
                    <div className="absolute inset-0 z-10 flex flex-col items-stretch justify-end bg-zinc-950/55 pb-2 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] shadow-[0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:pl-4 sm:pr-4">
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-3.5 shadow-xl sm:space-y-3.5 sm:p-4">
                        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-white/50 sm:text-[12px]">
                          Rest before next set
                        </p>
                        <div className="text-center text-[44px] font-bold tabular-nums leading-none tracking-tight text-white sm:text-[48px]">
                          {formatClock(restRemaining ?? 0)}
                        </div>
                        <TouchButton
                          onClick={skipRest}
                          variant="secondary"
                          size="md"
                          className="!h-12 w-full"
                        >
                          Skip rest
                        </TouchButton>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto shrink-0 space-y-2 border-t border-white/5 bg-zinc-950/40 pb-3 pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] pt-2 sm:pl-4 sm:pr-4 sm:pb-4">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {prevHref ? (
                        showLastSetDifficulty ? (
                          <TouchButton
                            variant="secondary"
                            size="md"
                            className="!h-12 w-full"
                            disabled
                          >
                            Previous
                          </TouchButton>
                        ) : (
                          <Link href={prevHref} className="block min-h-0">
                            <TouchButton
                              variant="secondary"
                              size="md"
                              className="!h-12 w-full [touch-action:manipulation] active:scale-[0.99]"
                            >
                              Previous
                            </TouchButton>
                          </Link>
                        )
                      ) : (
                        <TouchButton
                          variant="secondary"
                          size="md"
                          className="!h-12 w-full [touch-action:manipulation]"
                          disabled
                        >
                          Previous
                        </TouchButton>
                      )}

                      {nextHref ? (
                        blockNextUntilLastSetRated ? (
                          <TouchButton
                            size="md"
                            className="!h-12 w-full"
                            disabled
                          >
                            Next
                          </TouchButton>
                        ) : (
                          <Link href={nextHref} className="block min-h-0">
                            <TouchButton
                              size="md"
                              className="!h-12 w-full [touch-action:manipulation] active:scale-[0.99]"
                            >
                              Next
                            </TouchButton>
                          </Link>
                        )
                      ) : blockNextUntilLastSetRated ? (
                        <TouchButton
                          variant="blue"
                          size="md"
                          className="!h-12 w-full"
                          disabled
                        >
                          Finish
                        </TouchButton>
                      ) : (
                        <Link
                          href={`/workout/${workout.id}`}
                          className="block min-h-0"
                        >
                          <TouchButton
                            variant="blue"
                            size="md"
                            className="!h-12 w-full [touch-action:manipulation] active:scale-[0.99]"
                          >
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

    {showLastSetDifficulty && (
      <div
        className="fixed inset-0 z-[100] flex h-dvh max-h-dvh min-h-0 w-full min-w-0 items-stretch justify-center overflow-hidden bg-black/20 backdrop-blur-[2px] [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="last-set-effort-title"
        aria-describedby="last-set-effort-desc"
      >
        <div
          className="flex h-full min-h-0 w-full min-w-0 max-w-[430px] flex-col overflow-hidden border-x border-white/[0.04] bg-zinc-950 text-zinc-50 antialiased [font-feature-settings:'tnum'] shadow-[0_0_0_1px_rgba(255,255,255,0.05)] [padding-left:max(0px,env(safe-area-inset-left,0px))] [padding-right:max(0px,env(safe-area-inset-right,0px))] sm:rounded-b-[2.25rem] sm:shadow-2xl"
        >
          <div
            className="shrink-0 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 backdrop-blur-2xl"
            style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}
          >
            <div
              className="flex justify-center pt-0.5 pb-1.5"
              aria-hidden
            >
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>
            <div className="px-3 pb-2.5 sm:px-4 sm:pb-3">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/80">
                Last set
              </p>
              <h2
                id="last-set-effort-title"
                className="mt-0.5 text-balance text-center text-[20px] font-bold leading-tight tracking-tight text-white sm:text-[21px]"
              >
                How hard was that last set?
              </h2>
              <p
                id="last-set-effort-desc"
                className="mt-1.5 text-balance text-center text-[12px] leading-[1.45] text-white/50 sm:mt-2 sm:text-[13px] sm:leading-[1.4]"
              >
                <span className="font-semibold text-white/70">RPE</span> is 1 to
                10. Pick the one that sounds like the last set you just finished.
              </p>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          </div>

          <ol className="m-0 grid min-h-0 w-full min-w-0 flex-1 list-none grid-cols-2 grid-rows-5 [grid-template-rows:repeat(5,minmax(0,1fr))] gap-1.5 overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,rgba(56,189,248,0.06),transparent_50%)] p-1.5 sm:gap-2 sm:p-2">
            {RPE_STEPS.map((step) => (
              <li key={step.value} className="min-h-0 list-none p-0">
                <button
                  type="button"
                  onClick={() => onLastSetRpe(step.value)}
                  aria-label={`RPE ${step.value}. ${step.line}`}
                  className={`box-border flex h-full min-h-0 w-full min-w-0 select-none flex-col items-center justify-center gap-0.5 rounded-2xl border px-1 py-0.5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition will-change-transform [touch-action:manipulation] active:scale-[0.97] active:opacity-95 sm:gap-1 sm:px-1.5 sm:py-1 ${rpeCellClass(
                    step.value,
                  )}`}
                >
                  <span className="text-[16px] font-bold tabular-nums leading-none text-white sm:text-[17px]">
                    {step.value}
                  </span>
                  <p className="line-clamp-4 w-full min-w-0 text-[8.5px] leading-[1.32] text-white/85 sm:text-[9.5px] sm:leading-[1.34]">
                    {step.line}
                  </p>
                </button>
              </li>
            ))}
          </ol>

          <div
            className="shrink-0 border-t border-white/10 bg-zinc-950/85 backdrop-blur-xl"
            style={{
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <p className="px-3 py-2 text-center text-[11px] font-medium leading-snug text-white/40 sm:px-4 sm:py-2.5 sm:text-[12px]">
              Next:{" "}
              <span className="text-white/60">
                {nextHref ? "next exercise" : "workout summary"}
              </span>
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
