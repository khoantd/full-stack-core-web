"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Activity,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "neutral" | "down";
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : (
            value
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <Badge
            variant="outline"
            className={`mt-2 ${
              trend === "up"
                ? "border-green-200 text-green-600"
                : trend === "down"
                  ? "border-red-200 text-red-600"
                  : "border-gray-200 text-gray-600"
            }`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            System overview · Last 24 hours
            {stats?.generatedAt && (
              <span className="ml-2 text-xs opacity-60">
                Updated {new Date(stats.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          id="dashboard-refresh-btn"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* System status badge */}
      {stats && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">System status:</span>
          <Badge
            variant="outline"
            className={
              stats.systemStatus === "healthy"
                ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30"
                : "border-red-200 bg-red-50 text-red-700"
            }
          >
            <span
              className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                stats.systemStatus === "healthy" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {stats.systemStatus === "healthy" ? "All systems operational" : "Degraded"}
          </Badge>
        </div>
      )}

      {/* KPI widgets */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? "—"}
          description="All registered accounts"
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="New Today"
          value={stats?.newTodayUsers ?? "—"}
          description="Registered in last 24 h"
          icon={UserPlus}
          trend={stats ? (stats.newTodayUsers > 0 ? "up" : "neutral") : undefined}
          loading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers ?? "—"}
          description="Status = active"
          icon={UserCheck}
          loading={isLoading}
        />
        <StatCard
          title="Inactive / Locked"
          value={stats?.inactiveUsers ?? "—"}
          description="Deactivated accounts"
          icon={UserX}
          trend={stats ? (stats.inactiveUsers > 0 ? "down" : "neutral") : undefined}
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-1">
        <ChartAreaInteractive />
      </div>

      {/* Recent activity table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest records across the CMS</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
