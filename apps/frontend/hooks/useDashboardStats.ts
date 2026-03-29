import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axiosClient";

export interface DashboardStats {
  totalUsers: number;
  newTodayUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  systemStatus: "healthy" | "degraded" | "down";
  generatedAt: string;
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get<DashboardStats>("/users/stats/dashboard");
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
