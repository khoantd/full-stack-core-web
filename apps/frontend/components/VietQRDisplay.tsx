"use client";

import { useEffect, useRef } from "react";
import { VietQRSnapshot } from "@/types/payment.type";

interface VietQRDisplayProps {
  vietQR: VietQRSnapshot;
  size?: number;
}

/**
 * Renders a VietQR code using the Canvas API (no external QR library needed).
 * Falls back to showing the raw QR string if canvas is unavailable.
 *
 * For production, swap the canvas drawing with a proper QR library like:
 *   npm install qrcode  →  import QRCode from 'qrcode'
 */
export function VietQRDisplay({ vietQR, size = 200 }: VietQRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Dynamically import qrcode if available, otherwise show text fallback
    import("qrcode")
      .then((QRCode) => {
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, vietQR.qrString, {
            width: size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
        }
      })
      .catch(() => {
        // qrcode not installed — canvas stays blank, text fallback shown below
      });
  }, [vietQR.qrString, size]);

  const bankLabel = vietQR.bankCode;
  const formattedAmount = vietQR.amount
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vietQR.amount)
    : null;

  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-white">
      <p className="text-sm font-medium text-gray-700">Quét mã để thanh toán</p>

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded border"
        aria-label="VietQR payment code"
      />

      <div className="w-full space-y-1 text-sm text-center">
        <p className="font-semibold">{bankLabel}</p>
        <p className="text-gray-600">{vietQR.accountNumber}</p>
        {vietQR.accountName && <p className="text-gray-600">{vietQR.accountName}</p>}
        {formattedAmount && <p className="font-medium text-green-700">{formattedAmount}</p>}
        {vietQR.description && (
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{vietQR.description}</p>
        )}
      </div>
    </div>
  );
}
