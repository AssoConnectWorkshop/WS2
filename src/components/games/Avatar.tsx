import type { Candidate } from "./types";

export default function Avatar({
  candidate,
  size = "md",
}: {
  candidate: Candidate;
  size?: "sm" | "md" | "lg";
}) {
  const initials = `${candidate.firstName?.[0] ?? "?"}${candidate.lastName?.[0] ?? ""}`.toUpperCase();
  const cls =
    size === "sm" ? "w-10 h-10 text-sm" : size === "lg" ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg";
  return candidate.picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidate.picture}
      alt={`${candidate.firstName} ${candidate.lastName}`}
      className={`${cls} rounded-full object-cover border-2 border-white shadow flex-shrink-0`}
    />
  ) : (
    <div
      className={`${cls} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-white shadow`}
    >
      {initials}
    </div>
  );
}
