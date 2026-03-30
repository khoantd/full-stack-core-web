"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { User as UserIcon, Mail, Shield, Calendar, Key, CheckCircle2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/api/types";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailDialog({
  open,
  onOpenChange,
  user,
}: UserDetailDialogProps) {
  if (!user) return null;

  // Helper to get role name
  const getRoleName = (role: User["role"]): string => {
    if (!role) return "N/A";
    if (typeof role === "object" && role !== null) {
      return (role as { name?: string }).name || "N/A";
    }
    return role;
  };

  // Helper to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user ID for display
  const getUserId = (): string => {
    return user._id?.toString() || user.id?.toString() || "N/A";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết User</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của user trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name || "N/A"}</h3>
              <p className="text-sm text-muted-foreground">{user.email || "N/A"}</p>
              {user.status && (
                <Badge
                  variant="secondary"
                  className={
                    user.status === "active"
                      ? "bg-green-100 text-green-700"
                      : user.status === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {user.status}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Detail Items */}
          <div className="grid gap-4">
            <DetailItem
              icon={<Key className="h-4 w-4" />}
              label="ID"
              value={getUserId()}
            />

            <DetailItem
              icon={<UserIcon className="h-4 w-4" />}
              label="Tên"
              value={user.name || "N/A"}
            />

            <DetailItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email || "N/A"}
            />

            <DetailItem
              icon={<Shield className="h-4 w-4" />}
              label="Role"
              value={getRoleName(user.role)}
            />

            <DetailItem
              icon={
                user.securityConfirmed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )
              }
              label="Xác thực bảo mật"
              value={
                <Badge variant={user.securityConfirmed ? "default" : "secondary"}>
                  {user.securityConfirmed ? "Đã xác thực" : "Chưa xác thực"}
                </Badge>
              }
            />

            {user.uid && (
              <DetailItem
                icon={<Key className="h-4 w-4" />}
                label="UID"
                value={user.uid}
              />
            )}

            {user.country && (
              <DetailItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Quốc gia"
                value={user.country}
              />
            )}

            {user.plan_name && (
              <DetailItem
                icon={<Shield className="h-4 w-4" />}
                label="Gói dịch vụ"
                value={user.plan_name}
              />
            )}

            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
            />

            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Cập nhật lần cuối"
              value={formatDate(user.updatedAt)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for detail items
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
