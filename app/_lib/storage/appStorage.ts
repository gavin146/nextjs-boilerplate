"use client";

import { demoWeekWorkouts } from "../programData";
import type { AppPersistedState } from "../domain";
import { defaultPersistedState } from "../domain";

const KEY = "ai-coach-app-state-v1";

export function loadPersisted(): AppPersistedState {
  if (typeof window === "undefined") return defaultPersistedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultPersistedState();
    const parsed = JSON.parse(raw) as AppPersistedState;
    if (parsed?.v !== 1) return defaultPersistedState();
    return {
      ...defaultPersistedState(),
      ...parsed,
      profile: { ...defaultPersistedState().profile, ...parsed.profile },
      coachMemory: parsed.coachMemory ?? { facts: [], factDates: [] },
      checkIns: parsed.checkIns ?? [],
      programWorkouts: parsed.programWorkouts ?? null,
      completedWorkoutIds: parsed.completedWorkoutIds ?? [],
      liftPRs: parsed.liftPRs ?? [],
      completedExerciseLogs: parsed.completedExerciseLogs ?? [],
      exerciseCoachInteractions: parsed.exerciseCoachInteractions ?? [],
    };
  } catch {
    return defaultPersistedState();
  }
}

export function savePersisted(state: AppPersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function resolvedProgram(state: AppPersistedState) {
  return state.programWorkouts ?? demoWeekWorkouts();
}
