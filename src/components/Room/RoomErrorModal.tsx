import { memo, useCallback, useMemo } from "react";
import { router } from "expo-router";
import UserInputModal, { UserInputModalAction } from "../UserInputModal";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";

const RoomErrorModal = memo(() => {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const roomNotFound = useAppSelector((state) => state.room.roomNotFound);
  const joinError = useAppSelector((state) => state.room.joinError);

  const handleClose = useCallback(() => {
    dispatch(roomActions.setRoomNotFound(false));
    dispatch(roomActions.setJoinError(false));
    router.replace("/(tabs)");
  }, [dispatch]);

  const actions = useMemo<UserInputModalAction[]>(
    () => [{ label: t("dialogs.qr.close") as string, mode: "contained", onPress: handleClose }],
    [t, handleClose],
  );

  return (
    <UserInputModal
      visible={roomNotFound || joinError}
      title={t("dialogs.qr.error") as string}
      subtitle={t("dialogs.qr.error-desc") as string}
      actions={actions}
    />
  );
});

export default RoomErrorModal;
