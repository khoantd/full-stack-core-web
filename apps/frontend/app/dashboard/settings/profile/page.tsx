import ProfileForm from "../profile-form";
import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "My Preferences",
    description: "Manage your personal language, timezone, and notification preferences.",
  });
}

export default function ProfileSettingsPage() {
  return <ProfileForm />;
}
