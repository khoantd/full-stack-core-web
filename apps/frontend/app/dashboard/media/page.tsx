"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Search, Upload, Trash2, Copy, Image, FileText, Video, File, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaFiles, useDeleteMediaFile } from "@/hooks/useMedia";
import { useFileUpload } from "@/hooks/useFileUpload";
import { buildFullUrl } from "@/lib/api/media.api";
import { MediaFile } from "@/types/media.type";
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
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  // Cursor history: index 0 = first page (no token), subsequent = continuation tokens
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentToken = cursorHistory[currentIndex];

  const { data, isLoading, isError } = useMediaFiles({
    type: type !== "all" ? type : undefined,
    limit: PAGE_SIZE,
    continuationToken: currentToken,
  });

  const deleteMutation = useDeleteMediaFile();
  const uploadMutation = useFileUpload({
    onSuccess: () => toast.success("File uploaded"),
    onError: () => toast.error("Upload failed"),
  });

  const files = (data?.data ?? []).filter(f =>
    !search || f.key.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTypeChange = (value: string) => {
    setType(value);
    // Reset pagination when filter changes
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
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  const handleCopy = (file: MediaFile) => {
    const url = buildFullUrl(file.url);
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.key);
      toast.success("File deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const hasPrev = currentIndex > 0;
  const hasNext = data?.isTruncated && !!data?.nextContinuationToken;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Browse and manage uploaded files</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? "Uploading..." : "Upload File"}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

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

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          ) : isError ? (
            <p className="text-center text-destructive py-8">Failed to load media files</p>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">No files found</p>
              <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
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
                      <div className="aspect-square flex items-center justify-center bg-muted/50">
                        {isImage ? (
                          <div className="relative w-full h-full">
                            <NextImage
                              src={fullUrl}
                              alt={name}
                              fill
                              className="object-cover"
                              sizes="200px"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <FileIcon contentType={file.contentType} />
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
