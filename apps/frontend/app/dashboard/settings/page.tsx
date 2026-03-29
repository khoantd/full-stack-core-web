"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, CheckCircle2, AlertCircle, Settings, Shield, Bell, Plug } from "lucide-react";

type SettingValue = string | number | boolean;
type GroupedSettings = Record<string, Array<{ key: string; value: SettingValue; description?: string }>>;

const GROUP_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  general: { label: "General", icon: Settings, description: "Basic site configuration" },
  security: { label: "Security", icon: Shield, description: "Authentication & access policies" },
  integrations: { label: "Integrations", icon: Plug, description: "Third-party service connections" },
  notifications: { label: "Notifications", icon: Bell, description: "Alert & notification preferences" },
};

function SettingField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: SettingValue;
  onChange: (v: SettingValue) => void;
}) {
  const id = `setting-${label.replace(/\s+/g, "-").toLowerCase()}`;
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={id} className="font-medium capitalize">
            {label.replace(/_/g, " ")}
          </Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Switch id={id} checked={value} onCheckedChange={onChange} />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-medium capitalize">
        {label.replace(/_/g, " ")}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <Input
        id={id}
        type={typeof value === "number" ? "number" : label.includes("token") || label.includes("password") ? "password" : "text"}
        value={String(value)}
        onChange={(e) =>
          onChange(typeof value === "number" ? Number(e.target.value) : e.target.value)
        }
        className="max-w-md"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [groups, setGroups] = useState<GroupedSettings>({});
  const [draft, setDraft] = useState<Record<string, SettingValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get<GroupedSettings>("/settings");
      setGroups(res.data);
      // Flatten into draft map
      const flat: Record<string, SettingValue> = {};
      Object.values(res.data).flat().forEach((s) => { flat[s.key] = s.value; });
      setDraft(flat);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const payload = Object.entries(draft).map(([key, value]) => ({ key, value }));
      await axiosClient.post("/settings/bulk", { settings: payload });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e: any) {
      setSaveStatus("error");
      setError(e?.response?.data?.message ?? "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const allGroupKeys = [
    ...Object.keys(GROUP_META),
    ...Object.keys(groups).filter((k) => !(k in GROUP_META)),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage system-wide configuration. Changes take effect immediately.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading} id="settings-save-btn">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saveStatus === "success" ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving…" : saveStatus === "success" ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Confirmation dialog for security-sensitive changes */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Settings saved successfully. Changes are now live.
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {allGroupKeys.map((groupKey) => {
            const meta = GROUP_META[groupKey];
            const Icon = meta?.icon ?? Settings;
            const items = groups[groupKey] ?? [];
            return (
              <Card key={groupKey} id={`settings-group-${groupKey}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {meta?.label ?? groupKey}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {items.length} setting{items.length !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                  {meta?.description && (
                    <CardDescription>{meta.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No settings configured.</p>
                  ) : (
                    items.map((item, idx) => (
                      <div key={item.key}>
                        {idx > 0 && <Separator className="mb-4" />}
                        <SettingField
                          label={item.key}
                          description={item.description}
                          value={draft[item.key] ?? item.value}
                          onChange={(v) =>
                            setDraft((prev) => ({ ...prev, [item.key]: v }))
                          }
                        />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
