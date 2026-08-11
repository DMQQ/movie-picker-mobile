import type { ReactNode } from "react";
import { useAppSelector } from "../redux/store";

type GuardName = "authenticated" | "fullAccount" | "unauthenticated";

interface Props {
  guard: GuardName | GuardName[];
  extra?: boolean;
  else?: ReactNode;
  children: ReactNode;
}

export default function RoleGuard({ guard, extra, else: fallback = null, children }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  const guards = Array.isArray(guard) ? guard : [guard];

  const passed = guards.every((g) => {
    switch (g) {
      case "authenticated":
        return !!token && !!user;
      case "fullAccount":
        return !!token && !!user && user.provider !== "anonymous";
      case "unauthenticated":
        return !token || !user;
      default:
        return false;
    }
  });

  if (!passed || extra === false) return fallback;
  return children;
}
