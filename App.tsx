import { Text } from "react-native";
import { Feed } from "./src/components/Feed";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { AppStateProvider, useAppState } from "./src/useAppState";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Settings } from "./src/components/Settings";

const UnwrappedApp = () => {
  const { state, register, publish, logout, deleteAccount } = useAppState();

  if (state.state === "loading" || state.state === "finding_out_if_posted") {
    return null;
  }

  if (state.state === "register") {
    return <RegisterForm register={register} />;
  }

  if (state.state === "compose") {
    return <HaikuForm publish={publish} />;
  }

  if (state.state === "feed") {
    return <Feed days={state.days} />;
  }

  if (state.state === "settings") {
    return <Settings logout={logout} deleteAccount={deleteAccount} />;
  }

  return <Text>Error: {state.message}</Text>;
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
