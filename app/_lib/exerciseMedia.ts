import { demoWorkoutMediaForExercise, type DemoMedia } from "./exerciseDemoMedia";

export type MoveKitSpec =
  | {
      kind: "mp4";
      /**
       * Direct MP4 URL (signed URL, CDN path, or self-hosted in `public/`).
       * This is the simplest integration while MoveKit’s hosted delivery format stabilizes.
       */
      src: string;
    }
  | {
      kind: "key";
      /**
       * Basename (no extension) of a file in `public/movekit/<key>.mp4`.
       *
       * This repo ships MoveKit exports as kebab-case MP4s, e.g. `barbell-squat.mp4`.
       */
      key: string;
    };

export type ProgramExercise = {
  id: string;
  name: string;
  mediaLabel: string;
  cue: string;
  /**
   * Optional: when present, the UI will prefer this over demo stock footage.
   * If it can’t be resolved at runtime, we fall back to the demo B-roll.
   */
  movekit?: MoveKitSpec;
  sets: Array<{
    id: string;
    reps: string;
    suggestedWeight: string;
  }>;
};

function env(name: string) {
  return process.env[name];
}

/**
 * This is intentionally flexible because MoveKit’s public integration surface is still evolving
 * (see their API / SDK direction on https://movekit.com/api-access).
 *
 * You can:
 * - set a direct `movekit: { kind: "mp4", src }` on each exercise (most explicit), or
 * - set a `movekit: { kind: "key", key }` and provide a CDN base URL via env.
 */
function movekitCdnBase(): string | null {
  const base =
    env("NEXT_PUBLIC_MOVEKIT_CDN_BASE") ||
    // Allow non-public env in local dev; still gets inlined at build for client if prefixed.
    env("MOVEKIT_CDN_BASE");
  return base ? base.replace(/\/$/, "") : null;
}

/**
 * Ordered list of video sources to try for an exercise.
 * This makes local MoveKit drops (`public/movekit/<key>.mp4`) work immediately, while still
 * allowing a CDN override and finally falling back to demo stock footage.
 */
export function exerciseVideoSources(exercise: ProgramExercise): DemoMedia[] {
  const sources: DemoMedia[] = [];

  if (exercise.movekit?.kind === "mp4") {
    sources.push({
      label: "MoveKit animation",
      src: exercise.movekit.src,
      credit: "MoveKit",
    });
  } else if (exercise.movekit?.kind === "key") {
    const key = exercise.movekit.key;
    sources.push({
      label: "MoveKit animation (local)",
      src: `/movekit/${key}.mp4`,
      credit: "MoveKit",
    });

    const base = movekitCdnBase();
    if (base) {
      sources.push({
        label: "MoveKit animation (CDN)",
        src: `${base}/${key}.mp4`,
        credit: "MoveKit",
      });
    }
  }

  sources.push(demoWorkoutMediaForExercise({ id: exercise.id, name: exercise.name }));
  return sources;
}
