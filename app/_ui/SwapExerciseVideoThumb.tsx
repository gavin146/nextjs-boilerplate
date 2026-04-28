"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProgramExercise } from "../_lib/exerciseMedia";
import { exerciseVideoSources } from "../_lib/exerciseMedia";

/** Swap tiles use the same MoveKit-first chain as Train (`exerciseVideoSources`). */
export function SwapExerciseVideoThumb({
  exercise,
  videoClassName,
}: {
  exercise: ProgramExercise;
  /** Merged onto the video (defaults to centered cover). Use e.g. `object-top` for vertical pulls. */
  videoClassName?: string;
}) {
  const sources = useMemo(() => exerciseVideoSources(exercise), [exercise]);
  const sourcesKey = useMemo(() => {
    const mk =
      exercise.movekit?.kind === "key"
        ? exercise.movekit.key
        : exercise.movekit?.kind === "mp4"
          ? exercise.movekit.src
          : "";
    return `${exercise.id}|${exercise.name}|${mk}`;
  }, [exercise]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset when exercise identity changes */
    setSourceIndex(0);
    setFailed(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sourcesKey]);

  const demo = sources[sourceIndex] ?? sources[0];

  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed || !demo) return;

    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.controls = false;
    v.disablePictureInPicture = true;

    const kick = async () => {
      try {
        await v.play();
      } catch {
        /* autoplay may defer until gesture — swap tap counts */
      }
    };

    void kick();

    const onPause = () => {
      void kick();
    };

    v.addEventListener("pause", onPause);
    return () => v.removeEventListener("pause", onPause);
  }, [demo?.src, failed, sourcesKey]);

  if (failed || !demo) {
    return (
      <div className="flex h-full min-h-[88px] w-full flex-col items-center justify-center bg-zinc-900 px-2 text-center">
        <span className="text-[11px] leading-snug text-white/40">
          {exercise.mediaLabel || exercise.name}
        </span>
        <span className="mt-1 text-[10px] text-white/25">No preview</span>
      </div>
    );
  }

  const videoCn = ["h-full w-full object-cover object-center", videoClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <video
      ref={videoRef}
      className={videoCn}
      src={demo.src}
      autoPlay
      muted
      playsInline
      loop
      disablePictureInPicture
      preload="metadata"
      tabIndex={-1}
      aria-hidden
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
  );
}
