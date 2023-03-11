import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootStack } from "./src/components/RootStack";
import { AppStateProvider } from "./src/useAppState";

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
