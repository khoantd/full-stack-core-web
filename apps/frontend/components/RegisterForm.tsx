"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { setStoredTokens } from "@/api/axiosClient";

// ── helpers ──────────────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

// ── icons (inline SVG, no emoji) ──────────────────────────────────────────────

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.05-3.37M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.423 5.307M3 3l18 18" />
    </svg>
  );

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// ── step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "border-2 border-primary bg-background text-primary"
                : "border-2 border-muted bg-background text-muted-foreground"
            }`}
          >
            {i < current ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 transition-colors duration-200 ${i < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── password field with toggle ────────────────────────────────────────────────

function PasswordInput({
  id, name, value, onChange, placeholder, autoComplete, disabled,
}: {
  id: string; name: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id} name={name} type={show ? "text" : "password"}
        autoComplete={autoComplete} required
        className="mt-1 w-full pr-10"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground cursor-pointer"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = account, 1 = organization
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

  const strength = passwordStrength(password);

  const handleOrgNameChange = (value: string) => {
    setOrganizationName(value);
    if (!slugEdited) setOrganizationSlug(toSlug(value));
  };

  const handleSlugChange = (value: string) => {
    setOrganizationSlug(toSlug(value));
    setSlugEdited(true);
  };

  // Step 0 → 1 validation
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setStep(1);
  };

  // Step 1 → submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!organizationName.trim()) { setError("Organization name is required."); return; }

    setIsLoading(true);
    try {
      const result = await authService.register({
        name, email, password,
        organizationName: organizationName.trim(),
        organizationSlug: organizationSlug || toSlug(organizationName),
      }) as any;

      // Auto-login: store tokens if returned by the API
      const accessToken = result?.accessToken ?? result?.access_token;
      const refreshToken = result?.refreshToken ?? result?.refresh_token;
      if (accessToken) {
        setStoredTokens(accessToken, refreshToken);
        if (typeof document !== "undefined") {
          document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
          if (refreshToken) {
            document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
          }
        }
        router.push("/dashboard");
        return;
      }

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

  // ── success state ──────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <CheckCircleIcon />
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-foreground">You're all set!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <Button className="mt-2 w-full max-w-xs" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  // ── step 0: account details ────────────────────────────────────────────────
  const stepAccount = (
    <form onSubmit={handleNextStep} className="space-y-4">
      <div>
        <Label htmlFor="reg-name">Full Name</Label>
        <Input
          id="reg-name" name="name" type="text" required
          className="mt-1 w-full" placeholder="Jane Smith"
          value={name} onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="reg-email">Work Email</Label>
        <Input
          id="reg-email" name="email" type="email" autoComplete="email" required
          className="mt-1 w-full" placeholder="jane@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="reg-password">Password</Label>
        <PasswordInput
          id="reg-password" name="password" autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password} onChange={setPassword} disabled={isLoading}
        />
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= strength.score ? strength.color : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Strength: <span className="font-medium text-foreground">{strength.label}</span>
            </p>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="reg-confirm-password">Confirm Password</Label>
        <PasswordInput
          id="reg-confirm-password" name="confirmPassword" autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword} onChange={setConfirmPassword} disabled={isLoading}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="mt-1 text-xs text-destructive">Passwords don't match</p>
        )}
      </div>

      <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
        Continue
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">or sign up with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" className="w-full cursor-pointer" disabled={isLoading}>
          <GoogleIcon />
          <span className="ml-2">Google</span>
        </Button>
        <Button type="button" variant="outline" className="w-full cursor-pointer" disabled={isLoading}>
          <GithubIcon />
          <span className="ml-2">GitHub</span>
        </Button>
      </div>
    </form>
  );

  // ── step 1: organization ───────────────────────────────────────────────────
  const stepOrg = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reg-org-name">Organization Name</Label>
        <Input
          id="reg-org-name" name="organizationName" type="text" required
          className="mt-1 w-full" placeholder="Acme Corp"
          value={organizationName}
          onChange={(e) => handleOrgNameChange(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This will be your workspace name visible to your team.
        </p>
      </div>
      <div>
        <Label htmlFor="reg-org-slug">
          URL Slug
        </Label>
        <div className="mt-1 flex items-center overflow-hidden rounded-md border border-input bg-muted/40 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow duration-150">
          <span className="select-none border-r border-input px-3 py-2 text-sm text-muted-foreground bg-muted/60">
            app/
          </span>
          <input
            id="reg-org-slug" name="organizationSlug" type="text"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="acme-corp"
            value={organizationSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button" variant="outline" className="flex-1 cursor-pointer"
          onClick={() => { setStep(0); setError(null); }}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      {/* Step indicator */}
      <div className="flex flex-col items-center gap-1">
        <StepIndicator current={step} total={2} />
        <p className="mt-2 text-xs text-muted-foreground">
          {step === 0 ? "Step 1 of 2 — Your account" : "Step 2 of 2 — Your organization"}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Steps */}
      <div className="transition-all duration-200">
        {step === 0 ? stepAccount : stepOrg}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
