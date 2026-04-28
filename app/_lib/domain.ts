import type { ProgramExercise } from "./exerciseMedia";
import type { ProgramWorkout } from "./programData";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type ClientProfile = {
  goalsText: string;
  daysPerWeek: 3 | 4 | 5 | 6;
  experience: ExperienceLevel;
  /** Short tags like Home gym, Commercial gym, Barbells */
  equipmentNotes: string;
};

export type DailyCheckIn = {
  id: string;
  /** Calendar day in local TZ */
  dateISO: string;
  /** 1 horrible … 10 amazing */
  sleepQuality: number;
  /** 1 wrecked … 10 peak */
  readiness: number;
  /** 1 calm … 10 overwhelmed */
  stress: number;
  /** Free tags */
  soreness: string[];
  notes?: string;
};

/** Accumulated facts for prompting (simulates “learning” until you add embeddings). */
export type CoachMemory = {
  facts: string[];
  /** ISO timestamps when fact was added */
  factDates: string[];
};

export type LiftPR = {
  id: string;
  label: string;
  weightLb: number;
  reps?: number;
  dateISO: string;
};

/** Logged when user finishes an exercise (after last-set RPE). Feeds AI programs. */
export type CompletedExerciseLog = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  exerciseId: string;
  exerciseName: string;
  /** e.g. "5@185, 5@185, 5@175 lb" */
  setsSummary: string;
  lastSetRpe: number;
  dateISO: string;
};

/** Inline coach Q&A from the exercise screen (no separate chat required). */
export type ExerciseCoachInteraction = {
  id: string;
  workoutId: string;
  exerciseName: string;
  question: string;
  answer: string;
  dateISO: string;
};

export type AppPersistedState = {
  v: 1;
  profile: ClientProfile;
  checkIns: DailyCheckIn[];
  /** Full week; replaces demo when user generates program */
  programWorkouts: ProgramWorkout[] | null;
  coachMemory: CoachMemory;
  completedWorkoutIds: string[];
  liftPRs: LiftPR[];
  completedExerciseLogs: CompletedExerciseLog[];
  exerciseCoachInteractions: ExerciseCoachInteraction[];
};

export const DEFAULT_PROFILE: ClientProfile = {
  goalsText:
    "Build strength with joint friendly training. Stay consistent with a busy schedule.",
  daysPerWeek: 4,
  experience: "intermediate",
  equipmentNotes: "Full gym access",
};

export function defaultPersistedState(): AppPersistedState {
  return {
    v: 1,
    profile: DEFAULT_PROFILE,
    checkIns: [],
    programWorkouts: null,
    coachMemory: { facts: [], factDates: [] },
    completedWorkoutIds: [],
    liftPRs: [],
    completedExerciseLogs: [],
    exerciseCoachInteractions: [],
  };
}

/** Rough readiness score 0–100 from latest check-in + trend. */
export function deriveReadinessScore(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 72;
  const sorted = [...checkIns].sort((a, b) =>
    a.dateISO < b.dateISO ? 1 : -1,
  );
  const latest = sorted[0]!;
  const prev = sorted[1];
  const base =
    latest.sleepQuality * 4 +
    latest.readiness * 4 +
    (11 - latest.stress) * 2;
  let bump = 0;
  if (prev) {
    const delta =
      latest.sleepQuality -
      prev.sleepQuality +
      (latest.readiness - prev.readiness);
    bump = delta * 1.5;
  }
  return Math.round(Math.max(35, Math.min(98, base / 10 + bump)));
}

export function coachFocusBlurb(checkIns: DailyCheckIn[]): string {
  const sorted = [...checkIns].sort((a, b) =>
    a.dateISO < b.dateISO ? 1 : -1,
  );
  const c = sorted[0];
  if (!c) {
    return "Log sleep and readiness so each session matches how you actually feel.";
  }
  if (c.sleepQuality <= 5 || c.readiness <= 5) {
    return "Recovery looks rocky. Prioritize crisp reps over heavier loads today.";
  }
  if (c.stress >= 8) {
    return "Stress is elevated. Keep sets shorter on paper but execute each rep like practice.";
  }
  if (c.soreness?.includes("Low back")) {
    return "Baby your spine on hinges: ribs down, hinge before you bend.";
  }
  return "Recovery looks solid. Warm up well and chase perfect reps before heavier loads.";
}

export function mergeCoachFact(memory: CoachMemory, fact: string): CoachMemory {
  const t = fact.trim();
  if (!t || memory.facts.includes(t)) return memory;
  const now = new Date().toISOString();
  return {
    facts: [...memory.facts, t].slice(-40),
    factDates: [...memory.factDates, now].slice(-40),
  };
}

/** Clone exercises with stable IDs for programmatic swaps. */
export function cloneExercise(ex: ProgramExercise, suffix: string): ProgramExercise {
  return {
    ...ex,
    id: `${ex.id}-${suffix}`,
    sets: ex.sets.map((s, i) => ({
      ...s,
      id: `${ex.id}-${suffix}-s${i}`,
    })),
  };
}
