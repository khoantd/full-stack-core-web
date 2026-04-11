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
  IconHelp,
  IconMessageCircle,
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
import { Link } from "@/i18n/navigation";
import type { FeatureKey } from "@/types/tenant.type"
import type { Icon } from "@tabler/icons-react"
import { tenantService } from "@/services/tenant.service"
import { syncAuthSessionCookies } from "@/lib/auth-cookies"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl";

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

const FEATURE_NAV_DEF: Record<FeatureKey, { url: string; icon: Icon }> = {
  blogs: { url: "/dashboard/blogs", icon: IconNews },
  services: { url: "/dashboard/services", icon: IconBriefcase },
  serviceCategories: { url: "/dashboard/service-categories", icon: IconCategory },
  events: { url: "/dashboard/events", icon: IconCalendar },
  categories: { url: "/dashboard/category-products", icon: IconCategory },
  products: { url: "/dashboard/products", icon: IconBox },
  automakers: { url: "/dashboard/automakers", icon: IconCar },
  payments: { url: "/dashboard/payments", icon: IconCreditCard },
  pricings: { url: "/dashboard/pricings", icon: IconTag },
  faqs: { url: "/dashboard/faq-sections", icon: IconHelp },
  testimonials: { url: "/dashboard/testimonial-sections", icon: IconMessageCircle },
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
  const t = useTranslations();

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
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("nav.tenant.organizations")}
        </DropdownMenuLabel>
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
            {t("nav.tenant.manageOrganizations")}
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
  const t = useTranslations();

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setCurrentTenantId(getTenantIdFromToken(token));
  }, []);

  const enabledFeatures = React.useMemo(() => {
    const tenant = tenants?.find((t) => t._id === currentTenantId);
    const features = tenant?.enabledFeatures;
    // Fall back to all features if not set (existing tenants before migration)
    return new Set<FeatureKey>(features?.length ? features : (Object.keys(FEATURE_NAV_DEF) as FeatureKey[]));
  }, [tenants, currentTenantId]);

  const navSections = React.useMemo(
    () =>
      [
        {
          label: t("nav.sections.overview"),
          items: [
            { title: t("nav.items.dashboard"), url: "/dashboard", icon: IconDashboard },
            { title: t("nav.items.users"), url: "/dashboard/users", icon: IconListDetails },
          ],
        },
        {
          label: t("nav.sections.content"),
          items: [
            ...(enabledFeatures.has("blogs")
              ? [{ title: t("nav.items.blogs"), ...FEATURE_NAV_DEF.blogs }]
              : []),
            ...(enabledFeatures.has("services")
              ? [{ title: t("nav.items.services"), ...FEATURE_NAV_DEF.services }]
              : []),
            ...(enabledFeatures.has("serviceCategories")
              ? [
                  {
                    title: t("nav.items.serviceCategories"),
                    ...FEATURE_NAV_DEF.serviceCategories,
                  },
                ]
              : []),
            ...(enabledFeatures.has("events")
              ? [{ title: t("nav.items.events"), ...FEATURE_NAV_DEF.events }]
              : []),
            ...(enabledFeatures.has("faqs")
              ? [{ title: t("nav.items.faqs"), ...FEATURE_NAV_DEF.faqs }]
              : []),
            ...(enabledFeatures.has("testimonials")
              ? [{ title: t("nav.items.testimonials"), ...FEATURE_NAV_DEF.testimonials }]
              : []),
            { title: t("nav.items.mediaLibrary"), url: "/dashboard/media", icon: IconPhoto },
          ],
        },
        {
          label: t("nav.sections.catalog"),
          items: [
            ...(enabledFeatures.has("pricings")
              ? [{ title: t("nav.items.pricings"), ...FEATURE_NAV_DEF.pricings }]
              : []),
            ...(enabledFeatures.has("categories")
              ? [{ title: t("nav.items.categories"), ...FEATURE_NAV_DEF.categories }]
              : []),
            ...(enabledFeatures.has("products")
              ? [{ title: t("nav.items.products"), ...FEATURE_NAV_DEF.products }]
              : []),
            ...(enabledFeatures.has("automakers")
              ? [{ title: t("nav.items.automakers"), ...FEATURE_NAV_DEF.automakers }]
              : []),
          ],
        },
        {
          label: t("nav.sections.finance"),
          items: [
            ...(enabledFeatures.has("payments")
              ? [{ title: t("nav.items.payments"), ...FEATURE_NAV_DEF.payments }]
              : []),
          ],
        },
        {
          label: t("nav.sections.system"),
          items: [
            { title: t("nav.items.auditLog"), url: "/dashboard/audit-logs", icon: IconClipboardList },
            { title: t("nav.items.settings"), url: "/dashboard/settings", icon: IconChartBar },
          ],
        },
      ].filter((section) => section.items.length > 0),
    [enabledFeatures, t],
  );

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
