"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fileService } from "@/services/file.service";
import type { FileUploadResult } from "@/api/types";
import type { MediaProviderId } from "@/types/media.type";
import { MEDIA_QUERY_KEY } from "@/hooks/useMedia";

export const FILE_UPLOAD_MUTATION_KEY = "fileUpload";
export const FILES_UPLOAD_MUTATION_KEY = "filesUpload";

export type FileUploadPhase = "idle" | "compressing" | "uploading";

interface UseFileUploadOptions {
  onSuccess?: (data: FileUploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseFilesUploadOptions {
  onSuccess?: (data: FileUploadResult[]) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<FileUploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationKey: [FILE_UPLOAD_MUTATION_KEY],
    mutationFn: ({
      file,
      provider = "minio",
    }: {
      file: File;
      provider?: MediaProviderId;
    }) =>
      fileService.uploadFile(file, provider, {
        onPhase: (p) => setPhase(p),
        onUploadProgress: setUploadProgress,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] });
      onSuccess?.(data);
    },
    onError,
    onSettled: () => {
      setPhase("idle");
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    phase,
    uploadProgress,
  };
}

export function useFilesUpload(options: UseFilesUploadOptions = {}) {
  const { onSuccess, onError } = options;

  return useMutation({
    mutationKey: [FILES_UPLOAD_MUTATION_KEY],
    mutationFn: ({
      files,
      provider = "minio",
    }: {
      files: File[];
      provider?: MediaProviderId;
    }) => fileService.uploadFiles(files, provider),
    onSuccess,
    onError,
  });
}
