"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProgramExercise } from "../../../../../_lib/exerciseMedia";
import { exerciseVideoSources } from "../../../../../_lib/exerciseMedia";
import { demoWeekWorkouts } from "../../../../../_lib/programData";
import { TouchButton } from "../../../../../_ui/TouchButton";
import { CheckIcon } from "../../../../../_ui/icons";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-black/40">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_70%_20%,rgba(52,211,153,0.18),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-black/35 px-3 py-1 text-[12px] font-semibold text-sky-200">
            DEMO VIDEO
          </div>
          <div className="rounded-2xl bg-black/35 px-3 py-1 text-[12px] font-semibold text-emerald-200">
            GIF-style
          </div>
        </div>
        <div>
          <div className="text-[18px] font-semibold tracking-tight">{label}</div>
          <div className="mt-1 text-[13px] text-white/70">
            Replace with real GIF/video asset later.
          </div>
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

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-contain bg-black"
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      <div className="absolute left-2 right-2 top-2 flex items-center justify-between gap-2 sm:left-3 sm:right-3 sm:top-3">
        <div className="rounded-xl bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-sky-200/95 backdrop-blur sm:rounded-2xl sm:px-2.5 sm:py-1 sm:text-[12px]">
          {demo.credit === "MoveKit" ? "MoveKit" : "Demo video"}
        </div>
        <div className="rounded-xl bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-200/95 backdrop-blur sm:rounded-2xl sm:px-2.5 sm:py-1 sm:text-[12px]">
          Loop
        </div>
      </div>

      {!hideBottomLabel ? (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <div className="text-[16px] font-semibold leading-tight tracking-tight sm:text-[18px]">
            {exercise.name}
          </div>
          <div className="mt-0.5 text-[11px] text-white/65 sm:mt-1 sm:text-[12px]">
            {demo.label} · {demo.credit}
          </div>
        </div>
      ) : null}
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

  const nextIncompleteSet = useMemo(() => {
    if (!exercise) return null;
    const first = exercise.sets.find(
      (s) => !doneSetIds[`${exercise.id}:${s.id}`],
    );
    return first ?? null;
  }, [doneSetIds, exercise]);

  function completeNextSet() {
    if (!exercise) return;
    const keyFor = (setId: string) => `${exercise.id}:${setId}`;

    const next = exercise.sets.find((s) => !doneSetIds[keyFor(s.id)]);
    if (next) {
      setDoneSetIds((prev) => ({ ...prev, [keyFor(next.id)]: true }));
      return;
    }

    const last = exercise.sets[exercise.sets.length - 1];
    if (!last) return;
    setDoneSetIds((prev) => {
      const copy = { ...prev };
      delete copy[keyFor(last.id)];
      return copy;
    });
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
    <div className="flex h-[calc(100svh-5.5rem-env(safe-area-inset-bottom,0px))] max-h-[calc(100svh-5.5rem-env(safe-area-inset-bottom,0px))] min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-[max(8px,env(safe-area-inset-top,0px))] pb-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 text-[12px] text-white/60">
          <Link
            href={`/workout/${workout.id}`}
            className="shrink-0 text-white/75 underline-offset-2 hover:text-white"
          >
            Back
          </Link>
          <span className="shrink-0 font-semibold tabular-nums text-white/80">
            {idx + 1} / {total}
          </span>
          <span
            className="min-w-0 max-w-[45%] truncate text-right"
            title={workout.title}
          >
            {workout.title}
          </span>
        </div>
        <h1 className="mt-1.5 line-clamp-1 text-[18px] font-semibold leading-tight tracking-tight text-white sm:text-[19px]">
          {exercise.name}
        </h1>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/55 sm:line-clamp-2">
          {exercise.cue}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 sm:px-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:rounded-3xl">
          <div className="min-h-0 w-full min-w-0 flex-1">
            <DemoExerciseMedia exercise={exercise} hideBottomLabel />
          </div>

          <div className="shrink-0 space-y-2 border-t border-white/10 p-2.5 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/90">
                  Sets
                </div>
                <div className="text-[11px] text-white/55 sm:text-[12px]">
                  {nextIncompleteSet
                    ? `Next: set ${
                        exercise.sets.findIndex(
                          (s) => s.id === nextIncompleteSet.id,
                        ) + 1
                      }`
                    : "All sets complete"}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold text-sky-200 sm:text-[11px]">
                Suggested
              </div>
            </div>

            <div className="space-y-1">
              {exercise.sets.map((s, i) => {
                const key = `${exercise.id}:${s.id}`;
                const done = Boolean(doneSetIds[key]);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setDoneSetIds((prev) => {
                        const copy = { ...prev };
                        if (copy[key]) delete copy[key];
                        else copy[key] = true;
                        return copy;
                      })
                    }
                    className={`w-full rounded-xl border px-2.5 py-1.5 text-left transition sm:rounded-2xl sm:px-3 sm:py-2 ${
                      done
                        ? "border-emerald-400/25 bg-emerald-400/10"
                        : "border-white/10 bg-black/20 active:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/55 sm:text-[11px]">
                          Set {i + 1}
                        </div>
                        <div className="text-[15px] font-semibold leading-tight tabular-nums sm:text-base">
                          {s.reps}{" "}
                          <span className="text-white/40">·</span>{" "}
                          {s.suggestedWeight}
                        </div>
                      </div>
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border sm:h-10 sm:w-10 sm:rounded-2xl ${
                          done
                            ? "border-emerald-400/30 bg-emerald-400 text-zinc-950"
                            : "border-white/10 bg-white/5 text-white/65"
                        }`}
                        aria-hidden
                      >
                        <CheckIcon
                          className={done ? "scale-90 text-zinc-950" : "scale-90"}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-0.5">
              <TouchButton
                onClick={completeNextSet}
                size="md"
                className="!h-12"
                left={<CheckIcon className="text-zinc-950" />}
              >
                {nextIncompleteSet ? "Complete next set" : "All sets done"}
              </TouchButton>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {prevHref ? (
                <Link href={prevHref} className="block">
                  <TouchButton variant="secondary" size="md" className="!h-11">
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
      </div>
    </div>
  );
}
