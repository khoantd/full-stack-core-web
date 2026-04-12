"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconBox,
  IconCalendar,
  IconCategory,
  IconCreditCard,
  IconCar,
  IconNews,
  IconBriefcase,
  IconLoader2,
  IconTag,
  IconLayout,
} from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTenants, useUpdateTenantFeatures } from "@/hooks/useTenant";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { ALL_FEATURES, type FeatureKey } from "@/types/tenant.type";
import { checkDependencies, validateFeatureSet, type PendingToggle } from "./feature-dependencies";
import { DependencyWarningDialog } from "./DependencyWarningDialog";
import { useTranslations } from "next-intl";

const FEATURE_ICONS: Record<FeatureKey, React.ElementType> = {
  categories: IconCategory,
  products: IconBox,
  automakers: IconCar,
  pricings: IconTag,
  events: IconCalendar,
  services: IconBriefcase,
  serviceCategories: IconCategory,
  blogs: IconNews,
  payments: IconCreditCard,
  landingPages: IconLayout,
};

export default function FeaturesPage() {
  const t = useTranslations();
  const { data: tenants, isLoading, isError, error } = useTenants();
  const updateFeatures = useUpdateTenantFeatures();
  const [localEnabled, setLocalEnabled] = useState<Set<FeatureKey> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);

  // Resolve current tenant from JWT
  const tenantId = typeof window !== "undefined"
    ? getTenantIdFromToken(getStoredToken() ?? "")
    : null;

  const serverEnabled = (() => {
    if (!tenantId) return null;
    const tenant = tenants?.find((t) => String(t._id) === String(tenantId));
    const features = tenant?.enabledFeatures?.length ? tenant.enabledFeatures : [...ALL_FEATURES];
    return new Set<FeatureKey>(features);
  })();

  const enabled = dirty ? localEnabled : serverEnabled;

  const toggle = (feature: FeatureKey) => {
    if (!enabled) return;
    if (!dirty) {
      setLocalEnabled(new Set(enabled));
      setDirty(true);
    }
    const nextState = !enabled.has(feature);
    const result = checkDependencies(enabled, feature, nextState);
    if (result.requiresWarning) {
      setPendingToggle({ feature, nextState, ...result });
    } else {
      applyToggle(feature, nextState, [], []);
    }
  };

  const applyToggle = (
    feature: FeatureKey,
    nextState: boolean,
    willAlsoDisable: FeatureKey[],
    willAlsoEnable: FeatureKey[]
  ) => {
    setLocalEnabled((prev) => {
      const next = new Set(prev);
      nextState ? next.add(feature) : next.delete(feature);
      willAlsoDisable.forEach((f) => next.delete(f));
      willAlsoEnable.forEach((f) => next.add(f));
      return next;
    });
    setDirty(true);
  };

  const handleConfirm = () => {
    if (!pendingToggle) return;
    const { feature, nextState, willAlsoDisable, willAlsoEnable } = pendingToggle;
    applyToggle(feature, nextState, willAlsoDisable, willAlsoEnable);
    setPendingToggle(null);
  };

  const handleCancel = () => {
    setPendingToggle(null);
  };

  const save = () => {
    if (!enabled) return;
    const error = validateFeatureSet(enabled, (key) =>
      t(`settings.features.featureMeta.${key}.label`),
    );
    if (error) {
      toast.error(error);
      return;
    }
    updateFeatures.mutate([...enabled], {
      onSuccess: () => {
        toast.success(t("settings.features.saved"));
        setDirty(false);
        setLocalEnabled(null);
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? t("settings.features.updateFailed")),
    });
  };

  if (isError) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      t("settings.features.loadError");
    return (
      <p className="text-sm text-destructive" role="alert">
        {message}
      </p>
    );
  }

  if (!tenantId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("settings.features.noTenant")}
      </p>
    );
  }

  const featureMetaForDialog: Record<FeatureKey, { label: string }> = Object.fromEntries(
    ALL_FEATURES.map((key) => [key, { label: t(`settings.features.featureMeta.${key}.label`) }]),
  ) as Record<FeatureKey, { label: string }>;

  if (isLoading || enabled === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.features.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.features.subtitle")}
        </p>
      </div>
      <Separator />

      <div className="space-y-4">
        {ALL_FEATURES.map((feature) => {
          const Icon = FEATURE_ICONS[feature];
          return (
            <div key={feature} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t(`settings.features.featureMeta.${feature}.label`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`settings.features.featureMeta.${feature}.description`)}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled.has(feature)}
                onCheckedChange={() => toggle(feature)}
                className="cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      <Button
        onClick={save}
        disabled={!dirty || updateFeatures.isPending}
        className="cursor-pointer"
      >
        {updateFeatures.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("settings.features.save")}
      </Button>

      <DependencyWarningDialog
        open={pendingToggle !== null}
        pending={pendingToggle}
        featureMeta={featureMetaForDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
