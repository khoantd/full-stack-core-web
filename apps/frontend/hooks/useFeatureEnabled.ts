import { useMemo } from "react";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { useTenants } from "@/hooks/useTenant";
import type { FeatureKey } from "@/types/tenant.type";
import { ALL_FEATURES } from "@/types/tenant.type";

export function useFeatureEnabled(feature: FeatureKey): boolean {
  const { data: tenants } = useTenants();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? null;

  return useMemo(() => {
    if (!tenantId) return true; // don't block UI if session is missing tenant
    const tenant = tenants?.find((t) => String(t._id) === String(tenantId));
    const enabled = tenant?.enabledFeatures?.length ? tenant.enabledFeatures : [...ALL_FEATURES];
    return enabled.includes(feature);
  }, [tenantId, tenants, feature]);
}

