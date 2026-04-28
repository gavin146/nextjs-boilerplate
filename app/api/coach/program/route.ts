import { NextResponse } from "next/server";
import type { ClientProfile, DailyCheckIn } from "../../../_lib/domain";
import type { ProgramWorkout } from "../../../_lib/programData";
import { generateRuleBasedProgram } from "../../../_lib/coach/ruleBasedProgram";

export const runtime = "nodejs";

type Body = {
  profile: ClientProfile;
  checkIns: DailyCheckIn[];
  coachFacts?: string[];
  /** Client-reported training signals: RPE history, logged sets, coach Q&A, etc. */
  metricsSummary?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const workouts = generateRuleBasedProgram(body.profile, body.checkIns ?? []);
    return NextResponse.json({ workouts, source: "rules" });
  }

  try {
    const workouts = await generateWithOpenAI(apiKey, body);
    return NextResponse.json({ workouts, source: "openai" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Coach error";
    const fallback = generateRuleBasedProgram(body.profile, body.checkIns ?? []);
    return NextResponse.json({ workouts: fallback, source: "rules_fallback", warning: msg });
  }
}

async function generateWithOpenAI(
  apiKey: string,
  body: Body,
): Promise<ProgramWorkout[]> {
  const system = `You are an expert strength and conditioning coach grounded in exercise physiology (progressive overload, specificity, fatigue management, joint-friendly sequencing).

OUTPUT ONLY valid JSON (no markdown) matching:
{ "workouts": ProgramWorkout[] }

Each ProgramWorkout:
id: string (unique),
dayLabel: string (3 letters max),
title: string,
focus: string — MUST briefly explain SCIENCE rationale (patterns targeted, weekly balance, progression intent),
status: "up_next" | "scheduled" | "completed",
estimatedMinutes: number,
exercises: Array of {
  id: string,
  name: string,
  mediaLabel: string,
  cue: string — actionable biomechanical cue,
  movekit: { kind: "key", key: string } kebab-case basename like barbell-squat,
  sets: Array<{ id: string, reps: string, suggestedWeight: string }>
}

PROGRAM DESIGN RULES (mandatory depth):
- Provide exactly 3 distinct weekly sessions unless profile.daysPerWeek < 3 (then match daysPerWeek).
- Each session MUST include at least THREE exercises unless profile explicitly constrains volume — typically: primary compound + secondary compound + accessory OR single-leg / vertical pull finish as appropriate.
- Balance weekly patterns: squat/knee-dominant, hinge/posterior chain, horizontal push/pull, vertical pull where equipment allows. Do not repeat only the same two patterns.
- Align rep schemes and intensity with client goalsText (e.g. hypertrophy: moderate-higher reps on accessories; strength: lower rep primary work; fat loss / conditioning: maintain muscle with sustainable loads and full-body coverage).
- Respect profile.equipmentNotes and experience: beginners get fewer grinds, clearer progressions; home-gym profiles avoid machine-only prescriptions.
- Use trainingMetricsFromApp when present (RPE trends, soreness, check-ins): autoregulate suggested loads slightly down on low readiness signals, not by empty buzzwords — reference in focus strings implicitly.
- suggestedWeight: realistic lb, or dumbbell pairs as "55s" (two DBs), or "BW" for bodyweight.
- experience: grounded, not marketing claims; no medical diagnosis.
`;

  const userPayload = JSON.stringify({
    profile: body.profile,
    recentCheckIns: (body.checkIns ?? []).slice(0, 7),
    rememberedFacts: body.coachFacts ?? [],
    trainingMetricsFromApp: body.metricsSummary ?? "",
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Generate this week's lifting program as JSON: { "workouts": ProgramWorkout[] }\nContext:\n${userPayload}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { workouts?: ProgramWorkout[] };
  const workouts = parsed.workouts;
  if (!Array.isArray(workouts) || workouts.length === 0) {
    throw new Error("Model returned empty workouts");
  }
  return workouts;
}
