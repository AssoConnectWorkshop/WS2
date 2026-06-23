"use client";

import { QRCodeSVG } from "qrcode.react";

export default function VoteQRCode({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <QRCodeSVG value={url} size={160} bgColor="#ffffff" fgColor="#3730a3" level="M" />
      <p className="text-xs text-gray-400 text-center">Scanner pour voter</p>
    </div>
  );
}
