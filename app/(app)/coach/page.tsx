"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useVisualViewportInset } from "../../_lib/useVisualViewportInset";
import { useAppProgram } from "../providers/AppProgramProvider";
import { Card, TopBar } from "../../_ui/blocks";
import { APP_FOCUS_RING } from "../../_ui/focusRing";
import { TouchButton } from "../../_ui/TouchButton";

type Msg = { role: "user" | "assistant"; content: string };

function sessionContextFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): string | null {
  if (!searchParams) return null;
  const lift = searchParams.get("lift");
  const workout = searchParams.get("workout");
  const exIdx = searchParams.get("exIdx");
  const exTotal = searchParams.get("exTotal");
  if (!lift?.trim() && !workout?.trim()) return null;
  const parts: string[] = [];
  if (workout?.trim()) parts.push(`Session: ${workout.trim()}`);
  if (lift?.trim()) parts.push(`Lift: ${lift.trim()}`);
  if (exIdx?.trim() && exTotal?.trim())
    parts.push(`Exercise ${exIdx.trim()} of ${exTotal.trim()}`);
  return parts.join(" · ");
}

function CoachChatInner() {
  const searchParams = useSearchParams();
  const sessionContext = useMemo(
    () => sessionContextFromSearchParams(searchParams),
    [searchParams],
  );

  const {
    state,
    profile,
    updateProfile,
    rememberCoachFact,
    trainingMetricsPrompt,
  } = useAppProgram();
  const keyboardInset = useVisualViewportInset();
  const seededFromUrl = useRef(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "What felt off on your last set? One sentence is enough.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionContext || seededFromUrl.current) return;
    seededFromUrl.current = true;
    setMessages([
      {
        role: "assistant",
        content: `${sessionContext}. What felt off on your last set? One sentence is enough.`,
      },
    ]);
  }, [sessionContext]);

  const summary = useMemo(
    () =>
      `${profile.experience} · ${profile.daysPerWeek}x weekly · ${profile.equipmentNotes}`,
    [profile],
  );

  const sendBody = useCallback(
    async (msgs: Msg[]) => {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.slice(-10),
          profileSummary: `${summary}. Goals: ${profile.goalsText.slice(0, 400)}`,
          coachFacts: state.coachMemory.facts,
          sessionContext: sessionContext ?? undefined,
          metricsSummary: trainingMetricsPrompt,
        }),
      });
      const raw = await res.text();
      let data: { reply?: string; error?: string };
      try {
        data = JSON.parse(raw) as { reply?: string; error?: string };
      } catch {
        throw new Error("Coach returned an invalid response.");
      }
      if (!res.ok) {
        throw new Error(data.error ?? `Coach unavailable (${res.status}).`);
      }
      const reply =
        data.reply ??
        "Try one notch lighter and own each rep. Tell me which lift.";
      return reply;
    },
    [
      profile.goalsText,
      sessionContext,
      state.coachMemory.facts,
      summary,
      trainingMetricsPrompt,
    ],
  );

  const sendWithText = useCallback(
    async (explicit?: string) => {
      const text = (explicit ?? input).trim();
      if (!text || busy) return;
      setInput("");
      const next: Msg[] = [...messages, { role: "user", content: text }];
      setMessages(next);
      setBusy(true);
      setFetchError(null);
      try {
        const reply = await sendBody(next);
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (text.length > 8) {
          const liftNote = sessionContext?.slice(0, 120);
          rememberCoachFact(
            liftNote
              ? `${liftNote} · Asked: ${text.slice(0, 100)}`
              : `Asked: ${text.slice(0, 100)}`,
          );
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Something went wrong. Try again.";
        setFetchError(msg);
        setMessages((m) => m.slice(0, -1));
        setInput(text);
      } finally {
        setBusy(false);
        queueMicrotask(() =>
          listEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          }),
        );
      }
    },
    [
      busy,
      input,
      messages,
      rememberCoachFact,
      sendBody,
      sessionContext,
    ],
  );

  const placeholder = sessionContext
    ? `Issue on ${searchParams?.get("lift")?.trim() || "this lift"}…`
    : "Squat · knees cave rep 4";

  const composerPadStyle =
    keyboardInset > 0
      ? ({ paddingBottom: keyboardInset } as const)
      : undefined;

  return (
    <div className="pb-6">
      <TopBar
        title="Coach"
        subtitle="Quick fixes between sets · answers also appear on each exercise screen"
      />

      <div className="space-y-3 px-4 pt-3">
        <details className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 open:pb-4">
          <summary
            className={`cursor-pointer list-none text-[15px] font-semibold text-white/88 [touch-action:manipulation] [&::-webkit-details-marker]:hidden ${APP_FOCUS_RING} rounded-xl px-1 -mx-1 py-0.5`}
          >
            Goals & gear
          </summary>
          <p className="mt-2 text-[12px] text-white/45">{summary}</p>
          <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-white/42">
            Your goals
          </label>
          <textarea
            value={profile.goalsText}
            onChange={(e) => updateProfile({ goalsText: e.target.value })}
            rows={3}
            className={`mt-1 w-full resize-none rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2.5 text-[14px] leading-relaxed text-white outline-none transition focus:border-sky-400/50 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.18)] ${APP_FOCUS_RING}`}
          />
        </details>

        <Card className="p-3">
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-3 text-[14px] leading-relaxed sm:text-[15px] ${
                    m.role === "user"
                      ? "bg-sky-400/22 text-white"
                      : "border border-white/10 bg-black/35 text-white/[0.93]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="text-[12px] text-white/40">Thinking…</div>
            ) : null}
            <div ref={listEndRef} />
          </div>

          <div
            className="mt-4 border-t border-white/10 pt-3"
            style={composerPadStyle}
          >
            {fetchError ? (
              <div className="mb-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-[13px] leading-relaxed text-rose-100/95">
                {fetchError}
              </div>
            ) : null}

            <div className="flex gap-2">
              <textarea
                value={input}
                rows={2}
                enterKeyHint="send"
                autoCapitalize="sentences"
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={busy}
                className={`min-h-[52px] max-h-[120px] min-w-0 flex-1 resize-none rounded-xl border border-white/12 bg-zinc-900/90 px-3 py-2.5 text-[16px] leading-snug text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/50 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.18)] disabled:opacity-50 ${APP_FOCUS_RING}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendWithText();
                  }
                }}
              />
              <TouchButton
                className="!h-[52px] shrink-0 self-start !min-w-[4.75rem]"
                size="md"
                type="button"
                disabled={busy || !input.trim()}
                onClick={() => void sendWithText()}
              >
                Send
              </TouchButton>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Knees cave on squat",
                "Low back on deadlift",
                "Bench feels heavy",
              ].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  disabled={busy}
                  onClick={() => void sendWithText(quick)}
                  className={`min-h-[44px] rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-left text-[13px] leading-snug text-white/78 [touch-action:manipulation] transition active:bg-white/10 disabled:opacity-40 ${APP_FOCUS_RING}`}
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CoachFallback() {
  return (
    <div className="pb-6">
      <TopBar
        title="Coach"
        subtitle="Quick fixes between sets · answers also appear on each exercise screen"
      />
      <div className="px-4 pt-4 text-[14px] text-white/45">Loading…</div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<CoachFallback />}>
      <CoachChatInner />
    </Suspense>
  );
}
