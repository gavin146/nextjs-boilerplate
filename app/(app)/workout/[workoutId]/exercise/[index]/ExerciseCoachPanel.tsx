"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useVisualViewportInset } from "../../../../../_lib/useVisualViewportInset";
import { APP_FOCUS_RING } from "../../../../../_ui/focusRing";
import { TouchButton } from "../../../../../_ui/TouchButton";

const QUICK = [
  "Knees cave",
  "Low back feels off",
  "Too heavy today",
  "Where should I feel this?",
];

function coachReplyHaptic() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  } catch {
    /* ignore */
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
  exerciseTitle: string;
  workoutTitle: string;
  subtitle: string;
  /** Calls API and returns assistant reply text */
  onAsk: (question: string) => Promise<string>;
  /** Tap chip fills text and sends immediately (mobile default). */
  quickChipSends?: boolean;
};

export function ExerciseCoachPanel({
  open,
  onClose,
  disabled,
  exerciseTitle,
  workoutTitle,
  subtitle,
  onAsk,
  quickChipSends = true,
}: Props) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const lastAttemptRef = useRef<{ question: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const keyboardInset = useVisualViewportInset();

  useEffect(() => {
    if (!open) {
      setQ("");
      setAnswer(null);
      setBusy(false);
      setFetchError(null);
      lastAttemptRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const scrollAnswerIntoView = useCallback(() => {
    queueMicrotask(() => {
      scrollAreaRef.current?.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const submit = useCallback(
    async (explicitQuestion?: string) => {
      const text = (explicitQuestion ?? q).trim();
      if (!text || busy || disabled) return;
      lastAttemptRef.current = { question: text };
      setBusy(true);
      setFetchError(null);
      try {
        const reply = await onAsk(text);
        setAnswer(reply);
        coachReplyHaptic();
        scrollAnswerIntoView();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong. Try again.";
        setFetchError(msg);
      } finally {
        setBusy(false);
      }
    },
    [q, busy, disabled, onAsk, scrollAnswerIntoView],
  );

  function onChip(chip: string) {
    setQ(chip);
    if (quickChipSends && !busy && !disabled) {
      void submit(chip);
    }
  }

  function handleRetry() {
    const prev = lastAttemptRef.current?.question?.trim();
    if (!prev || busy || disabled) return;
    void submit(prev);
  }

  function handleSheetPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragStartY.current = e.clientY;
  }

  function handleSheetPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const start = dragStartY.current;
    dragStartY.current = null;
    if (start == null || disabled) return;
    if (e.clientY - start > 72) onClose();
  }

  if (!open) return null;

  const sheetLiftStyle =
    keyboardInset > 0
      ? ({ marginBottom: keyboardInset } as const)
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[105] flex flex-col justify-end bg-black/55 backdrop-blur-[2px] pt-[env(safe-area-inset-top,0px)] [touch-action:manipulation]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ex-coach-title"
    >
      <button
        type="button"
        className="min-h-0 flex-1 cursor-default focus:outline-none"
        aria-label="Close coach"
        onClick={onClose}
      />
      <div
        style={sheetLiftStyle}
        className="flex max-h-[min(640px,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-12px))] min-h-0 w-full flex-col overflow-hidden rounded-t-3xl border border-white/12 border-b-0 bg-zinc-950 shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-[max(8px,env(safe-area-inset-top,0px))]">
            <div
              role="presentation"
              onPointerDown={handleSheetPointerDown}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={() => {
                dragStartY.current = null;
              }}
              className="mx-auto mb-3 h-6 w-full touch-none pt-2 [-webkit-touch-callout:none]"
            >
              <div className="mx-auto h-1 w-11 rounded-full bg-white/25" />
            </div>
            <h2
              id="ex-coach-title"
              className="text-[17px] font-semibold leading-snug text-white"
            >
              Coach
            </h2>
            <p className="mt-1 text-[13px] text-white/55">{subtitle}</p>
            <p className="mt-2 text-[14px] font-medium leading-snug text-white/90">
              {exerciseTitle}
            </p>
            <p className="text-[12px] text-white/45">{workoutTitle}</p>
          </div>

          <div
            ref={scrollAreaRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-1 app-scroll-touch"
          >
            {busy ? (
              <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white/55">
                Getting answer…
              </div>
            ) : null}

            {fetchError ? (
              <div className="mb-3 space-y-2 rounded-2xl border border-rose-400/35 bg-rose-500/10 px-3 py-3">
                <p className="text-[13px] leading-relaxed text-rose-100/95">
                  {fetchError}
                </p>
                <button
                  type="button"
                  disabled={busy || !!disabled}
                  onClick={() => handleRetry()}
                  className={`w-full rounded-xl border border-white/15 bg-white/[0.08] py-2.5 text-[14px] font-semibold text-white [touch-action:manipulation] transition active:bg-white/[0.12] disabled:opacity-40 ${APP_FOCUS_RING}`}
                >
                  Retry
                </button>
              </div>
            ) : null}

            {answer ? (
              <div
                className={`mb-3 rounded-2xl border border-sky-400/25 bg-sky-400/[0.08] px-3 py-3 text-[14px] leading-relaxed text-white/92 ${busy ? "opacity-70" : ""}`}
              >
                {answer}
              </div>
            ) : !busy && !fetchError ? (
              <p className="mb-3 text-[13px] text-white/45">
                Answer appears here — stay on this lift.
              </p>
            ) : null}
          </div>

          <div className="shrink-0 space-y-2 border-t border-white/10 px-4 pb-[max(12px,env(safe-area-inset-bottom,0px))] pt-3">
            <div className="flex flex-wrap gap-2">
              {QUICK.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={busy || !!disabled}
                  onClick={() => onChip(chip)}
                  className={`min-h-[44px] rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-left text-[13px] leading-snug text-white/85 [touch-action:manipulation] transition active:bg-white/10 disabled:opacity-40 ${APP_FOCUS_RING}`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              value={q}
              rows={2}
              enterKeyHint="send"
              autoCapitalize="sentences"
              autoCorrect="on"
              onChange={(e) => setQ(e.target.value)}
              placeholder="What feels wrong or unclear?"
              disabled={busy || !!disabled}
              className={`max-h-[120px] min-h-[52px] w-full resize-none rounded-2xl border border-white/12 bg-zinc-900/95 px-3 py-3 text-[16px] leading-snug text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/50 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.18)] disabled:opacity-50 ${APP_FOCUS_RING}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <div className="flex gap-2">
              <TouchButton
                variant="secondary"
                size="md"
                type="button"
                className="!h-[48px] flex-1"
                onClick={onClose}
              >
                Close
              </TouchButton>
              <TouchButton
                size="md"
                type="button"
                className="!h-[48px] flex-[2]"
                disabled={busy || !!disabled || !q.trim()}
                onClick={() => void submit()}
              >
                {busy ? "…" : "Get answer"}
              </TouchButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
