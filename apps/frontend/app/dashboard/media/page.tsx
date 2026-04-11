"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Search, Upload, Trash2, Copy, Image, FileText, Video, File, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaFiles, useDeleteMediaFile, useMediaProviders } from "@/hooks/useMedia";
import { useFileUpload } from "@/hooks/useFileUpload";
import { buildFullUrl } from "@/lib/api/media.api";
import type { MediaFile, MediaProviderId } from "@/types/media.type";
import { formatDistanceToNow } from "date-fns";
import NextImage from "next/image";

const PAGE_SIZE = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
  if (contentType.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />;
  if (contentType.startsWith("application/pdf")) return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [provider, setProvider] = useState<MediaProviderId>("minio");
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: providersData, isLoading: providersLoading } = useMediaProviders();

  useEffect(() => {
    const enabled = providersData?.providers.filter(p => p.enabled) ?? [];
    if (enabled.length === 0) return;
    setProvider(current => (enabled.some(p => p.id === current) ? current : enabled[0].id));
  }, [providersData]);

  const currentToken = cursorHistory[currentIndex];

  const { data, isLoading, isError } = useMediaFiles({
    type: type !== "all" ? type : undefined,
    limit: PAGE_SIZE,
    continuationToken: currentToken,
    provider,
  });

  const deleteMutation = useDeleteMediaFile();
  const uploadMutation = useFileUpload({
    onSuccess: () => {
      toast.success("File uploaded");
      setCursorHistory([undefined]);
      setCurrentIndex(0);
    },
    onError: () => toast.error("Upload failed"),
  });
  const { phase: uploadPhase, uploadProgress } = uploadMutation;

  const enabledProviders = providersData?.providers.filter(p => p.enabled) ?? [];

  const files = (data?.data ?? []).filter(f =>
    !search || f.key.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTypeChange = (value: string) => {
    setType(value);
    setCursorHistory([undefined]);
    setCurrentIndex(0);
  };

  const handleProviderChange = (next: MediaProviderId) => {
    setProvider(next);
    setCursorHistory([undefined]);
    setCurrentIndex(0);
  };

  const handleNextPage = () => {
    if (!data?.nextContinuationToken) return;
    const nextHistory = cursorHistory.slice(0, currentIndex + 1);
    nextHistory.push(data.nextContinuationToken);
    setCursorHistory(nextHistory);
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrevPage = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, provider });
    e.target.value = "";
  };

  const handleCopy = (file: MediaFile) => {
    const url = buildFullUrl(file.url);
    void navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ key: deleteTarget.key, provider });
      toast.success("File deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const hasPrev = currentIndex > 0;
  const hasNext = data?.isTruncated && !!data?.nextContinuationToken;

  const providerLabel =
    enabledProviders.find(p => p.id === provider)?.label ?? provider;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Browse and manage uploaded files. Copy image URLs for use in blog posts.
          </p>
          {enabledProviders.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Storage: <span className="font-medium text-foreground">{providerLabel}</span>
            </p>
          )}
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending || enabledProviders.length === 0}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending
            ? uploadPhase === "compressing"
              ? "Preparing…"
              : "Uploading…"
            : "Upload File"}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

      {uploadMutation.isPending && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          {uploadPhase === "compressing" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>Preparing file…</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading</span>
                <span className="tabular-nums text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </>
          )}
        </div>
      )}

      {enabledProviders.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {enabledProviders.map(p => (
            <Button
              key={p.id}
              type="button"
              variant={provider === p.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleProviderChange(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {providersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          ) : enabledProviders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No media storage providers are enabled. Configure MEDIA_PROVIDER_MINIO_ENABLED or
              MEDIA_PROVIDER_LOCAL_ENABLED on the server.
            </p>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          ) : isError ? (
            <p className="text-center text-destructive py-8">Failed to load media files</p>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">No files found</p>
              <Button
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />Upload your first file
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map(file => {
                  const fullUrl = buildFullUrl(file.url);
                  const isImage = file.contentType.startsWith("image/");
                  const name = file.key.split("/").pop() ?? file.key;

                  return (
                    <div key={file.key} className="group relative rounded-lg border bg-muted/30 overflow-hidden hover:border-primary transition-colors cursor-pointer">
                      <div className="relative aspect-square w-full bg-muted/50">
                        {isImage ? (
                          <NextImage
                            src={fullUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileIcon contentType={file.contentType} />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" title={name}>{name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(file.lastModified), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7"
                          onClick={() => handleCopy(file)}
                          title="Copy URL"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7"
                          onClick={() => setDeleteTarget(file)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(hasPrev || hasNext) && (
                <div className="flex items-center justify-between border-t pt-4 mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {currentIndex + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!hasPrev}>
                      <ChevronLeft className="h-4 w-4 mr-1" />Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasNext}>
                      Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.key.split("/").pop()}&quot;? This cannot be undone and all references will be broken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
