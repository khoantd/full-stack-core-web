const DEFAULT_MAX_BYTES = 15 * 1024 * 1024;
const ABSOLUTE_CAP_BYTES = 100 * 1024 * 1024;

/** Multer options for dashboard media uploads (single file). */
export function getMediaMulterOptions(): { limits: { fileSize: number } } {
  const parsed = parseInt(process.env.MEDIA_MAX_UPLOAD_BYTES || String(DEFAULT_MAX_BYTES), 10);
  const fileSize =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, ABSOLUTE_CAP_BYTES) : DEFAULT_MAX_BYTES;
  return { limits: { fileSize } };
}
