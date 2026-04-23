import { ExerciseSessionClient } from "./ExerciseSessionClient";

/**
 * Server entry: `await params` so client children never receive the async `params`
 * Promise (avoids dev warnings when React DevTools / serialization enumerates props).
 */
export default async function ExercisePage({
  params,
}: {
  params: Promise<{ workoutId: string; index: string }>;
}) {
  const { workoutId, index } = await params;
  return <ExerciseSessionClient workoutId={workoutId} indexParam={index} />;
}
