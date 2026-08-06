import { hash } from "./hash";

export const AVATAR_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#009688",
  "#f57c00",
] as const;

export function getUserAvatarColor(name: string): string {
  return AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];
}
