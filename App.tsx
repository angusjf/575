import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { AppStateProvider, useAppState } from "./src/useAppState";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { FeedStack } from "./src/components/FeedStack";

const UnwrappedApp = () => {
  const { state } = useAppState();

  if (state.state === "loading" || state.state === "finding_out_if_posted") {
    return null;
  }

  if (state.state === "register") {
    return <RegisterForm />;
  }

  if (state.state === "compose") {
    return <HaikuForm />;
  }

  return <FeedStack />;
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
