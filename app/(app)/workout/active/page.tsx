import { redirect } from "next/navigation";

/** Legacy URL: in-app sessions use `/workout/[id]/exercise/[index]`. */
export default function WorkoutActiveRedirect() {
  redirect("/workout");
}
