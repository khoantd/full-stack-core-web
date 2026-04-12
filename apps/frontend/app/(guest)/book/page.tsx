"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantSlugFromBrowser } from "@/lib/tenant-slug";
import { IconCheck } from "@tabler/icons-react";

const schema = z
  .object({
    title: z.string().optional(),
    startAt: z.string().min(1),
    endAt: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const s = new Date(data.startAt);
      const e = new Date(data.endAt);
      return e > s;
    },
    { path: ["endAt"] }
  );

type BookForm = z.infer<typeof schema>;

function localToIso(local: string): string {
  return new Date(local).toISOString();
}

function BookPageContent() {
  const t = useTranslations("pages.book");
  const tVal = useTranslations("pages.book.validation");
  const searchParams = useSearchParams();
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTenantSlug(getTenantSlugFromBrowser());
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      startAt: "",
      endAt: "",
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: BookForm) => {
    setErrorMsg(null);
    const slug = tenantSlug ?? getTenantSlugFromBrowser();
    if (!slug) {
      setErrorMsg(t("tenantMissing"));
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const body = {
      tenantSlug: slug,
      title: data.title?.trim() || undefined,
      startAt: localToIso(data.startAt),
      endAt: localToIso(data.endAt),
      customer: {
        name: data.name.trim(),
        email: data.email.trim(),
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      },
      notes: data.notes?.trim() || undefined,
    };

    const res = await fetch(`${apiUrl}/public/appointments/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = t("errorGeneric");
      try {
        const j = (await res.json()) as { message?: string | string[] };
        if (typeof j.message === "string") msg = j.message;
        else if (Array.isArray(j.message)) msg = j.message.join(", ");
      } catch {
        /* ignore */
      }
      setErrorMsg(msg);
      return;
    }

    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md border bg-card shadow-sm transition-colors">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <IconCheck className="text-primary h-6 w-6" />
            </div>
            <CardTitle>{t("successTitle")}</CardTitle>
            <CardDescription>{t("successDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setSubmitted(false);
                setErrorMsg(null);
              }}
            >
              {t("bookAnother")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!tenantSlug && (
            <p className="text-destructive mb-4 text-sm" role="alert">
              {t("tenantMissing")}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="book-start">{t("startLabel")}</Label>
                <Input id="book-start" type="datetime-local" {...register("startAt")} />
                {errors.startAt && (
                  <p className="text-destructive text-sm">{errors.startAt.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-end">{t("endLabel")}</Label>
                <Input id="book-end" type="datetime-local" {...register("endAt")} />
                {errors.endAt && (
                  <p className="text-destructive text-sm">{errors.endAt.message || tVal("endAfterStart")}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-title">{t("titleLabel")}</Label>
              <Input id="book-title" {...register("title")} placeholder={t("titlePlaceholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-name">{t("nameLabel")}</Label>
              <Input id="book-name" {...register("name")} autoComplete="name" />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-email">{t("emailLabel")}</Label>
              <Input id="book-email" type="email" {...register("email")} autoComplete="email" />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-phone">{t("phoneLabel")}</Label>
              <Input id="book-phone" type="tel" {...register("phone")} autoComplete="tel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-notes">{t("notesLabel")}</Label>
              <Textarea id="book-notes" {...register("notes")} placeholder={t("notesPlaceholder")} rows={3} />
            </div>

            {errorMsg && (
              <p className="text-destructive text-sm" role="alert">
                {errorMsg}
              </p>
            )}

            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting || !tenantSlug}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="bg-muted/30 flex min-h-screen items-center justify-center p-6" />}>
      <BookPageContent />
    </Suspense>
  );
}
