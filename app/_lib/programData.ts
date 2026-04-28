import type { ProgramExercise } from "./exerciseMedia";

export type ProgramWorkout = {
  id: string;
  dayLabel: string;
  title: string;
  focus: string;
  status: "up_next" | "scheduled" | "completed";
  estimatedMinutes: number;
  exercises: ProgramExercise[];
};

/** Starter week — mirrors rule-based structure (compounds + balanced patterns). */
export function demoWeekWorkouts(): ProgramWorkout[] {
  return [
    {
      id: "w1",
      dayLabel: "Mon",
      title: "Lower A",
      focus:
        "Heavy squat pattern + hinge hamstrings + single-leg quad emphasis — trains knees, hips, and hamstrings in complementary planes.",
      status: "completed",
      estimatedMinutes: 62,
      exercises: [
        {
          id: "e1",
          name: "Back Squat",
          mediaLabel: "Back Squat demo",
          cue: "Brace hard. Knees track over mid-foot; depth you own.",
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
          cue: "Hips back, shins vertical — bias hamstrings without rounding lumbar spine.",
          movekit: { kind: "key", key: "barbell-stiff-leg-deadlifts" },
          sets: [
            { id: "s1", reps: "8", suggestedWeight: "185 lb" },
            { id: "s2", reps: "8", suggestedWeight: "185 lb" },
          ],
        },
        {
          id: "e3",
          name: "Walking Lunge",
          mediaLabel: "Walking lunge",
          cue: "Short stride; vertical torso — loads each leg without collapsing knee inward.",
          movekit: { kind: "key", key: "lunge-walking" },
          sets: [
            { id: "s1", reps: "12", suggestedWeight: "BW" },
            { id: "s2", reps: "12", suggestedWeight: "BW" },
          ],
        },
      ],
    },
    {
      id: "w2",
      dayLabel: "Wed",
      title: "Upper A",
      focus:
        "Horizontal push + horizontal pull + vertical pull — balances pressing volume with lat and upper-back stimulus.",
      status: "up_next",
      estimatedMinutes: 58,
      exercises: [
        {
          id: "e1",
          name: "DB Bench Press",
          mediaLabel: "DB Bench demo",
          cue: "Pause 1s on chest; elbows ~45° — stable shoulder mechanics.",
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
          cue: "Chest tall; pull elbow to hip pocket — mid-back biased pull.",
          movekit: { kind: "key", key: "cable-single-arm-underhand-grip-row" },
          sets: [
            { id: "s1", reps: "12", suggestedWeight: "110 lb" },
            { id: "s2", reps: "12", suggestedWeight: "110 lb" },
          ],
        },
        {
          id: "e3",
          name: "Lat Pulldown",
          mediaLabel: "Lat pulldown",
          cue: "Chest lifted; elbows drive down — vertical lat emphasis vs rows.",
          movekit: { kind: "key", key: "machine-pulldown" },
          sets: [
            { id: "s1", reps: "12", suggestedWeight: "120 lb" },
            { id: "s2", reps: "12", suggestedWeight: "120 lb" },
          ],
        },
      ],
    },
    {
      id: "w3",
      dayLabel: "Fri",
      title: "Full Body B",
      focus:
        "Axial hinge strength + incline pressing + hip extension — posterior chain density then shoulders-incline bias.",
      status: "scheduled",
      estimatedMinutes: 60,
      exercises: [
        {
          id: "e1",
          name: "Barbell Deadlift",
          mediaLabel: "Deadlift demo",
          cue: "Push floor away; bar stays close — hinge pattern max exposure.",
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
          cue: "Ribs down; slight arc toward shoulders — upper chest bias.",
          movekit: { kind: "key", key: "dumbbell-incline-bench-press" },
          sets: [
            { id: "s1", reps: "10", suggestedWeight: "45s" },
            { id: "s2", reps: "10", suggestedWeight: "45s" },
          ],
        },
        {
          id: "e3",
          name: "Kettlebell Hip Thrust",
          mediaLabel: "KB hip thrust",
          cue: "Chin tucked; squeeze glutes at top — complements hinge deadlift.",
          movekit: { kind: "key", key: "kettlebell-hip-thrust" },
          sets: [
            { id: "s1", reps: "12", suggestedWeight: "135 lb" },
            { id: "s2", reps: "15", suggestedWeight: "135 lb" },
          ],
        },
      ],
    },
  ];
}
