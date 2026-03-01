"use client"

import * as React from "react"
import {
  IconBox,
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
  IconUsers
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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

const data = {
  user: {
    name: "Toby Belhome",
    email: "m@example.com",
    avatar: "https://www.tobybelhome.com/toby-belhome.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconListDetails,
    },
    {
      title: "Blogs",
      url: "/dashboard/blogs",
      icon: IconNews,
    },
    {
      title: "Category Products",
      url: "/dashboard/category-products",
      icon: IconCategory,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: IconBox,
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: IconCalendar,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: IconCreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconChartBar,
    },
    {
      title: "Login",
      url: "/login",
      icon: IconFolder,
    },
    {
      title: "Register",
      url: "/register",
      icon: IconUsers,
    },
    {
      title: "404 Page",
      url: "/404-page",
      icon: IconFolder,
    },
    {
      title: "500 Page",
      url: "/500-page",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Get Pro",
      url: "https://shadcnuikit.com/pricing",
      icon: IconCircle,
    },
    {
      title: "Shadcn UI Kit",
      url: "https://shadcnuikit.com/",
      icon: IconCircle,
    },
    {
      title: "Bundui Component",
      url: "https://bundui.io",
      icon: IconCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" forceDesktop {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="https://shadcnuikit.com/logo.png" className="size-6 rounded-sm group-data-[collapsible=icon]:size-5" alt="shadcn ui kit svg logo" />
                <span className="text-base font-medium">CMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
