"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProgramExercise } from "../../_lib/exerciseMedia";
import type { ProgramWorkout } from "../../_lib/programData";
import type {
  AppPersistedState,
  ClientProfile,
  CompletedExerciseLog,
  DailyCheckIn,
  ExerciseCoachInteraction,
} from "../../_lib/domain";
import {
  cloneExercise,
  mergeCoachFact,
  defaultPersistedState,
} from "../../_lib/domain";
import { formatTrainingMetricsForPrompt } from "../../_lib/coachMetrics";
import {
  loadPersisted,
  resolvedProgram,
  savePersisted,
} from "../../_lib/storage/appStorage";

type Ctx = {
  state: AppPersistedState;
  workouts: ProgramWorkout[];
  profile: ClientProfile;
  /** Plain-text bundle for coach APIs (check-ins, logs, RPE, Q&A). */
  trainingMetricsPrompt: string;
  saveDailyCheckIn: (partial: Omit<DailyCheckIn, "id" | "dateISO">) => void;
  updateProfile: (p: Partial<ClientProfile>) => void;
  generateProgramFromCoach: () => Promise<{ ok: boolean; message?: string }>;
  swapExercise: (
    workoutId: string,
    exerciseIndex: number,
    template: ProgramExercise,
  ) => void;
  markWorkoutCompleted: (workoutId: string) => void;
  rememberCoachFact: (fact: string) => void;
  /** After last-set RPE; feeds AI programming */
  recordCompletedExerciseWithRpe: (
    payload: Omit<CompletedExerciseLog, "id" | "dateISO">,
  ) => void;
  /** Inline coach answer from exercise screen */
  recordExerciseCoachQa: (
    payload: Omit<ExerciseCoachInteraction, "id" | "dateISO">,
  ) => void;
  refreshFromStorage: () => void;
  /** Persist full week including swaps started from demo seed */
  setProgramWorkouts: (list: ProgramWorkout[]) => void;
};

const ProgramCtx = createContext<Ctx | null>(null);

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function AppProgramProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppPersistedState>(() =>
    defaultPersistedState(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount so SSR markup matches default seed (see domain.ts).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only persistence
    setState(loadPersisted());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersisted(state);
  }, [state, hydrated]);

  const workouts = useMemo(() => resolvedProgram(state), [state]);

  const trainingMetricsPrompt = useMemo(
    () => formatTrainingMetricsForPrompt(state),
    [state],
  );

  const refreshFromStorage = useCallback(() => {
    setState(loadPersisted());
  }, []);

  const setProgramWorkouts = useCallback((list: ProgramWorkout[]) => {
    setState((s) => ({ ...s, programWorkouts: list }));
  }, []);

  const saveDailyCheckIn = useCallback(
    (partial: Omit<DailyCheckIn, "id" | "dateISO">) => {
      const dateISO = todayISO();
      const id = `ci-${dateISO}`;
      setState((s) => {
        const rest = s.checkIns.filter((c) => c.dateISO !== dateISO);
        const entry: DailyCheckIn = {
          id,
          dateISO,
          sleepQuality: partial.sleepQuality,
          readiness: partial.readiness,
          stress: partial.stress ?? 5,
          soreness: partial.soreness ?? [],
          notes: partial.notes,
        };
        const coachMemory = mergeCoachFact(
          s.coachMemory,
          `Logged readiness ${partial.readiness} of 10 and sleep ${partial.sleepQuality} of 10 on ${dateISO}`,
        );
        return {
          ...s,
          checkIns: [entry, ...rest].slice(0, 90),
          coachMemory,
        };
      });
    },
    [],
  );

  const updateProfile = useCallback((p: Partial<ClientProfile>) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...p },
    }));
  }, []);

  const rememberCoachFact = useCallback((fact: string) => {
    setState((s) => ({
      ...s,
      coachMemory: mergeCoachFact(s.coachMemory, fact),
    }));
  }, []);

  const markWorkoutCompleted = useCallback((workoutId: string) => {
    setState((s) => ({
      ...s,
      completedWorkoutIds: [...new Set([...s.completedWorkoutIds, workoutId])],
    }));
  }, []);

  const recordCompletedExerciseWithRpe = useCallback(
    (payload: Omit<CompletedExerciseLog, "id" | "dateISO">) => {
      const id = `cel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const dateISO = new Date().toISOString();
      setState((s) => ({
        ...s,
        completedExerciseLogs: [
          { ...payload, id, dateISO },
          ...(s.completedExerciseLogs ?? []),
        ].slice(0, 80),
        coachMemory: mergeCoachFact(
          s.coachMemory,
          `${payload.exerciseName}: last set ${payload.lastSetRpe}/10 (${payload.setsSummary})`,
        ),
      }));
    },
    [],
  );

  const recordExerciseCoachQa = useCallback(
    (payload: Omit<ExerciseCoachInteraction, "id" | "dateISO">) => {
      const id = `ecq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const dateISO = new Date().toISOString();
      setState((s) => ({
        ...s,
        exerciseCoachInteractions: [
          { ...payload, id, dateISO },
          ...(s.exerciseCoachInteractions ?? []),
        ].slice(0, 50),
        coachMemory: mergeCoachFact(
          s.coachMemory,
          `${payload.exerciseName}: "${payload.question.slice(0, 90)}"`,
        ),
      }));
    },
    [],
  );

  const swapExercise = useCallback(
    (workoutId: string, exerciseIndex: number, template: ProgramExercise) => {
      setState((s) => {
        const base = resolvedProgram(s);
        const suffix = `${Date.now()}`;
        const next = base.map((w) => {
          if (w.id !== workoutId) return w;
          const cur = w.exercises[exerciseIndex];
          if (!cur) return w;
          const mergedSets = cur.sets.map((row, i) => ({
            ...row,
            reps:
              template.sets[i]?.reps ??
              template.sets[Math.min(i, template.sets.length - 1)]?.reps ??
              row.reps,
            suggestedWeight:
              template.sets[i]?.suggestedWeight ??
              template.sets[Math.min(i, template.sets.length - 1)]
                ?.suggestedWeight ??
              row.suggestedWeight,
          }));
          const nextEx: ProgramExercise = {
            ...cloneExercise(template, suffix),
            sets: mergedSets,
          };
          const exercises = [...w.exercises];
          exercises[exerciseIndex] = nextEx;
          return { ...w, exercises };
        });
        return { ...s, programWorkouts: next };
      });
    },
    [],
  );

  const generateProgramFromCoach = useCallback(async () => {
    try {
      const res = await fetch("/api/coach/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          checkIns: state.checkIns,
          coachFacts: state.coachMemory.facts,
          metricsSummary: formatTrainingMetricsForPrompt(state),
        }),
      });
      const data = (await res.json()) as {
        workouts?: ProgramWorkout[];
        warning?: string;
      };
      if (!data.workouts?.length) {
        return { ok: false, message: "No workouts returned" };
      }
      setState((s) => ({
        ...s,
        programWorkouts: data.workouts!,
        coachMemory: mergeCoachFact(
          s.coachMemory,
          `Generated new ${data.workouts!.length} session week plan`,
        ),
      }));
      const metricsHint =
        formatTrainingMetricsForPrompt(state).trim().length > 40
          ? "Your recent check-ins, logged sets, and coach notes shaped load and exercise picks."
          : "Your profile and latest check-ins shaped this week.";
      const parts = [data.warning, metricsHint].filter(Boolean);
      return {
        ok: true,
        message: parts.join(" "),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return { ok: false, message: msg };
    }
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      workouts,
      profile: state.profile,
      trainingMetricsPrompt,
      saveDailyCheckIn,
      updateProfile,
      generateProgramFromCoach,
      swapExercise,
      markWorkoutCompleted,
      rememberCoachFact,
      recordCompletedExerciseWithRpe,
      recordExerciseCoachQa,
      refreshFromStorage,
      setProgramWorkouts,
    }),
    [
      state,
      workouts,
      trainingMetricsPrompt,
      saveDailyCheckIn,
      updateProfile,
      generateProgramFromCoach,
      swapExercise,
      markWorkoutCompleted,
      rememberCoachFact,
      recordCompletedExerciseWithRpe,
      recordExerciseCoachQa,
      refreshFromStorage,
      setProgramWorkouts,
    ],
  );

  return (
    <ProgramCtx.Provider value={value}>{children}</ProgramCtx.Provider>
  );
}

export function useAppProgram(): Ctx {
  const x = useContext(ProgramCtx);
  if (!x) throw new Error("useAppProgram must be inside AppProgramProvider");
  return x;
}

/** Safe hook for optional contexts */
export function useAppProgramOptional(): Ctx | null {
  return useContext(ProgramCtx);
}
