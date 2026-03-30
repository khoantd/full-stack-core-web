"use client"

import * as React from "react"
import {
  IconBox,
  IconBuilding,
  IconCalendar,
  IconCamera,
  IconCategory,
  IconChartBar,
  IconCircle,
  IconCreditCard,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconListDetails,
  IconNews,
  IconUsers,
  IconCar,
  IconPhoto,
  IconClipboardList,
  IconBriefcase,
  IconChevronDown,
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
import { getStoredToken } from "@/api/axiosClient"
import { getTenantIdFromToken } from "@/lib/jwt"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Users", url: "/dashboard/users", icon: IconListDetails },
  { title: "Blogs", url: "/dashboard/blogs", icon: IconNews },
  { title: "Services", url: "/dashboard/services", icon: IconBriefcase },
  { title: "Category Products", url: "/dashboard/category-products", icon: IconCategory },
  { title: "Products", url: "/dashboard/products", icon: IconBox },
  { title: "Events", url: "/dashboard/events", icon: IconCalendar },
  { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
  { title: "Automakers", url: "/dashboard/automakers", icon: IconCar },
  { title: "Media Library", url: "/dashboard/media", icon: IconPhoto },
  { title: "Audit Log", url: "/dashboard/audit-logs", icon: IconClipboardList },
  { title: "Settings", url: "/dashboard/settings", icon: IconChartBar },
];

const defaultUser = {
  name: "User",
  email: "",
  avatar: "",
};

function TenantSwitcher() {
  const { data: tenants } = useTenants();
  const [currentTenantId, setCurrentTenantId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setCurrentTenantId(getTenantIdFromToken(token));
  }, []);

  const currentTenant = tenants?.find((t) => t._id === currentTenantId);
  const displayName = currentTenant?.name ?? "Organization";

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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={defaultUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
