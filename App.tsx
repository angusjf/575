import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { AppStateProvider, useAppState } from "./src/useAppState";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { FeedStack } from "./src/components/FeedStack";
import { Text } from "react-native";

const UnwrappedApp = () => {
  const { state } = useAppState();

  switch (state.state) {
    case "loading":
    case "finding_out_if_posted":
      return null;
    case "register":
      return <RegisterForm />;
    case "compose":
      return <HaikuForm />;
    case "feed":
    case "settings":
      return <FeedStack />;
    case "error":
      return <Text>{state.message}</Text>;
  }
};

export default function App() {
  return (
    <AppStateProvider>
      <ActionSheetProvider>
        <UnwrappedApp />
      </ActionSheetProvider>
    </AppStateProvider>
  );
}
