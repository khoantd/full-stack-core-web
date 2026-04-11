import { redirect } from "next/navigation";

export default function HomePage() {
  // Locale-prefixed routing is handled by next-intl. Keep this explicit redirect
  // so `/` always lands on a deterministic entry point.
  redirect("/en/dashboard");
}
