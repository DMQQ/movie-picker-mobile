import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChooseCategory from "./ChooseCategory";
import ChooseGenre from "./ChooseGenre";
import ContextProvider from "./ContextProvider";
import ChoosePageRange from "./ChoosePageRange";
import QRCodePage from "./QRCodePage";

const Stack = createNativeStackNavigator();

export default function QRCode({ navigation }: any) {
  return (
    <ContextProvider navigation={navigation}>
      <Stack.Navigator initialRouteName="ChooseCategory">
        <Stack.Screen
          name="ChooseCategory"
          component={ChooseCategory}
          options={{
            title: "Choose Category",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="ChooseGenre"
          component={ChooseGenre}
          options={{
            title: "Choose Genre",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="ChoosePage"
          component={ChoosePageRange}
          options={{
            title: "Randomize search",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="CreateQRCode"
          component={QRCodePage}
          options={{
            title: "Join room",
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </ContextProvider>
  );
}
