"use client"

import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";

export type NavItem = {
  title: string
  url: string
  icon?: Icon
}

export type NavSection = {
  label?: string
  items: NavItem[]
}

export function NavMain({
  items,
  sections,
}: {
  items?: NavItem[]
  sections?: NavSection[]
}) {
  // Support both flat items (legacy) and grouped sections
  const navSections: NavSection[] = sections ?? (items ? [{ items }] : []);

  return (
    <>
      {navSections.map((section, idx) => (
        <SidebarGroup key={idx}>
          {section.label && (
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {section.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
