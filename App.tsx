import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootStack } from "./src/components/RootStack";
import { AppStateProvider } from "./src/useAppState";

LogBox.ignoreLogs(["AsyncStorage has been extracted from react-native core"]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppStateProvider>
          <ActionSheetProvider>
            <RootStack />
          </ActionSheetProvider>
        </AppStateProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
