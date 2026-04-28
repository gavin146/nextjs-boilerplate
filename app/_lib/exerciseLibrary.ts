import type { ProgramExercise } from "./exerciseMedia";

/**
 * Swap families align replacements with the muscle emphasis of the lift being replaced.
 */
export type MuscleSlot =
  | "squat_knee_dominant"
  | "hinge_posterior"
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "vertical_push_incline";

/**
 * Alternate movements for swaps — same slot = same broad muscle targets.
 * Each exercise has a distinct movekit basename — drop exported clips into `public/movekit/` using that basename + `.mp4`.
 */
type CatalogRow = { slot: MuscleSlot; ex: ProgramExercise };

const LIB: CatalogRow[] = [
  /* Squat / knee-dominant — quads + glutes */
  {
    slot: "squat_knee_dominant",
    ex: {
      id: "lib-back-squat",
      name: "Back Squat",
      mediaLabel: "Back squat",
      cue: "Brace and track knees over mid-foot.",
      movekit: { kind: "key", key: "barbell-squat" },
      sets: [{ id: "t", reps: "5", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "squat_knee_dominant",
    ex: {
      id: "lib-goblet-squat",
      name: "Goblet Squat",
      mediaLabel: "Goblet squat",
      cue: "Elbows inside knees at depth.",
      movekit: { kind: "key", key: "dumbbell-goblet-squat" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "squat_knee_dominant",
    ex: {
      id: "lib-bulgarian-split-squat",
      name: "Bulgarian Split Squat",
      mediaLabel: "Bulgarian split squat",
      cue: "Front knee tracks over toes; hips square.",
      movekit: { kind: "key", key: "bulgarian-split-squat" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "squat_knee_dominant",
    ex: {
      id: "lib-walking-lunge",
      name: "Walking Lunge",
      mediaLabel: "Walking lunge",
      cue: "Short stride; vertical torso each step.",
      movekit: { kind: "key", key: "lunge-walking" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "squat_knee_dominant",
    ex: {
      id: "lib-leg-press",
      name: "Leg Press",
      mediaLabel: "Leg press",
      cue: "Feet mid-platform; knees track toes.",
      movekit: { kind: "key", key: "machine-leg-press" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },

  /* Hinge — hamstrings + glutes + back */
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-rdl",
      name: "Romanian Deadlift",
      mediaLabel: "RDL",
      cue: "Hips back; vertical shins; hamstrings loaded.",
      movekit: { kind: "key", key: "barbell-stiff-leg-deadlifts" },
      sets: [{ id: "t", reps: "8", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-deadlift",
      name: "Barbell Deadlift",
      mediaLabel: "Deadlift",
      cue: "Push floor away; bar close to legs.",
      movekit: { kind: "key", key: "barbell-deadlift" },
      sets: [{ id: "t", reps: "5", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-sumo-deadlift",
      name: "Kettlebell Sumo Deadlift",
      mediaLabel: "KB sumo deadlift",
      cue: "Spread floor with feet; hips close to bar.",
      movekit: { kind: "key", key: "kettlebell-sumo-deadlift" },
      sets: [{ id: "t", reps: "5", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-good-morning",
      name: "Good Morning",
      mediaLabel: "Good morning",
      cue: "Hinge only at hips; bar rides shoulders.",
      movekit: { kind: "key", key: "good-mornings" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-rack-pull",
      name: "Rack Pull",
      mediaLabel: "Rack pull",
      cue: "Short ROM overload; lock out hips with glutes.",
      movekit: { kind: "key", key: "barbell-rack-pull" },
      sets: [{ id: "t", reps: "6", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "hinge_posterior",
    ex: {
      id: "lib-hip-thrust",
      name: "Kettlebell Hip Thrust",
      mediaLabel: "KB hip thrust",
      cue: "Chin tucked; squeeze glutes at top.",
      movekit: { kind: "key", key: "kettlebell-hip-thrust" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },

  /* Horizontal push — chest + anterior shoulder */
  {
    slot: "horizontal_push",
    ex: {
      id: "lib-db-bench",
      name: "DB Bench Press",
      mediaLabel: "DB bench",
      cue: "Pause on chest where comfortable.",
      movekit: { kind: "key", key: "dumbbell-bench-press" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_push",
    ex: {
      id: "lib-barbell-bench",
      name: "Barbell Bench Press",
      mediaLabel: "Bench press",
      cue: "Leg drive; bar path slight arc.",
      movekit: { kind: "key", key: "barbell-bench-press" },
      sets: [{ id: "t", reps: "8", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_push",
    ex: {
      id: "lib-push-up",
      name: "Push Up",
      mediaLabel: "Push up",
      cue: "Body line rigid; chest to depth.",
      movekit: { kind: "key", key: "push-up" },
      sets: [{ id: "t", reps: "AMRAP", suggestedWeight: "BW" }],
    },
  },
  {
    slot: "horizontal_push",
    ex: {
      id: "lib-machine-chest",
      name: "Machine Chest Press",
      mediaLabel: "Machine chest press",
      cue: "Scaps stable; smooth extension.",
      movekit: { kind: "key", key: "machine-chest-press" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_push",
    ex: {
      id: "lib-single-arm-db-bench",
      name: "Single Arm DB Bench",
      mediaLabel: "Single-arm DB bench",
      cue: "Fight rotation; squeeze pec at lockout.",
      movekit: { kind: "key", key: "dumbbell-single-arm-chest-press" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },

  /* Horizontal pull — upper/mid back */
  {
    slot: "horizontal_pull",
    ex: {
      id: "lib-row-cable",
      name: "Cable Single Arm Row",
      mediaLabel: "Cable row",
      cue: "Pull elbow to pocket.",
      movekit: { kind: "key", key: "cable-single-arm-underhand-grip-row" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_pull",
    ex: {
      id: "lib-barbell-row",
      name: "Barbell Bent Over Row",
      mediaLabel: "Barbell row",
      cue: "Torso hinged; pull to lower ribs.",
      movekit: { kind: "key", key: "barbell-bent-over-row" },
      sets: [{ id: "t", reps: "8", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_pull",
    ex: {
      id: "lib-db-row-bilateral",
      name: "Dumbbell Row (Bilateral)",
      mediaLabel: "DB row bilateral",
      cue: "Torso hinged; pull elbows wide; squeeze shoulder blades.",
      movekit: { kind: "key", key: "dumbbell-row-bilateral" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_pull",
    ex: {
      id: "lib-t-bar-row",
      name: "T-Bar Row",
      mediaLabel: "T-bar row",
      cue: "Brace core; neutral spine.",
      movekit: { kind: "key", key: "machine-plate-loaded-t-bar-row" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "horizontal_pull",
    ex: {
      id: "lib-face-pull",
      name: "Face Pull",
      mediaLabel: "Face pull",
      cue: "Pull to forehead; external rotate.",
      movekit: { kind: "key", key: "cable-bar-face-pull" },
      sets: [{ id: "t", reps: "15", suggestedWeight: "0 lb" }],
    },
  },

  /* Vertical pull — lats */
  {
    slot: "vertical_pull",
    ex: {
      id: "lib-pullup",
      name: "Pull Up",
      mediaLabel: "Pull up",
      cue: "Depress shoulders before pulling.",
      movekit: { kind: "key", key: "pull-ups" },
      sets: [{ id: "t", reps: "AMRAP", suggestedWeight: "BW" }],
    },
  },
  {
    slot: "vertical_pull",
    ex: {
      id: "lib-chin-up",
      name: "Chin Up",
      mediaLabel: "Chin up",
      cue: "Chest to bar path; elbows track forward.",
      movekit: { kind: "key", key: "chin-ups" },
      sets: [{ id: "t", reps: "AMRAP", suggestedWeight: "BW" }],
    },
  },
  {
    slot: "vertical_pull",
    ex: {
      id: "lib-lat-pulldown",
      name: "Lat Pulldown",
      mediaLabel: "Lat pulldown",
      cue: "Chest lifted; elbows drive down and slightly forward.",
      movekit: { kind: "key", key: "machine-pulldown" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "vertical_pull",
    ex: {
      id: "lib-neutral-grip-pull",
      name: "Narrow Grip Pulldown",
      mediaLabel: "Narrow pulldown",
      cue: "Drive elbows into pockets.",
      movekit: { kind: "key", key: "narrow-pulldown" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },

  /* Vertical / incline push — upper chest + shoulders */
  {
    slot: "vertical_push_incline",
    ex: {
      id: "lib-incline-db",
      name: "Incline DB Press",
      mediaLabel: "Incline DB",
      cue: "Slight arc toward shoulder line.",
      movekit: { kind: "key", key: "dumbbell-incline-bench-press" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "vertical_push_incline",
    ex: {
      id: "lib-incline-barbell",
      name: "Incline Barbell Press",
      mediaLabel: "Incline barbell",
      cue: "Bar path back slightly toward eyes.",
      movekit: { kind: "key", key: "barbell-incline-bench-press" },
      sets: [{ id: "t", reps: "8", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "vertical_push_incline",
    ex: {
      id: "lib-overhead-db",
      name: "Seated DB Shoulder Press",
      mediaLabel: "Seated DB shoulder press",
      cue: "Ribs down; full lock without flare.",
      movekit: { kind: "key", key: "dumbbell-seated-overhead-press" },
      sets: [{ id: "t", reps: "10", suggestedWeight: "0 lb" }],
    },
  },
  {
    slot: "vertical_push_incline",
    ex: {
      id: "lib-machine-shoulder",
      name: "Machine Shoulder Press",
      mediaLabel: "Machine shoulder press",
      cue: "Seat height hits joint-friendly ROM.",
      movekit: { kind: "key", key: "machine-front-military-press" },
      sets: [{ id: "t", reps: "12", suggestedWeight: "0 lb" }],
    },
  },
];

/** Legacy export — flat list for programmatic picks */
export const EXERCISE_LIBRARY: ProgramExercise[] = LIB.map((r) => r.ex);

export function inferMuscleSlot(ex: ProgramExercise): MuscleSlot {
  const byCatalog = LIB.find(
    (r) =>
      r.ex.id === ex.id ||
      r.ex.name.toLowerCase() === ex.name.toLowerCase(),
  );
  if (byCatalog) return byCatalog.slot;

  const n = ex.name.toLowerCase();
  const k =
    ex.movekit?.kind === "key" ? ex.movekit.key.toLowerCase() : "";

  if (
    n.includes("incline") ||
    n.includes("shoulder press") ||
    n.includes("ohp") ||
    n.includes("landmine") ||
    n.includes("pike push")
  )
    return "vertical_push_incline";

  if (
    n.includes("pulldown") ||
    n.includes("pull-up") ||
    n.includes("pull up") ||
    n.includes("chin-up") ||
    n.includes("chin up") ||
    (n.includes("lat ") && !n.includes("lateral"))
  )
    return "vertical_pull";

  if (
    n.includes("bench") ||
    n.includes("floor press") ||
    n.includes("push-up") ||
    n.includes("push up") ||
    (n.includes("press") &&
      !n.includes("leg") &&
      !n.includes("shoulder") &&
      !n.includes("overhead"))
  )
    return "horizontal_push";

  if (
    n.includes("row") ||
    n.includes("face pull") ||
    k.includes("row")
  )
    return "horizontal_pull";

  if (
    n.includes("deadlift") ||
    n.includes("rdl") ||
    n.includes("romanian") ||
    n.includes("hinge") ||
    n.includes("good morning") ||
    n.includes("hip thrust") ||
    n.includes("rack pull")
  )
    return "hinge_posterior";

  if (
    n.includes("squat") ||
    n.includes("lunge") ||
    n.includes("leg press") ||
    n.includes("split squat") ||
    k.includes("squat")
  )
    return "squat_knee_dominant";

  return "horizontal_pull";
}

const DEFAULT_SWAP_LIMIT = 6;

/**
 * Replacement options that preserve muscle emphasis (same slot).
 * Returns up to `limit` catalog exercises (default 6).
 */
export function alternativesFor(
  ex: ProgramExercise,
  limit = DEFAULT_SWAP_LIMIT,
): ProgramExercise[] {
  const slot = inferMuscleSlot(ex);
  const seen = new Set<string>();
  const out: ProgramExercise[] = [];

  for (const row of LIB) {
    if (row.slot !== slot) continue;
    if (row.ex.name.toLowerCase() === ex.name.toLowerCase()) continue;
    if (row.ex.id === ex.id) continue;
    const key = row.ex.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row.ex);
    if (out.length >= limit) break;
  }

  return out;
}

/** @deprecated Use inferMuscleSlot — kept for any stray imports */
export type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "misc";

/** @deprecated Use inferMuscleSlot */
export function libraryPattern(ex: ProgramExercise): MovementPattern {
  const s = inferMuscleSlot(ex);
  if (s === "squat_knee_dominant") return "squat";
  if (s === "hinge_posterior") return "hinge";
  if (s === "horizontal_push") return "horizontal_push";
  if (s === "horizontal_pull") return "horizontal_pull";
  if (s === "vertical_pull") return "vertical_pull";
  if (s === "vertical_push_incline") return "vertical_push";
  return "misc";
}
