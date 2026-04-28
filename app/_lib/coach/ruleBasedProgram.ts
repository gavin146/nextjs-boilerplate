import type { ProgramExercise } from "../exerciseMedia";
import type { ProgramWorkout } from "../programData";
import type { ClientProfile, DailyCheckIn } from "../domain";
import { EXERCISE_LIBRARY } from "../exerciseLibrary";

function pick(id: string): ProgramExercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

function setsFor(
  ex: ProgramExercise,
  reps: string[],
  weights: string[],
): ProgramExercise {
  return {
    ...ex,
    id: `${ex.id}-inst`,
    sets: reps.map((r, i) => ({
      id: `s${i + 1}`,
      reps: r,
      suggestedWeight: weights[i] ?? weights[weights.length - 1] ?? "0 lb",
    })),
  };
}

function intensityScale(profile: ClientProfile, checkIns: DailyCheckIn[]): number {
  const sorted = [...checkIns].sort((a, b) =>
    a.dateISO < b.dateISO ? 1 : -1,
  );
  const latest = sorted[0];
  let m = 1;
  if (latest) {
    const avg =
      (latest.sleepQuality + latest.readiness + (11 - latest.stress)) / 3;
    if (avg < 6) m = 0.85;
    else if (avg > 8) m = 1.05;
  }
  if (profile.experience === "beginner") m *= 0.92;
  if (profile.experience === "advanced") m *= 1.05;
  return m;
}

type GoalTheme = "hypertrophy" | "strength" | "fat_loss_balance";

function goalTheme(profile: ClientProfile): GoalTheme {
  const g = profile.goalsText.toLowerCase();
  if (
    g.includes("fat loss") ||
    g.includes("weight loss") ||
    g.includes("conditioning") ||
    g.includes("lean")
  )
    return "fat_loss_balance";
  if (
    g.includes("hypertrophy") ||
    g.includes("muscle") ||
    g.includes("size") ||
    g.includes("mass") ||
    g.includes("build muscle")
  )
    return "hypertrophy";
  if (
    g.includes("strength") ||
    g.includes("power") ||
    g.includes("performance") ||
    g.includes("lift heavier")
  )
    return "strength";
  if (profile.experience === "beginner") return "fat_loss_balance";
  return "hypertrophy";
}

/**
 * Evidence-informed defaults when OpenAI is unavailable: compounds first,
 * 3 lifts per session where possible, balanced weekly volume across patterns.
 */
export function generateRuleBasedProgram(
  profile: ClientProfile,
  checkIns: DailyCheckIn[],
): ProgramWorkout[] {
  const scale = intensityScale(profile, checkIns);
  const heavy = (lb: number) => `${Math.round(lb * scale)} lb`;
  const db = (lb: number) => `${Math.round(lb * scale)}s`;

  const theme = goalTheme(profile);

  const squat = pick("lib-back-squat")!;
  const rdl = pick("lib-rdl")!;
  const walkingLunge = pick("lib-walking-lunge")!;
  const bench = pick("lib-db-bench")!;
  const row = pick("lib-row-cable")!;
  const latPd = pick("lib-lat-pulldown")!;
  const dl = pick("lib-deadlift")!;
  const incline = pick("lib-incline-db")!;
  const hipThrust = pick("lib-hip-thrust")!;
  const pullUp = pick("lib-pullup")!;

  let squatReps: string[];
  let squatWeights: string[];
  let hingeRepsA: string[];
  let hingeWeightsA: string[];
  let benchReps: string[];
  let benchWeights: string[];
  let rowReps: string[];

  switch (theme) {
    case "strength":
      squatReps = ["5", "5", "5+"];
      squatWeights = [heavy(185), heavy(185), heavy(175)];
      hingeRepsA = ["6", "6"];
      hingeWeightsA = [heavy(185), heavy(185)];
      benchReps = ["6", "6", "8"];
      benchWeights = [db(55), db(55), db(50)];
      rowReps = ["8", "8"];
      break;
    case "fat_loss_balance":
      squatReps = ["10", "10", "12"];
      squatWeights = [heavy(155), heavy(155), heavy(145)];
      hingeRepsA = ["10", "12"];
      hingeWeightsA = [heavy(165), heavy(165)];
      benchReps = ["12", "12", "AMRAP"];
      benchWeights = [db(45), db(45), db(45)];
      rowReps = ["12", "15"];
      break;
    default:
      squatReps = ["8", "8", "10"];
      squatWeights = [heavy(165), heavy(165), heavy(155)];
      hingeRepsA = ["8", "10"];
      hingeWeightsA = [heavy(175), heavy(175)];
      benchReps = ["10", "10", "AMRAP"];
      benchWeights = [db(55), db(55), db(50)];
      rowReps = ["10", "12"];
  }

  const blockLabel =
    theme === "strength"
      ? "Strength block"
      : theme === "fat_loss_balance"
        ? "Conditioning-friendly strength"
        : "Hypertrophy block";

  const lowerA: ProgramExercise[] = [
    setsFor(squat, squatReps, squatWeights),
    setsFor(rdl, hingeRepsA, hingeWeightsA),
    setsFor(walkingLunge, ["12", "12"], ["BW", "BW"]),
  ];

  const upperA: ProgramExercise[] = [
    setsFor(bench, benchReps, benchWeights),
    setsFor(row, rowReps, [heavy(110), heavy(105)]),
    setsFor(latPd, ["12", "12"], [heavy(120), heavy(120)]),
  ];

  const fullB: ProgramExercise[] = [
    setsFor(dl, ["5", "5", "5"], [heavy(225), heavy(225), heavy(215)]),
    setsFor(incline, benchReps.slice(0, 2), benchWeights.slice(0, 2)),
    theme === "strength"
      ? setsFor(pullUp, ["AMRAP", "AMRAP"], ["BW", "BW"])
      : setsFor(hipThrust, ["12", "15"], [heavy(135), heavy(135)]),
  ];

  return [
    {
      id: "gen-w1",
      dayLabel: "Mon",
      title: `${blockLabel} · Lower A`,
      focus:
        "Primary squat + hinge RDL + unilateral knee-dominant work — covers quads, glutes, hamstrings in one session.",
      status: "up_next",
      estimatedMinutes: 62,
      exercises: lowerA,
    },
    {
      id: "gen-w2",
      dayLabel: "Wed",
      title: `${blockLabel} · Upper A`,
      focus:
        "Horizontal push + horizontal row + vertical pull — balanced pressing volume and lat / upper-back stimulus.",
      status: "scheduled",
      estimatedMinutes: 58,
      exercises: upperA,
    },
    {
      id: "gen-w3",
      dayLabel: "Fri",
      title: `${blockLabel} · Full B`,
      focus:
        theme === "strength"
          ? "Axial deadlift strength + incline pressing + vertical pull frequency for pattern balance."
          : "Conventional hinge priority + incline pressing + hip extension accessory for posterior chain completeness.",
      status: "scheduled",
      estimatedMinutes: 60,
      exercises: fullB,
    },
  ];
}
