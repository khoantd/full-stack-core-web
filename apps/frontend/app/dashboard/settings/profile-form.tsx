"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axiosClient from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { routing, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TIMEZONES = [
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

interface Preferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  dashboardAlerts: boolean;
}

const DEFAULT_PREFS: Preferences = {
  language: "en",
  timezone: "Asia/Ho_Chi_Minh",
  emailNotifications: true,
  dashboardAlerts: true,
};

export default function ProfileSettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    axiosClient
      .get<{ data: Partial<Preferences> }>("/users/me/preferences")
      .then((res) => {
        setPrefs({ ...DEFAULT_PREFS, ...res.data.data });
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem("user_preferences");
          if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
        } catch {}
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-GB", { timeZone: prefs.timezone })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [prefs.timezone]);

  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const setLanguage = (lang: string) => {
    set("language", lang);

    // UI locale comes from the URL prefix (next-intl). Changing the preference
    // alone won't re-render translations. For supported locales, update route.
    if ((routing.locales as readonly string[]).includes(lang)) {
      const locale = lang as AppLocale;
      const query = searchParams?.toString();
      const target = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(target as any, { locale });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put("/users/me/preferences", prefs);
      localStorage.setItem("user_preferences", JSON.stringify(prefs));
      setSaved(true);
      toast.success("Preferences saved — your settings have been updated.");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Personalise the CMS to match your context.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} id="prefs-save-btn">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving…" : saved ? "Saved!" : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locale</CardTitle>
          <CardDescription>
            Controls language and time display across the entire CMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="pref-language">Language</Label>
            <Select value={prefs.language} onValueChange={setLanguage}>
              <SelectTrigger id="pref-language" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="pref-timezone">Timezone</Label>
            <p className="text-xs text-muted-foreground">
              All date/time displays across the CMS will reflect this zone.
            </p>
            <Select value={prefs.timezone} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger id="pref-timezone" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Current time:{" "}
              <span className="font-medium text-foreground">{currentTime ?? "—"}</span>{" "}
              ({prefs.timezone})
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose which alerts you receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pref-email-notif" className="font-medium">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive important updates by email.
              </p>
            </div>
            <Switch
              id="pref-email-notif"
              checked={prefs.emailNotifications}
              onCheckedChange={(v) => set("emailNotifications", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pref-dashboard-alerts" className="font-medium">
                Dashboard Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Show system metric alerts on the dashboard widgets.
              </p>
            </div>
            <Switch
              id="pref-dashboard-alerts"
              checked={prefs.dashboardAlerts}
              onCheckedChange={(v) => set("dashboardAlerts", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
