import { RegisterForm } from "@/components/RegisterForm";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Create your account",
    description: "Sign up and create your organization workspace.",
  });
}

const features = [
  {
    title: "Multi-tenant workspaces",
    description: "Each organization gets its own isolated workspace with custom roles and permissions.",
  },
  {
    title: "Invite your team",
    description: "Bring your whole team on board and collaborate in real time.",
  },
  {
    title: "Secure by default",
    description: "JWT-based auth, rate limiting, and role-based access control out of the box.",
  },
];

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left panel — same cover image as login */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <img
          src="/images/cover.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Overlay with feature list */}
        <div className="absolute inset-0 bg-slate-900/65 flex flex-col justify-between px-12 py-14 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">YourApp</span>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight">
                Start building with your team today
              </h1>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Create your workspace in seconds. No credit card required.
              </p>
            </div>

            <ul className="space-y-5">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/30">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} YourApp. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-md space-y-2">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Set up your workspace in under a minute.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
