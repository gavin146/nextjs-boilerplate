import type { AppPersistedState } from "./domain";

/** Compact block appended to coach + program APIs so the model sees real usage. */
export function formatTrainingMetricsForPrompt(state: AppPersistedState): string {
  const lines: string[] = [];

  const sortedCi = [...state.checkIns].sort((a, b) =>
    a.dateISO < b.dateISO ? 1 : -1,
  );
  const latest = sortedCi[0];
  if (latest) {
    lines.push(
      `Latest daily check-in (${latest.dateISO}): sleep ${latest.sleepQuality}/10, readiness ${latest.readiness}/10, stress ${latest.stress}/10.`,
    );
  }

  const logs = state.completedExerciseLogs ?? [];
  if (logs.length) {
    const tail = logs.slice(-10);
    lines.push(
      `Recent finished exercises (newest last): ${tail
        .map(
          (l) =>
            `${l.exerciseName} RPE ${l.lastSetRpe}/10 work ${l.setsSummary}`,
        )
        .join(" · ")}`,
    );
  }

  const qa = state.exerciseCoachInteractions ?? [];
  if (qa.length) {
    lines.push(
      `Recent on-screen coach Q&A: ${qa
        .slice(-6)
        .map((x) => `"${x.question.slice(0, 60)}..."`)
        .join(" · ")}`,
    );
  }

  lines.push(
    `Sessions marked complete (ids): ${state.completedWorkoutIds.length}.`,
  );

  return lines.filter(Boolean).join("\n");
}
