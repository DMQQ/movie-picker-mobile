import { Platform, FlatList, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import UserInputModal from "../../components/UserInputModal";
import RemoteFavouritesList from "../../components/RemoteFavouritesList";
import LocalFavouritesList from "../../components/LocalFavouritesList";
import MigrationBanner from "../../components/MigrationBanner";
import MigrationModal from "../../components/MigrationModal";
import { createGroup, loadFavorites } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useMigrationPrompt } from "../../hooks/useMigrationPrompt";
import { listsApi } from "../../redux/lists/listsApi";
import useTranslation from "../../service/useTranslation";

export default function Favourites() {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const token = useAppSelector((s) => s.auth.token);
  const prevToken = useRef(token);
  const migration = useMigrationPrompt();

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(loadFavorites());
  }, []);

  useEffect(() => {
    if (token && !prevToken.current) {
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
    <SafeIOSContainer style={{ paddingBottom: 0 }}>
      <PageHeading
        title={t("favourites.title")}
        showBackButton={false}
        showRightIconButton
        rightIconName="plus"
        onRightIconPress={() => setModalVisible(true)}
        useSafeArea
        extraScreenPaddingTop={Platform.OS === "android" ? 0 : 0}
      />

      <View
        style={{
          paddingHorizontal: 15,
          flex: 1,
        }}
      >
        {token ? (
          <RemoteFavouritesList
            listRef={listRef}
            listHeader={
              migration.showBanner ? (
                <MigrationBanner
                  counts={migration.counts}
                  isMigrating={migration.isMigrating}
                  onSync={migration.migrate}
                  onDismiss={migration.dismissBanner}
                />
              ) : undefined
            }
          />
        ) : (
          <LocalFavouritesList listRef={listRef} />
        )}
      </View>

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
          mode="outlined"
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
  );
}
