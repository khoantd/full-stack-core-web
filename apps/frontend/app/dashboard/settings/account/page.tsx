"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import { getStoredToken } from "@/api/axiosClient";
import { getUserFromToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, CheckCircle2, KeyRound, User } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  uid?: string;
  role?: { _id: string; name: string } | string;
  status?: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const user = getUserFromToken(token);
      if (user?._id) setUserId(user._id);
    }

    axiosClient
      .get<UserProfile>("/users/me")
      .then((res) => {
        const data = res.data as any;
        // Handle both direct response and wrapped { data: ... }
        const user: UserProfile = data?.data ?? data;
        setProfile(user);
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        if (user._id) setUserId(user._id);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) return toast.error("User ID not found");
    setIsSavingProfile(true);
    try {
      await axiosClient.put(`/users/${userId}`, { name, email });
      setProfileSaved(true);
      toast.success("Profile updated successfully.");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) return toast.error("User ID not found");
    if (!newPassword) return toast.error("New password is required");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setIsSavingPassword(true);
    try {
      await axiosClient.put(`/users/${userId}`, { password: newPassword });
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleName =
    typeof profile?.role === "object" ? profile.role?.name : profile?.role;

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and password.
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription>Update your display name and email address.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {roleName && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="secondary" className="capitalize">{roleName}</Badge>
                {profile?.status && (
                  <Badge
                    variant={profile.status === "active" ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {profile.status}
                  </Badge>
                )}
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="account-name">Display Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-email">Email Address</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="max-w-sm"
            />
          </div>

          <div className="pt-1">
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              size="sm"
            >
              {isSavingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : profileSaved ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSavingProfile ? "Saving…" : profileSaved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>Set a new password for your account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="max-w-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="max-w-sm"
            />
          </div>

          <div className="pt-1">
            <Button
              onClick={handleChangePassword}
              disabled={isSavingPassword || !newPassword || !confirmPassword}
              size="sm"
              variant="outline"
            >
              {isSavingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : passwordSaved ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {isSavingPassword ? "Updating…" : passwordSaved ? "Updated!" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
