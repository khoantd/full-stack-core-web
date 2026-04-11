"use client";

import { useSyncExternalStore } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

/**
 * Chỉ render Sidebar/Provider sau khi đã mount trên client.
 * Tránh hydration error khi browser extension (vd: Screen Recorder) sửa DOM.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Server và client đầu tiên đều render loading - tránh hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center" suppressHydrationWarning>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 md:gap-6 p-4 lg:p-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
