"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useDeleteApiKey } from "@/hooks/useApiKeys";
import type { CreatedApiKey } from "@/types/api-key.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus, IconTrash, IconBan, IconCopy, IconCheck, IconKey } from "@tabler/icons-react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(64),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      aria-label="Copy API key"
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
    </button>
  );
}

export default function ApiKeysPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState<CreatedApiKey | null>(null);

  const { data: keys = [], isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const deleteMutation = useDeleteApiKey();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { name: data.name, expiresAt: data.expiresAt || undefined },
      {
        onSuccess: (created) => {
          setNewKey(created);
          reset();
          setIsAdding(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create API key"),
      }
    );
  };

  const handleRevoke = (id: string) => {
    revokeMutation.mutate(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to revoke"),
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("API key deleted"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create API keys to allow external systems to connect and exchange data with your organization.
        </p>
      </div>

      {/* One-time key reveal */}
      {newKey && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-800 dark:text-green-300 flex items-center gap-2">
              <IconKey size={16} />
              API key created — save it now
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-400">
              This key will not be shown again. Copy it and store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 bg-white dark:bg-black/30 border border-green-200 dark:border-green-700 rounded-md px-3 py-2 font-mono text-sm break-all">
              <span className="flex-1">{newKey.plainKey}</span>
              <CopyButton value={newKey.plainKey} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 cursor-pointer"
              onClick={() => setNewKey(null)}
            >
              I&apos;ve saved it
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Keys</CardTitle>
          <CardDescription>
            Use the <code className="text-xs bg-muted px-1 py-0.5 rounded">x-api-key</code> header to authenticate external requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No API keys yet.</p>
          ) : (
            keys.map((key) => (
              <div key={key._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{key.name}</span>
                    <Badge
                      className={
                        key.isActive
                          ? "text-xs bg-green-100 text-green-700 border-green-200"
                          : "text-xs bg-gray-100 text-gray-500 border-gray-200"
                      }
                    >
                      {key.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {key.keyPrefix}••••••••
                    {key.lastUsedAt && (
                      <span className="ml-2 font-sans">
                        Last used {format(new Date(key.lastUsedAt), "MMM d, yyyy")}
                      </span>
                    )}
                    {key.expiresAt && (
                      <span className="ml-2 font-sans">
                        Expires {format(new Date(key.expiresAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {key.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-yellow-600 hover:text-yellow-700 cursor-pointer"
                      onClick={() => handleRevoke(key._id)}
                      disabled={revokeMutation.isPending}
                      aria-label="Revoke API key"
                    >
                      <IconBan size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                    onClick={() => handleDelete(key._id)}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete API key"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create form */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key name *</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Production Integration" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry date (optional)</Label>
                <Input id="expiresAt" type="date" {...register("expiresAt")} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending} className="cursor-pointer">
                  {createMutation.isPending ? "Creating..." : "Create Key"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => { reset(); setIsAdding(false); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="cursor-pointer">
          <IconPlus size={16} className="mr-2" />
          Create API Key
        </Button>
      )}
    </div>
  );
}
