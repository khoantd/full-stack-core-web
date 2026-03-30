import { LoginForm } from "@/components/LoginForm";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Sign in",
    description: "Sign in to your account to access the dashboard.",
  });
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left panel — cover image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <img
          src="/images/cover.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Overlay with branding */}
        <div className="absolute inset-0 bg-slate-900/60 flex flex-col justify-between px-12 py-14 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">YourApp</span>
          </div>

          <div className="space-y-3">
            <blockquote className="text-xl font-medium leading-snug max-w-sm">
              "The platform that keeps our entire team aligned and moving fast."
            </blockquote>
            <p className="text-sm text-white/70">— A happy customer</p>
          </div>

          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} YourApp. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
