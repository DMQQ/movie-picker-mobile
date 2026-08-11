import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { authActions } from "../redux/auth/authSlice";
import { useToast } from "./Toast";
import useTranslation from "../service/useTranslation";

export default function SessionExpiredWatcher() {
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const t = useTranslation();
  const shown = useRef(false);

  useEffect(() => {
    if (!sessionExpired || shown.current) return;
    shown.current = true;

    const msg = t("auth.sessionExpired") as string;
    const message = msg && msg !== "auth.sessionExpired" ? msg : "Session expired, tap to sign in.";

    toast.show(message, {
      type: "error",
      duration: 30_000,
      onPress: () => {
        shown.current = false;
        dispatch(authActions.clearSessionExpired());
        router.push("/auth/login");
      },
      onDismiss: () => {
        shown.current = false;
        dispatch(authActions.clearSessionExpired());
      },
    });
  }, [sessionExpired, t, toast, dispatch]);

  return null;
}
