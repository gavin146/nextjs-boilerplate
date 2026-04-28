import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  profileSummary?: string;
  coachFacts?: string[];
  /** Optional context from Train session deep links (lift name, workout title, etc.). */
  sessionContext?: string;
  /** Logged sets, recent RPE, check-ins summary from the client app. */
  metricsSummary?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lastUser =
    [...(body.messages ?? [])].reverse().find((m) => m.role === "user")
      ?.content ?? "";

  const coachingProfile = coachingContext(
    body.profileSummary,
    body.sessionContext,
    body.metricsSummary,
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const reply = ruleBasedReply(lastUser, coachingProfile, body.coachFacts);
    return NextResponse.json({ reply, source: "rules" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are a concise lifting coach during a workout. Give one cue, one actionable adjustment, and optional load tweak. Exercise science grounded. Under 120 words.${coachingProfile ? `\nAthlete context:\n${coachingProfile}` : ""}${body.coachFacts?.length ? `\nRemember: ${body.coachFacts.slice(-8).join(" · ")}` : ""}`,
          },
          ...(body.messages ?? []).slice(-12),
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t.slice(0, 200));
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply =
      data.choices?.[0]?.message?.content ?? "Try again with more detail.";
    return NextResponse.json({ reply, source: "openai" });
  } catch {
    const reply = ruleBasedReply(lastUser, coachingProfile, body.coachFacts);
    return NextResponse.json({ reply, source: "rules_fallback" });
  }
}

function coachingContext(
  profileSummary?: string,
  sessionContext?: string,
  metricsSummary?: string,
): string | undefined {
  const parts = [
    profileSummary?.trim(),
    sessionContext?.trim(),
    metricsSummary?.trim(),
  ].filter(Boolean);
  if (!parts.length) return undefined;
  return parts.join("\n\n");
}

function ruleBasedReply(
  q: string,
  profile?: string,
  facts?: string[],
): string {
  const x = q.toLowerCase();
  const ctx = facts?.length ? ` I recall: ${facts.slice(-3).join("; ")}.` : "";
  if (x.includes("knee") || x.includes("valgus"))
    return `Think screw feet into floor and spread floor apart.${ctx} Push knees out as you rise, keep heel planted.`;
  if (x.includes("back") || x.includes("lumbar"))
    return `Brace ribs down before each rep.${ctx} If hinge patterns hurt, shorten ROM slightly and pause each dead-stop until feels clean.`;
  if (x.includes("heavy") || x.includes("too much"))
    return `Drop load about five percent for technique reps.${ctx} Finish sets two reps shy of grind until pattern feels crisp again.`;
  if (x.includes("bench") || x.includes("press"))
    return `Pull shoulder blades tight and slightly arc bar.${ctx} Pause first rep so position sticks every set.`;
  if (profile)
    return `Given your setup (${profile.slice(0, 120)}), prioritize crisp reps today.${ctx}`;
  return `Tell me which lift and what you felt on the last rep.${ctx}`;
}
