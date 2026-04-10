"use client"

import * as React from "react"
import {
  IconBox,
  IconBuilding,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconDashboard,
  IconListDetails,
  IconNews,
  IconPhoto,
  IconBriefcase,
  IconChevronDown,
  IconCar,
  IconTag,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTenants } from "@/hooks/useTenant"
import { getStoredToken, setStoredTokens } from "@/api/axiosClient"
import { getTenantIdFromToken, getUserFromToken } from "@/lib/jwt"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import type { FeatureKey } from "@/types/tenant.type"
import type { Icon } from "@tabler/icons-react"
import { tenantService } from "@/services/tenant.service"
import { syncAuthSessionCookies } from "@/lib/auth-cookies"
import { useQueryClient } from "@tanstack/react-query"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

function buildTenantUrl(tenantSlug: string): string {
  const slug = tenantSlug.trim().toLowerCase();
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const rootHostname = ROOT_DOMAIN.split(":")[0];
  const rootPort = ROOT_DOMAIN.includes(":") ? ROOT_DOMAIN.split(":")[1] : "";

  const local =
    rootHostname === "localhost" ||
    rootHostname.endsWith(".localhost") ||
    rootHostname.startsWith("127.");

  if (local) {
    const host = `${slug}.localhost${rootPort ? `:${rootPort}` : ""}`;
    return `${protocol}//${host}${window.location.pathname}${window.location.search}`;
  }

  return `${protocol}//${slug}.${ROOT_DOMAIN}${window.location.pathname}${window.location.search}`;
}

// Map feature keys to their nav items
const FEATURE_NAV_MAP: Record<FeatureKey, { title: string; url: string; icon: Icon }> = {
  blogs: { title: "Blogs", url: "/dashboard/blogs", icon: IconNews },
  services: { title: "Services", url: "/dashboard/services", icon: IconBriefcase },
  serviceCategories: { title: "Service Categories", url: "/dashboard/service-categories", icon: IconCategory },
  events: { title: "Events", url: "/dashboard/events", icon: IconCalendar },
  categories: { title: "Categories", url: "/dashboard/category-products", icon: IconCategory },
  products: { title: "Products", url: "/dashboard/products", icon: IconBox },
  automakers: { title: "Automakers", url: "/dashboard/automakers", icon: IconCar },
  payments: { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
  pricings: { title: "Pricings", url: "/dashboard/pricings", icon: IconTag },
};

function useCurrentUser() {
  const [user, setUser] = React.useState({ name: "User", email: "", avatar: "" });

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const payload = getUserFromToken(token);
      if (payload) {
        setUser({
          name: payload.name || payload.email || "User",
          email: payload.email || "",
          avatar: payload.image || payload.avatar || "",
        });
      }
    }
  }, []);

  return user;
}

function TenantSwitcher() {
  const { data: tenants } = useTenants();
  const [currentTenantId, setCurrentTenantId] = React.useState<string | null>(null);
  const [isSwitching, setIsSwitching] = React.useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setCurrentTenantId(getTenantIdFromToken(token));
  }, []);

  const currentTenant = tenants?.find((t) => t._id === currentTenantId);
  const displayName = currentTenant?.name ?? "Organization";

  const onSwitchTenant = React.useCallback(
    async (tenantId: string) => {
      if (!tenantId || tenantId === currentTenantId) return;
      const target = tenants?.find((t) => t._id === tenantId);
      if (!target) return;

      setIsSwitching(true);
      try {
        const res = await tenantService.switchMyTenant(tenantId);
        if (res?.accessToken && res?.refreshToken) {
          setStoredTokens(res.accessToken, res.refreshToken);
          syncAuthSessionCookies(res.accessToken, res.refreshToken);
          setCurrentTenantId(getTenantIdFromToken(res.accessToken));
        }

        // Prevent cross-tenant cache bleed after switching.
        queryClient.clear();

        if (target.slug && typeof window !== "undefined") {
          window.location.href = buildTenantUrl(target.slug);
        } else if (typeof window !== "undefined") {
          window.location.reload();
        }
      } finally {
        setIsSwitching(false);
      }
    },
    [currentTenantId, tenants, queryClient],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground shrink-0">
            <IconBuilding className="size-3.5" />
          </div>
          <span className="text-sm font-medium truncate">{displayName}</span>
          <IconChevronDown className="ml-auto size-3.5 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="min-w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants?.map((tenant) => (
          <DropdownMenuItem
            key={tenant._id}
            disabled={isSwitching}
            onSelect={() => onSwitchTenant(tenant._id)}
            className={`cursor-pointer ${tenant._id === currentTenantId ? "bg-accent" : ""}`}
          >
            <IconBuilding className="mr-2 size-4 shrink-0" />
            <span className="truncate">{tenant.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/organization" className="cursor-pointer">
            <IconBuilding className="mr-2 size-4" />
            Manage Organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useCurrentUser();
  const { data: tenants } = useTenants();
  const [currentTenantId, setCurrentTenantId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setCurrentTenantId(getTenantIdFromToken(token));
  }, []);

  const enabledFeatures = React.useMemo(() => {
    const tenant = tenants?.find((t) => t._id === currentTenantId);
    const features = tenant?.enabledFeatures;
    // Fall back to all features if not set (existing tenants before migration)
    return new Set<FeatureKey>(features?.length ? features : Object.keys(FEATURE_NAV_MAP) as FeatureKey[]);
  }, [tenants, currentTenantId]);

  const navSections = React.useMemo(() => [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
        { title: "Users", url: "/dashboard/users", icon: IconListDetails },
      ],
    },
    {
      label: "Content",
      items: [
        ...(enabledFeatures.has("blogs") ? [FEATURE_NAV_MAP.blogs] : []),
        ...(enabledFeatures.has("services") ? [FEATURE_NAV_MAP.services] : []),
        ...(enabledFeatures.has("serviceCategories") ? [FEATURE_NAV_MAP.serviceCategories] : []),
        ...(enabledFeatures.has("events") ? [FEATURE_NAV_MAP.events] : []),
        { title: "Media Library", url: "/dashboard/media", icon: IconPhoto },
      ],
    },
    {
      label: "Catalog",
      items: [
        ...(enabledFeatures.has("pricings") ? [FEATURE_NAV_MAP.pricings] : []),
        ...(enabledFeatures.has("categories") ? [FEATURE_NAV_MAP.categories] : []),
        ...(enabledFeatures.has("products") ? [FEATURE_NAV_MAP.products] : []),
        ...(enabledFeatures.has("automakers") ? [FEATURE_NAV_MAP.automakers] : []),
      ],
    },
    {
      label: "Finance",
      items: [
        ...(enabledFeatures.has("payments") ? [FEATURE_NAV_MAP.payments] : []),
      ],
    },
    {
      label: "System",
      items: [
        { title: "Audit Log", url: "/dashboard/audit-logs", icon: IconClipboardList },
        { title: "Settings", url: "/dashboard/settings", icon: IconChartBar },
      ],
    },
  ].filter((section) => section.items.length > 0), [enabledFeatures]);

  return (
    <Sidebar collapsible="icon" forceDesktop {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TenantSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
