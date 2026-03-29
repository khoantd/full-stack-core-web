import React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatOverlay } from "@/components/ChatOverlay";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
      <ChatOverlay />
    </ProtectedRoute>
  );
}
