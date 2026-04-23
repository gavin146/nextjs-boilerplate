import Link from "next/link";
import { demoWeekWorkouts } from "../../../_lib/programData";
import { Card, TopBar } from "../../../_ui/blocks";
import { TouchButton } from "../../../_ui/TouchButton";
import { ChevronRightIcon, PlayIcon } from "../../../_ui/icons";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = demoWeekWorkouts().find((w) => w.id === workoutId);

  if (!workout) {
    return (
      <div className="min-h-dvh">
        <TopBar
          backHref="/workout"
          title="Workout"
          subtitle="Not found"
        />
        <div className="px-4 pt-4">
          <Card className="p-4">
            <div className="text-[15px]">That workout doesn’t exist.</div>
            <div className="mt-3">
              <Link href="/workout" className="block">
                <TouchButton variant="secondary">Back to workouts</TouchButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalSets = workout.exercises.reduce(
    (n, e) => n + e.sets.length,
    0,
  );
  const first = workout.exercises[0];

  return (
    <div className="min-h-dvh">
      <TopBar
        backHref="/workout"
        title={workout.title}
        subtitle={`${workout.dayLabel} · ${workout.estimatedMinutes} min`}
      />

      <div className="px-4 pt-4 space-y-4">
        <Card className="border border-white/10 bg-gradient-to-b from-sky-400/[0.08] to-white/[0.04] p-4">
          <div className="text-[12px] font-medium text-white/50">Starts with</div>
          <div className="mt-1.5 text-[18px] font-semibold leading-snug tracking-tight">
            {first?.name ?? "—"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-white/55">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {workout.exercises.length} exercises
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {totalSets} sets
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {workout.focus}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <Link
              href={`/workout/${workout.id}/exercise/0`}
              className="block"
            >
              <TouchButton left={<PlayIcon className="text-zinc-950" />}>
                Start workout
              </TouchButton>
            </Link>
            <Link href="/coach" className="block">
              <TouchButton variant="secondary" size="md">
                Warm-up & mobility tips
              </TouchButton>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[16px] font-semibold tracking-tight">Exercises</div>
          <p className="mt-1 text-[13px] text-white/50">
            Tap for video, cues, and set logging.
          </p>
          <div className="mt-4 space-y-2">
            {workout.exercises.map((ex, idx) => (
              <Link
                key={ex.id}
                href={`/workout/${workout.id}/exercise/${idx}`}
                className="block"
              >
                <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition active:bg-white/[0.07]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-900 text-[14px] font-bold tabular-nums text-sky-200/90">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold leading-tight tracking-tight">
                      {ex.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-white/50">
                      {ex.sets.length} sets · {ex.sets[0]?.reps ?? "—"} reps
                      {ex.sets[0]?.suggestedWeight
                        ? ` · ${ex.sets[0].suggestedWeight}`
                        : null}
                    </div>
                  </div>
                  <ChevronRightIcon className="shrink-0 text-white/30" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="h-6" />
      </div>
    </div>
  );
}

