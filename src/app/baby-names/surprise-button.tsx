"use client";

import { useRouter } from "next/navigation";

export default function SurpriseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="border rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50"
    >
      🎲 Une autre idée
    </button>
  );
}
