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

const FEATURE_META: Record<FeatureKey, { label: string; description: string; icon: React.ElementType }> = {
  categories: { label: "Categories", description: "Manage product categories and hierarchies.", icon: IconCategory },
  products: { label: "Products", description: "Product catalog with inventory management.", icon: IconBox },
  automakers: { label: "Automakers", description: "Vehicle brands and manufacturer data.", icon: IconCar },
  events: { label: "Events", description: "Create and manage events and schedules.", icon: IconCalendar },
  services: { label: "Services", description: "Service listings and offerings.", icon: IconBriefcase },
  serviceCategories: { label: "Service Categories", description: "Organize services into categories.", icon: IconCategory },
  blogs: { label: "Blogs", description: "Blog posts and content publishing.", icon: IconNews },
  payments: { label: "Payments", description: "Payment processing and transaction history.", icon: IconCreditCard },
};

export default function FeaturesPage() {
  const { data: tenants, isLoading, isError, error } = useTenants();
  const updateFeatures = useUpdateTenantFeatures();
  const [enabled, setEnabled] = useState<Set<FeatureKey> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);

  // Resolve current tenant from JWT
  const tenantId = typeof window !== "undefined"
    ? getTenantIdFromToken(getStoredToken() ?? "")
    : null;

  // Sync from server once on load (and after save resets dirty).
  // If the current org is not in GET /tenants (e.g. ID format mismatch), still initialize
  // from defaults so the page is usable; PATCH /tenants/my/features uses JWT tenantId.
  useEffect(() => {
    if (tenants === undefined || dirty) return;
    if (!tenantId) {
      setEnabled(null);
      return;
    }
    const tenant = tenants.find((t) => String(t._id) === String(tenantId));
    const features = tenant?.enabledFeatures?.length
      ? tenant.enabledFeatures
      : [...ALL_FEATURES];
    setEnabled(new Set(features));
  }, [tenants, tenantId, dirty]);

  const toggle = (feature: FeatureKey) => {
    if (!enabled) return;
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
    setEnabled((prev) => {
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
    const error = validateFeatureSet(enabled, (key) => FEATURE_META[key].label);
    if (error) {
      toast.error(error);
      return;
    }
    updateFeatures.mutate([...enabled], {
      onSuccess: () => {
        toast.success("Features updated");
        setDirty(false);
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? "Update failed"),
    });
  };

  if (isError) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Could not load tenants.";
    return (
      <p className="text-sm text-destructive" role="alert">
        {message}
      </p>
    );
  }

  if (!tenantId) {
    return (
      <p className="text-sm text-muted-foreground">
        No organization ID in your session. Sign out and sign in again so your account is linked to a tenant.
      </p>
    );
  }

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
        <h3 className="text-lg font-medium">Features</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable features for your organization. Disabled features are hidden from the sidebar.
        </p>
      </div>
      <Separator />

      <div className="space-y-4">
        {ALL_FEATURES.map((feature) => {
          const meta = FEATURE_META[feature];
          const Icon = meta.icon;
          return (
            <div key={feature} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.description}</p>
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
        Save Changes
      </Button>

      <DependencyWarningDialog
        open={pendingToggle !== null}
        pending={pendingToggle}
        featureMeta={FEATURE_META}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
