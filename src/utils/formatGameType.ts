export function formatGameType(raw: string | null): string {
  if (!raw) return "Swipe Game";
  if (raw === "voter" || raw.includes("voter")) return "Voter";
  if (raw.includes("/tv")) return "TV Shows";
  if (raw.includes("/movie")) return "Movies";
  return "Swipe Game";
}
