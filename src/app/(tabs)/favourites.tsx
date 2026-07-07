import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, FlatList, ImageBackground, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, MD2DarkTheme, Text, TextInput } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { createGroup, loadFavorites } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import Thumbnail from "../../components/Thumbnail";
import UserInputModal from "../../components/UserInputModal";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import { useMigrateLibrary } from "../../hooks/useMigrateLibrary";
import { AsyncStorage } from "expo-sqlite/kv-store";

export default function Favourites() {
  const params = useLocalSearchParams();
  const groups = useAppSelector((state) => state.favourite.groups);
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { blockedMovies } = useBlockedMovies();
  const { superLikedMovies } = useSuperLikedMovies();
  const token = useAppSelector((s) => s.auth.token);

  const { migrateLibrary, getLocalDataCount, isLoading: isMigrating } = useMigrateLibrary();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationCounts, setMigrationCounts] = useState({ movies: 0, interactions: 0 });
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);

  // Persistent key — prevents the auto-modal from popping on every app launch.
  // We use AsyncStorage instead of useRef so it survives component remounts.
  const MIGRATION_OFFERED_KEY = "migration_prompt_offered";

  useEffect(() => {
    if (!token) return;

    (async () => {
      const { movies, interactions } = await getLocalDataCount();
      if (movies === 0 && interactions === 0) return; // nothing local to migrate

      setMigrationCounts({ movies, interactions });
      setShowMigrationBanner(true);

      // Auto-show the modal only the first time (not on every remount / app launch)
      const alreadyOffered = await AsyncStorage.getItem(MIGRATION_OFFERED_KEY);
      if (!alreadyOffered) {
        await AsyncStorage.setItem(MIGRATION_OFFERED_KEY, "1");
        setShowMigrationModal(true);
      }
    })();
  // token change is the meaningful trigger; AsyncStorage key handles de-duplication
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleMigrate = useCallback(async () => {
    await migrateLibrary();
    setShowMigrationModal(false);
    setShowMigrationBanner(false);
    dispatch(loadFavorites());
  }, [migrateLibrary, dispatch]);

  const handleDismissMigrationModal = useCallback(() => {
    setShowMigrationModal(false);
    // Banner stays so the user can trigger it manually later
  }, []);

  const handleDismissBanner = useCallback(() => {
    setShowMigrationBanner(false);
  }, []);

  useEffect(() => {
    if (params.scrollsToBottom) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [params.scrollsToBottom]);

  useEffect(() => {
    dispatch(loadFavorites());
  }, []);

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");

  const listRef = useRef<FlatList>(null);

  const handleCreateGroup = () => {
    if (text) {
      dispatch(createGroup(text.trim()));
      setModalVisible(false);
      setText("");
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
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
      <View style={{ paddingHorizontal: 15, flex: 1, marginTop: Platform.OS === "android" ? 30 : 0, paddingBottom: 15 }}>
        <FlatList
          ref={listRef}
          showsVerticalScrollIndicator={false}
          data={groups}
          keyExtractor={(k, index) => k.id + "-" + index}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 60 }}
          ListHeaderComponent={
            token && showMigrationBanner ? (
              <View style={migrationStyles.banner}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#BB86FC" style={{ marginTop: 1 }} />
                <View style={migrationStyles.bannerText}>
                  <Text style={migrationStyles.bannerTitle}>Sync to cloud</Text>
                  <Text style={migrationStyles.bannerSub}>
                    {migrationCounts.movies > 0 && `${migrationCounts.movies} saved movie${migrationCounts.movies !== 1 ? "s" : ""}`}
                    {migrationCounts.movies > 0 && migrationCounts.interactions > 0 && " · "}
                    {migrationCounts.interactions > 0 && `${migrationCounts.interactions} interaction${migrationCounts.interactions !== 1 ? "s" : ""}`}
                  </Text>
                </View>
                <Button
                  mode="text"
                  compact
                  onPress={handleMigrate}
                  loading={isMigrating}
                  disabled={isMigrating}
                  textColor="#BB86FC"
                  style={{ marginRight: -4 }}
                >
                  Sync
                </Button>
                <Pressable onPress={handleDismissBanner} hitSlop={10} style={{ padding: 4 }}>
                  <MaterialCommunityIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </View>
            ) : null
          }
          ListFooterComponent={
            <View style={specialCardStyles.container}>
              <Pressable onPress={() => router.push("/group/super-liked")} style={specialCardStyles.card}>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={specialCardStyles.background}
                    source={superLikedMovies[0] ? { uri: "https://image.tmdb.org/t/p/w500" + superLikedMovies[0].poster_path } : undefined}
                  >
                    <View style={[specialCardStyles.overlay, { backgroundColor: "rgba(255, 215, 0, 0.12)" }]} />
                    {superLikedMovies.length === 0 ? (
                      <View style={specialCardStyles.emptyInner}>
                        <MaterialCommunityIcons name="star" size={50} color="#FFD700" style={{ opacity: 0.5 }} />
                      </View>
                    ) : (
                      <View style={specialCardStyles.thumbnailGrid}>
                        {superLikedMovies.slice(0, 4).map((m) => (
                          <Thumbnail
                            key={m.movie_id}
                            path={m.poster_path || ""}
                            size={200}
                            container={specialCardStyles.thumbnail}
                          />
                        ))}
                      </View>
                    )}
                  </ImageBackground>
                  <View style={specialCardStyles.label}>
                    <Text style={[specialCardStyles.labelText, { color: "#FFD700" }]}>{t("super-liked.title")}</Text>
                    <Text style={specialCardStyles.countText}>({superLikedMovies.length})</Text>
                  </View>
                </View>
              </Pressable>

              <Pressable onPress={() => router.push("/group/blocked")} style={specialCardStyles.card}>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={specialCardStyles.background}
                    source={blockedMovies[0] ? { uri: "https://image.tmdb.org/t/p/w500" + blockedMovies[0].poster_path } : undefined}
                  >
                    <View style={[specialCardStyles.overlay, { backgroundColor: "rgba(255, 68, 88, 0.12)" }]} />
                    {blockedMovies.length === 0 ? (
                      <View style={specialCardStyles.emptyInner}>
                        <MaterialCommunityIcons name="cancel" size={50} color="#FF4458" style={{ opacity: 0.5 }} />
                      </View>
                    ) : (
                      <View style={specialCardStyles.thumbnailGrid}>
                        {blockedMovies.slice(0, 4).map((m) => (
                          <Thumbnail
                            key={m.movie_id}
                            path={m.poster_path || ""}
                            size={200}
                            container={specialCardStyles.thumbnail}
                          />
                        ))}
                      </View>
                    )}
                  </ImageBackground>
                  <View style={specialCardStyles.label}>
                    <Text style={[specialCardStyles.labelText, { color: "#FF4458" }]}>{t("blocked.title")}</Text>
                    <Text style={specialCardStyles.countText}>({blockedMovies.length})</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => (
            <Link
              disabled={item?.movies?.length === 0}
              style={{ marginBottom: 15 }}
              href={{
                pathname: "/group/[id]",
                params: {
                  id: item.id,
                  group: JSON.stringify(item),
                },
              }}
            >
              <Link.Trigger>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={{
                      width: Dimensions.get("window").width - 30,
                      height: Dimensions.get("window").width / 2 - 30,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: MD2DarkTheme.colors.surface,
                      paddingBottom: 25,
                    }}
                    source={{
                      uri: "https://image.tmdb.org/t/p/w500" + item?.movies[0]?.imageUrl,
                    }}
                  >
                    {item?.movies?.length === 0 && (
                      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 10 }}>
                        <AntDesign name="plus" size={50} color="white" style={{ opacity: 0.5 }} />
                        <Text style={{ fontSize: 11, textAlign: "center" }}>{t("favourites.empty")}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                      {item.movies.slice(0, 4).map((m) => (
                        <Thumbnail
                          key={m.id}
                          path={m.imageUrl}
                          size={200}
                          container={{
                            width: (Dimensions.get("window").width / 2 - 25) * 0.45,
                            height: (Dimensions.get("window").width / 2 - 25) * 0.65,
                            borderRadius: 5,
                          }}
                        />
                      ))}
                    </View>
                  </ImageBackground>
                  <View style={{ flexDirection: "row", alignItems: "center", position: "absolute", bottom: 10, left: 15, gap: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 25, fontFamily: "Bebas" }}>{item.name}</Text>
                    <Text style={{ fontSize: 15 }}>({item.movies.length})</Text>
                  </View>
                </View>
              </Link.Trigger>
            </Link>
          )}
        />
      </View>

      <UserInputModal
        visible={isModalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setText("");
        }}
        title={t("favourites.create.title")}
        dismissable
        actionsLayout="horizontal"
        actions={[
          {
            label: t("favourites.create.cancel"),
            onPress: () => {
              setModalVisible(false);
              setText("");
            },
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

      {/* Migration modal — auto-shown once after sign-in when local data exists */}
      <Modal
        visible={showMigrationModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismissMigrationModal}
        statusBarTranslucent
      >
        <View style={migrationStyles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismissMigrationModal} />
          <View style={migrationStyles.modalCard}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={36} color="#BB86FC" style={{ marginBottom: 12 }} />
            <Text style={migrationStyles.modalTitle}>Sync your collection</Text>
            <Text style={migrationStyles.modalBody}>
              {"You have "}
              {migrationCounts.movies > 0 && (
                <Text style={migrationStyles.modalHighlight}>
                  {migrationCounts.movies} saved movie{migrationCounts.movies !== 1 ? "s" : ""}
                </Text>
              )}
              {migrationCounts.movies > 0 && migrationCounts.interactions > 0 && " and "}
              {migrationCounts.interactions > 0 && (
                <Text style={migrationStyles.modalHighlight}>
                  {migrationCounts.interactions} interaction{migrationCounts.interactions !== 1 ? "s" : ""}
                </Text>
              )}
              {" stored locally. Upload them to your account so they're available everywhere."}
            </Text>
            <Button
              mode="contained"
              onPress={handleMigrate}
              loading={isMigrating}
              disabled={isMigrating}
              style={migrationStyles.syncBtn}
              contentStyle={{ paddingVertical: 4 }}
            >
              Sync now
            </Button>
            <Button
              mode="text"
              onPress={handleDismissMigrationModal}
              disabled={isMigrating}
              textColor="rgba(255,255,255,0.45)"
            >
              Later
            </Button>
          </View>
        </View>
      </Modal>
    </SafeIOSContainer>
  );
}

const { width: WINDOW_WIDTH } = Dimensions.get("window");

const specialCardStyles = StyleSheet.create({
  container: {
    gap: 15,
    marginTop: 15,
  },
  card: {
    marginBottom: 0,
  },
  background: {
    width: WINDOW_WIDTH - 30,
    height: WINDOW_WIDTH / 2 - 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MD2DarkTheme.colors.surface,
    paddingBottom: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  thumbnail: {
    width: (WINDOW_WIDTH / 2 - 25) * 0.45,
    height: (WINDOW_WIDTH / 2 - 25) * 0.65,
    borderRadius: 5,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    left: 15,
    gap: 5,
  },
  labelText: {
    fontSize: 25,
    fontFamily: "Bebas",
  },
  countText: {
    fontSize: 15,
  },
});

const migrationStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(187, 134, 252, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#BB86FC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 4,
    marginBottom: 14,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#BB86FC",
  },
  bannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Bebas",
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalHighlight: {
    color: "#BB86FC",
    fontWeight: "600",
  },
  syncBtn: {
    borderRadius: 25,
    width: "100%",
    marginBottom: 6,
  },
});
