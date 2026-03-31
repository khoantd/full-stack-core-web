"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconLoader2, IconExternalLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenants, useUpdateLandingConfig } from "@/hooks/useTenant";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { THEMES } from "@/lib/themes";
import type { LandingConfig } from "@/types/tenant.type";

const SECTION_TOGGLES: { key: keyof LandingConfig; label: string }[] = [
  { key: "heroEnabled", label: "Hero / Slider" },
  { key: "categoriesEnabled", label: "Product Categories" },
  { key: "statsEnabled", label: "Stats Bar" },
  { key: "aboutEnabled", label: "About Section" },
  { key: "productsEnabled", label: "Featured Products" },
  { key: "testimonialsEnabled", label: "Testimonials" },
  { key: "blogsEnabled", label: "Blog Posts" },
  { key: "contactEnabled", label: "Contact Form" },
];

export default function LandingSettingsPage() {
  const { data: tenants, isLoading } = useTenants();
  const updateLanding = useUpdateLandingConfig();

  const tenantId =
    typeof window !== "undefined"
      ? getTenantIdFromToken(getStoredToken() ?? "")
      : null;

  const tenant = tenants?.find((t) => t._id === tenantId);
  const cfg = tenant?.landingConfig ?? {};

  const { register, handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm<LandingConfig>({
    defaultValues: {
      siteName: "", tagline: "", phone: "", email: "",
      address: "", hours: "", facebook: "", twitter: "",
      linkedin: "", youtube: "", theme: "orange",
      heroEnabled: true, categoriesEnabled: true, statsEnabled: true,
      aboutEnabled: true, productsEnabled: true, testimonialsEnabled: true,
      blogsEnabled: true, contactEnabled: true,
    },
  });

  useEffect(() => {
    if (!cfg) return;
    reset({
      siteName: cfg.siteName ?? "",
      tagline: cfg.tagline ?? "",
      phone: cfg.phone ?? "",
      email: cfg.email ?? "",
      address: cfg.address ?? "",
      hours: cfg.hours ?? "",
      facebook: cfg.facebook ?? "",
      twitter: cfg.twitter ?? "",
      linkedin: cfg.linkedin ?? "",
      youtube: cfg.youtube ?? "",
      theme: cfg.theme ?? "orange",
      heroEnabled: cfg.heroEnabled ?? true,
      categoriesEnabled: cfg.categoriesEnabled ?? true,
      statsEnabled: cfg.statsEnabled ?? true,
      aboutEnabled: cfg.aboutEnabled ?? true,
      productsEnabled: cfg.productsEnabled ?? true,
      testimonialsEnabled: cfg.testimonialsEnabled ?? true,
      blogsEnabled: cfg.blogsEnabled ?? true,
      contactEnabled: cfg.contactEnabled ?? true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?._id]);

  const onSubmit = (data: LandingConfig) => {
    updateLanding.mutate(data, {
      onSuccess: () => {
        fetch("/api/revalidate-landing", { method: "POST" });
        toast.success("Landing page settings saved");
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? "Save failed"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Landing Page</h3>
          <p className="text-sm text-muted-foreground">
            Configure what visitors see on your public landing page.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <IconExternalLink className="h-3.5 w-3.5" />
          Preview
        </a>
      </div>
      <Separator />

      {/* General */}
      <section className="space-y-4">
        <h4 className="text-sm font-semibold">General</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" {...register("siteName")} placeholder="Car Parts" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" {...register("tagline")} placeholder="Quality Auto Parts for Every Ride" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Accent Theme</Label>
          <Select value={watch("theme") ?? "orange"} onValueChange={(v) => setValue("theme", v, { shouldDirty: true })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                    {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      {/* Contact Info */}
      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Contact Info</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} placeholder="+1 543-705-8174" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="support@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="123 Main St, City, State" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Business Hours</Label>
            <Input id="hours" {...register("hours")} placeholder="Mon–Sat: 8am – 6pm" />
          </div>
        </div>
      </section>

      <Separator />

      {/* Social Links */}
      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Social Links</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["facebook", "twitter", "linkedin", "youtube"] as const).map((platform) => (
            <div key={platform} className="space-y-1.5">
              <Label htmlFor={platform} className="capitalize">{platform}</Label>
              <Input id={platform} {...register(platform)} placeholder={`https://${platform}.com/yourpage`} />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Section Visibility */}
      <section className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold">Section Visibility</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Toggle which sections appear on the landing page.</p>
        </div>
        <div className="space-y-3">
          {SECTION_TOGGLES.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{label}</span>
              <Switch
                checked={watch(key) as boolean ?? true}
                onCheckedChange={(v) => setValue(key, v, { shouldDirty: true })}
                className="cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={!isDirty || updateLanding.isPending} className="cursor-pointer">
        {updateLanding.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
