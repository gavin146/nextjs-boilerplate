import type { ReactNode } from "react";

/**
 * Per-exercise session: tune touch and tap feedback for a native app–like feel on phones
 * (no double-tap zoom delay, no gray flash on taps).
 */
export default function WorkoutExerciseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
    >
      {children}
    </div>
  );
}
