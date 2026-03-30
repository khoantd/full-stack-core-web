"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { GithubIcon, CheckCircle2 } from "lucide-react";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleOrgNameChange = (value: string) => {
    setOrganizationName(value);
    if (!slugEdited) {
      setOrganizationSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setOrganizationSlug(toSlug(value));
    setSlugEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!organizationName.trim()) {
      setError("Organization name is required.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name,
        email,
        password,
        organizationName: organizationName.trim(),
        organizationSlug: organizationSlug || toSlug(organizationName),
      });
      setRegistered(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Registration failed. Please try again.";
      setError(typeof message === "string" ? message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Account Created!</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            A verification link has been sent to{" "}
            <span className="font-medium text-foreground">{email}</span>. Please
            click the link to activate your account before logging in.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Awaiting admin approval? You will be notified once your account is activated.
        </p>
        <Button
          variant="outline"
          className="w-full max-w-xs"
          onClick={() => router.push("/login")}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              name="name"
              type="text"
              required
              className="mt-1 w-full"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="reg-email">Email address</Label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 w-full"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="reg-confirm-password">Confirm Password</Label>
            <Input
              id="reg-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 w-full"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium text-foreground">Organization</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="reg-org-name">Organization Name</Label>
                <Input
                  id="reg-org-name"
                  name="organizationName"
                  type="text"
                  required
                  className="mt-1 w-full"
                  placeholder="Acme Corp"
                  value={organizationName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="reg-org-slug">
                  Slug
                  <span className="ml-1 text-xs text-muted-foreground">(used in URLs)</span>
                </Label>
                <div className="mt-1 flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="select-none px-3 text-sm text-muted-foreground">app/</span>
                  <input
                    id="reg-org-slug"
                    name="organizationSlug"
                    type="text"
                    className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="acme-corp"
                    value={organizationSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-muted px-2 text-gray-500">or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full" disabled={isLoading}>
            <GithubIcon className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
