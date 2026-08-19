import { Platform, FlatList, View, StyleSheet } from "react-native";
import TextInput from "../../components/TextInput";

import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import UserInputModal from "../../components/UserInputModal";
import RemoteFavouritesList from "../../components/RemoteFavouritesList";
import LocalFavouritesList from "../../components/LocalFavouritesList";
import SegmentedControl from "../../components/SegmentedControl";
import MigrationBanner from "../../components/MigrationBanner";
import MigrationModal from "../../components/MigrationModal";
import { createGroup, loadFavorites } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useMigrationPrompt } from "../../hooks/useMigrationPrompt";
import { listsApi } from "../../redux/lists/listsApi";
import useTranslation from "../../service/useTranslation";
import { spacing } from "../../constants/design";
import { TourAttachStep } from "../../components/Tour/TourAttachStep";
import { TourProvider } from "../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../components/Tour/TourContext";
import TutorialTooltip from "../../components/TutorialTooltip";
import { useTutorialSeen } from "../../hooks/useTutorial";

export default function Favourites() {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const prevToken = useRef(token);
  const migration = useMigrationPrompt();

  const showSwitch = isFullAccount && migration.showBanner;

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const [localView, setLocalView] = useState(true);
  const listRef = useRef<FlatList>(null);

  const tourRef = useRef<TourRef>(null);
  const { seen, markSeen } = useTutorialSeen("tutorial_favourites_seen");

  const scrollToEnd = useCallback(
    () =>
      new Promise<void>((resolve) => {
        listRef.current?.scrollToEnd({ animated: true });
        setTimeout(resolve, 400);
      }),
    [],
  );

  const steps = useMemo<TourStep[]>(
    () => [
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.favourites.add.title") as string}
            description={t("tutorial.favourites.add.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.favourites.list.title") as string}
            description={t("tutorial.favourites.list.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.favourites.superLiked.title") as string}
            description={t("tutorial.favourites.superLiked.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
        before: () => scrollToEnd(),
      },
    ],
    [t, scrollToEnd],
  );

  useEffect(() => {
    if (seen === false) {
      const timer = setTimeout(() => tourRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [seen]);

  useEffect(() => {
    dispatch(loadFavorites());
  }, []);

  useEffect(() => {
    if (isFullAccount && !prevToken.current) {
      dispatch(listsApi.util.invalidateTags([{ type: "List", id: "ALL" }]));
    }
    prevToken.current = token;
  }, [token, dispatch]);

  useEffect(() => {
    if (params.scrollsToBottom) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [params.scrollsToBottom]);

  const handleCreateGroup = () => {
    if (!text) return;
    dispatch(createGroup(text.trim()));
    setModalVisible(false);
    setText("");
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const closeCreateModal = () => {
    setModalVisible(false);
    setText("");
  };

  return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen}>
      <SafeIOSContainer style={{ paddingBottom: 0 }}>
        <PageHeading
          title={t("favourites.title")}
          showBackButton={false}
          showRightIconButton
          rightIconName="plus"
          onRightIconPress={() => setModalVisible(true)}
          useSafeArea
          extraScreenPaddingTop={Platform.OS === "android" ? 0 : 0}
          rightIconTourIndex={0}
        />

        <TourAttachStep index={1} fill style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: spacing.screen, flex: 1 }}>
            {showSwitch && (
              <View style={styles.switchZone}>
                <MigrationBanner
                  counts={migration.counts}
                  isMigrating={migration.isMigrating}
                  onSync={migration.migrate}
                  onDismiss={migration.dismissBanner}
                />
                <SegmentedControl
                  options={[
                    { value: "local", label: t("favourites.switch.local") as string },
                    { value: "account", label: t("favourites.switch.account") as string },
                  ]}
                  value={localView ? "local" : "account"}
                  onChange={(v) => setLocalView(v === "local")}
                  style={styles.switchRow}
                />
              </View>
            )}

            {isFullAccount && (!showSwitch || !localView) ? (
              <RemoteFavouritesList
                listRef={listRef}
                tourStepIndex={2}
                topPadding={showSwitch ? 0 : undefined}
              />
            ) : (
              <LocalFavouritesList
                listRef={listRef}
                tourStepIndex={2}
                topPadding={showSwitch ? 0 : undefined}
              />
            )}
          </View>
        </TourAttachStep>

        <UserInputModal
          visible={isModalVisible}
          onDismiss={closeCreateModal}
          title={t("favourites.create.title")}
          dismissable
          actionsLayout="horizontal"
          actions={[
            {
              label: t("favourites.create.cancel"),
              onPress: closeCreateModal,
              mode: "outlined",
            },
            {
              label: t("favourites.create.create"),
              onPress: handleCreateGroup,
              mode: "contained",
            },
          ]}
        >
          <TextInput
            onSubmitEditing={handleCreateGroup}
            value={text}
            onChangeText={setText}
            label={t("favourites.create.name")}
          />
        </UserInputModal>

        <MigrationModal
          visible={migration.showModal}
          counts={migration.counts}
          isMigrating={migration.isMigrating}
          onSync={migration.migrate}
          onDismiss={migration.dismissModal}
        />
      </SafeIOSContainer>
    </TourProvider>
  );
}

const styles = StyleSheet.create({
  switchZone: {
    paddingTop: spacing.xl * 4,
  },
  switchRow: {
    marginBottom: spacing.md,
  },
});
