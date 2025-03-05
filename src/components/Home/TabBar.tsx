import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { Icon, TouchableRipple } from "react-native-paper";

export default function TabBar(props: { likeCard: () => void; removeCard: () => void; openInfo: () => void; zIndex: number }) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: Platform.OS === "ios" ? -30 : 20,
          left: 10,
          width: width,
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
          zIndex: props.zIndex,
        },
      ]}
    >
      <TouchableRipple
        centered
        borderless
        onPress={props.removeCard}
        style={{
          padding: 15,
          backgroundColor: "rgba(255,255,255,0.10)",
          borderRadius: 100,
        }}
      >
        <Icon source={"close"} size={25} color="#fff" />
      </TouchableRipple>

      <TouchableRipple
        centered
        borderless
        onPress={props.openInfo}
        style={{
          padding: 15,
          backgroundColor: "rgba(255,255,255,0.10)",
          borderRadius: 100,
        }}
      >
        <Icon source={"information-outline"} size={25} color="#fff" />
      </TouchableRipple>

      <TouchableRipple
        centered
        borderless
        onPress={props.likeCard}
        style={{
          padding: 15,
          backgroundColor: "rgba(255,255,255,0.10)",
          borderRadius: 100,
        }}
      >
        <Icon source={"heart"} size={25} color="red" />
      </TouchableRipple>
    </View>
  );
}
