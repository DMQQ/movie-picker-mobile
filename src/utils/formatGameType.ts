export function formatGameType(raw: string | null): string {
  if (raw === "voter" || raw?.includes("voter")) return "games.type.voter";
  if (raw?.includes("/tv")) return "games.type.tv";
  if (raw?.includes("/movie")) return "games.type.movies";
  return "games.type.swipe";
}
