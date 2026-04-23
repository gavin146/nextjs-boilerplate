export type SetState = "todo" | "done";

export type WorkoutExercise = {
  id: string;
  name: string;
  note?: string;
  sets: Array<{
    id: string;
    target: string;
    state: SetState;
  }>;
};

export function demoWorkout(): WorkoutExercise[] {
  return [
    {
      id: "e1",
      name: "Back Squat",
      note: "RPE 7–8. Brace + controlled eccentric.",
      sets: [
        { id: "s1", target: "5 reps @ 185", state: "todo" },
        { id: "s2", target: "5 reps @ 185", state: "todo" },
        { id: "s3", target: "5 reps @ 185", state: "todo" },
      ],
    },
    {
      id: "e2",
      name: "DB Bench Press",
      note: "Pause 1s at bottom. Smooth tempo.",
      sets: [
        { id: "s1", target: "10 reps @ 55s", state: "todo" },
        { id: "s2", target: "10 reps @ 55s", state: "todo" },
        { id: "s3", target: "AMRAP @ 50s", state: "todo" },
      ],
    },
    {
      id: "e3",
      name: "Cable Single Arm Underhand Grip Row",
      note: "Chest tall, pull elbow to hip pocket.",
      sets: [
        { id: "s1", target: "12 reps @ 110", state: "todo" },
        { id: "s2", target: "12 reps @ 110", state: "todo" },
      ],
    },
    {
      id: "e4",
      name: "Russian Twist",
      note: "Control rotation; keep ribs quiet.",
      sets: [
        { id: "s1", target: "20 reps", state: "todo" },
        { id: "s2", target: "20 reps", state: "todo" },
      ],
    },
  ];
}

export function pct(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

