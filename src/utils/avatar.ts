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

const AVATAR_IMAGES = [
  require("../../assets/images/avatars/bloub-hexagone-attentif-bleu.png"),
  require("../../assets/images/avatars/bloub-cercle-heureux-vert.png"),
  require("../../assets/images/avatars/bloub-galet-confus-rose.png"),
  require("../../assets/images/avatars/bloub-nuage-somnolent-bleu.png"),
  require("../../assets/images/avatars/bloub-goutte-effraye-violet.png"),
  require("../../assets/images/avatars/bloub-squircle-hilare-ambre.png"),
  require("../../assets/images/avatars/bloub-nuage-triste-bleu.png"),
  require("../../assets/images/avatars/bloub-triangle-blase-gris.png"),
  require("../../assets/images/avatars/bloub-galet-mefiant-brun.png"),
  require("../../assets/images/avatars/bloub-capsule-excite-rouge.png"),
] as const;

export function getUserAvatarColor(name: string): string {
  return AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];
}

export function getUserAvatarImage(name: string) {
  return AVATAR_IMAGES[hash(name) % AVATAR_IMAGES.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
