import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { RootStack } from "./src/components/RootStack";
import { AppStateProvider } from "./src/useAppState";

export default function App() {
  return (
    <NavigationContainer>
      <AppStateProvider>
        <ActionSheetProvider>
          <RootStack />
        </ActionSheetProvider>
      </AppStateProvider>
    </NavigationContainer>
  );
}
