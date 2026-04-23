import type { ProgramExercise } from "./exerciseMedia";

export type ProgramWorkout = {
  id: string;
  dayLabel: string; // e.g. "Mon"
  title: string; // e.g. "Lower A"
  focus: string; // short descriptor
  status: "up_next" | "scheduled" | "completed";
  estimatedMinutes: number;
  exercises: ProgramExercise[];
};

export function demoWeekWorkouts(): ProgramWorkout[] {
  return [
    {
      id: "w1",
      dayLabel: "Mon",
      title: "Lower A",
      focus: "Squat + posterior chain",
      status: "completed",
      estimatedMinutes: 55,
      exercises: [
        {
          id: "e1",
          name: "Back Squat",
          mediaLabel: "Back Squat demo",
          cue: "Brace hard. Knees track over mid-foot.",
          movekit: { kind: "key", key: "barbell-squat" },
          sets: [
            { id: "s1", reps: "5", suggestedWeight: "185 lb" },
            { id: "s2", reps: "5", suggestedWeight: "185 lb" },
            { id: "s3", reps: "5+", suggestedWeight: "175 lb" },
          ],
        },
        {
          id: "e2",
          name: "Romanian Deadlift",
          mediaLabel: "RDL demo",
          cue: "Hips back, shins vertical, feel hamstrings.",
          movekit: { kind: "key", key: "barbell-stiff-leg-deadlifts" },
          sets: [
            { id: "s1", reps: "8", suggestedWeight: "185 lb" },
            { id: "s2", reps: "8", suggestedWeight: "185 lb" },
          ],
        },
      ],
    },
    {
      id: "w2",
      dayLabel: "Wed",
      title: "Upper A",
      focus: "Bench + row",
      status: "up_next",
      estimatedMinutes: 50,
      exercises: [
        {
          id: "e1",
          name: "DB Bench Press",
          mediaLabel: "DB Bench demo",
          cue: "Pause 1s. Smooth press.",
          movekit: { kind: "key", key: "dumbbell-bench-press" },
          sets: [
            { id: "s1", reps: "10", suggestedWeight: "55s" },
            { id: "s2", reps: "10", suggestedWeight: "55s" },
            { id: "s3", reps: "AMRAP", suggestedWeight: "50s" },
          ],
        },
        {
          id: "e2",
          name: "Cable Single Arm Underhand Grip Row",
          mediaLabel: "Cable row demo",
          cue: "Chest tall, pull elbow to hip pocket.",
          movekit: { kind: "key", key: "cable-single-arm-underhand-grip-row" },
          sets: [
            { id: "s1", reps: "12", suggestedWeight: "110 lb" },
            { id: "s2", reps: "12", suggestedWeight: "110 lb" },
          ],
        },
      ],
    },
    {
      id: "w3",
      dayLabel: "Fri",
      title: "Full Body B",
      focus: "Hinge + push + core",
      status: "scheduled",
      estimatedMinutes: 45,
      exercises: [
        {
          id: "e1",
          name: "Barbell Deadlift",
          mediaLabel: "Deadlift demo",
          cue: "Push the floor away. Stand tall at lockout.",
          movekit: { kind: "key", key: "barbell-deadlift" },
          sets: [
            { id: "s1", reps: "5", suggestedWeight: "225 lb" },
            { id: "s2", reps: "5", suggestedWeight: "225 lb" },
            { id: "s3", reps: "5", suggestedWeight: "225 lb" },
          ],
        },
        {
          id: "e2",
          name: "Incline DB Press",
          mediaLabel: "Incline DB demo",
          cue: "Ribs down. Press slightly back.",
          movekit: { kind: "key", key: "dumbbell-incline-bench-press" },
          sets: [
            { id: "s1", reps: "10", suggestedWeight: "45s" },
            { id: "s2", reps: "10", suggestedWeight: "45s" },
          ],
        },
      ],
    },
  ];
}

