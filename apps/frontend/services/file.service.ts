import axiosClient from "@/api/axiosClient";
import type { FileUploadResponse, FileUploadResult } from "@/api/types";
import type { MediaProviderId } from "@/types/media.type";
import { buildMediaUrl } from "@/lib/media-url";
import { compressImageFileIfNeeded } from "@/lib/compress-upload-image";

export type UploadPhase = "compressing" | "uploading";

export interface UploadFileOptions {
  onPhase?: (phase: UploadPhase) => void;
  /** 0–100 while uploading */
  onUploadProgress?: (percent: number) => void;
}

export const fileService = {
  /**
   * Upload file via media API (MinIO or local provider).
   */
  uploadFile: async (
    file: File,
    provider: MediaProviderId = "minio",
    options?: UploadFileOptions,
  ): Promise<FileUploadResult> => {
    options?.onPhase?.("compressing");
    const toUpload = await compressImageFileIfNeeded(file);
    options?.onPhase?.("uploading");
    options?.onUploadProgress?.(0);

    const formData = new FormData();
    formData.append("file", toUpload);

    const response = await axiosClient.post<FileUploadResponse>(
      `/media/file?provider=${encodeURIComponent(provider)}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (ev) => {
          const total = ev.total;
          if (total && total > 0) {
            const pct = Math.min(100, Math.round((ev.loaded * 100) / total));
            options?.onUploadProgress?.(pct);
          }
        },
      },
    );

    const originalUrl = response.data.url;
    const fullUrl = buildMediaUrl(originalUrl);

    return {
      url: fullUrl,
      originalUrl,
    };
  },

  uploadFiles: async (
    files: File[],
    provider: MediaProviderId = "minio",
  ): Promise<FileUploadResult[]> => {
    const uploadPromises = files.map((file) =>
      fileService.uploadFile(file, provider),
    );
    return Promise.all(uploadPromises);
  },
};
