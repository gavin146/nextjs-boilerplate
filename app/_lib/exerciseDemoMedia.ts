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

/**
 * Keyword order matters: match specific lifts before generic words ("squat", "pull", …).
 */
function pickByKeywords(name: string): DemoMedia | null {
  const n = name.toLowerCase();

  /* Vertical pull */
  if (n.includes("chin-up") || n.includes("chin up")) return MIXKIT.manGymBarbell;
  if (n.includes("pull-up") || n.includes("pull up")) return MIXKIT.athleteBarbell;
  if (n.includes("assisted pull")) return MIXKIT.womenBarbell;
  if (n.includes("pulldown") || n.includes("lat pulldown") || n.includes("neutral grip"))
    return MIXKIT.gymWeights;

  /* Rows / horizontal pull */
  if (n.includes("face pull")) return MIXKIT.manGymBarbell;
  if (
    n.includes("renegade") ||
    n.includes("t-bar") ||
    n.includes("meadow") ||
    n.includes("chest supported") ||
    n.includes("bent over row")
  )
    return MIXKIT.barbellGym;
  if (n.includes("row")) return MIXKIT.barbellGym;

  /* Pressing — incline / overhead before generic bench */
  if (n.includes("landmine")) return MIXKIT.barbellGym;
  if (
    n.includes("shoulder press") ||
    n.includes("ohp") ||
    n.includes("overhead") ||
    n.includes("machine shoulder") ||
    n.includes("arnold")
  )
    return MIXKIT.manGymBarbell;
  if (n.includes("pike push")) return MIXKIT.gymWeights;
  if (n.includes("incline")) return MIXKIT.manGymBarbell;
  if (n.includes("floor press")) return MIXKIT.womenBarbell;
  if (n.includes("push-up") || n.includes("push up")) return MIXKIT.gymWeights;
  if (n.includes("machine chest")) return MIXKIT.gymWeights;
  if (n.includes("single arm") && n.includes("bench")) return MIXKIT.gymWeights;
  if (n.includes("bench") || (n.includes("press") && n.includes("dumbbell")))
    return MIXKIT.gymWeights;

  /* Hinge */
  if (n.includes("good morning")) return MIXKIT.manGymBarbell;
  if (n.includes("hip thrust") || n.includes("thrust")) return MIXKIT.womenBarbell;
  if (n.includes("rack pull")) return MIXKIT.barbellGym;
  if (n.includes("sumo")) return MIXKIT.barbellGym;
  if (n.includes("romanian") || n.includes("rdl")) return MIXKIT.barbellGym;
  if (n.includes("deadlift")) return MIXKIT.barbellGym;

  /* Squat pattern — specific before generic "squat" */
  if (n.includes("leg press")) return MIXKIT.gymWeights;
  if (n.includes("lunge")) return MIXKIT.gymWeights;
  if (n.includes("bulgarian") || n.includes("split squat")) return MIXKIT.barbellGym;
  if (n.includes("front squat")) return MIXKIT.manGymBarbell;
  if (n.includes("goblet")) return MIXKIT.womenBarbell;
  if (n.includes("squat")) return MIXKIT.athleteBarbell;

  if (n.includes("trap bar")) return MIXKIT.barbellGym;

  if (n.includes("core") || n.includes("plank") || n.includes("dead bug"))
    return MIXKIT.gymWeights;

  /* Loose lat keyword last — avoids matching unrelated words */
  if (n.includes("lat ") && !n.includes("lateral")) return MIXKIT.gymWeights;

  return null;
}

function pickStableFallback(seed: string): DemoMedia {
  const pool = [
    MIXKIT.manGymBarbell,
    MIXKIT.athleteBarbell,
    MIXKIT.barbellGym,
    MIXKIT.gymWeights,
    MIXKIT.womenBarbell,
  ] as const;
  const h = Array.from(seed).reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return pool[h % pool.length]!;
}

export function demoWorkoutMediaForExercise(exercise: {
  id: string;
  name: string;
}): DemoMedia {
  return pickByKeywords(exercise.name) ?? pickStableFallback(exercise.id);
}
