// Demo-only remote MP4s (for UI testing).
// For production: self-host short MP4/WebM loops in `public/exercises/*` and keep rights clear.
//
// Current clips are from Mixkit (barbell / gym B-roll) — good enough to validate a workout UI.
// Review Mixkit’s license for your use-case before shipping publicly:
// - https://mixkit.co/license/

export type DemoMedia = {
  label: string;
  src: string;
  credit: string;
};

const MIXKIT = {
  // IDs pulled from Mixkit’s `/free-stock-video/...` pages; assets are direct MP4s on `assets.mixkit.co`.
  athleteBarbell: {
    label: "Barbell training (demo B-roll)",
    src: "https://assets.mixkit.co/videos/22989/22989-720.mp4",
    credit: "Mixkit",
  } satisfies DemoMedia,
  manGymBarbell: {
    label: "Gym barbell (demo B-roll)",
    src: "https://assets.mixkit.co/videos/48167/48167-720.mp4",
    credit: "Mixkit",
  } satisfies DemoMedia,
  gymWeights: {
    label: "Gym training (demo B-roll)",
    src: "https://assets.mixkit.co/active_storage/video_items/100544/1725385028/100544-video-720.mp4",
    credit: "Mixkit",
  } satisfies DemoMedia,
  womenBarbell: {
    label: "Barbell lift (demo B-roll)",
    src: "https://assets.mixkit.co/videos/48168/48168-720.mp4",
    credit: "Mixkit",
  } satisfies DemoMedia,
  barbellGym: {
    label: "Barbell at the gym (demo B-roll)",
    src: "https://assets.mixkit.co/videos/23457/23457-720.mp4",
    credit: "Mixkit",
  } satisfies DemoMedia,
} as const;

function pickByKeywords(name: string): DemoMedia | null {
  const n = name.toLowerCase();

  if (n.includes("squat")) return MIXKIT.athleteBarbell;
  if (n.includes("deadlift") || n.includes("hinge")) return MIXKIT.barbellGym;
  if ((n.includes("bench") || n.includes("press")) && n.includes("dumbbell")) {
    return MIXKIT.gymWeights;
  }
  if (n.includes("pulldown") || n.includes("lat")) return MIXKIT.gymWeights;
  if (n.includes("incline")) return MIXKIT.manGymBarbell;
  if (n.includes("trap bar")) return MIXKIT.barbellGym;
  if (n.includes("core") || n.includes("plank") || n.includes("dead bug"))
    return MIXKIT.gymWeights;

  return null;
}

function pickStableFallback(exerciseId: string): DemoMedia {
  // Avoid “random” association with a generic hash, but still stable per exercise.
  const pool = [
    MIXKIT.manGymBarbell,
    MIXKIT.athleteBarbell,
    MIXKIT.barbellGym,
    MIXKIT.gymWeights,
  ] as const;
  const h = Array.from(exerciseId).reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return pool[h % pool.length]!;
}

export function demoWorkoutMediaForExercise(exercise: {
  id: string;
  name: string;
}): DemoMedia {
  return pickByKeywords(exercise.name) ?? pickStableFallback(exercise.id);
}
