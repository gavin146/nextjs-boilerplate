import { WorkoutDetailClient } from "./WorkoutDetailClient";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  return <WorkoutDetailClient workoutId={workoutId} />;
}
