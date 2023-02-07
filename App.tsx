import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Feed } from "./src/components/Feed";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { useAppState } from "./src/useAppState";
import { Button } from "./src/components/Button";

export default function App() {
  const { state, register, publish, logout } = useAppState();

  const onLayoutRootView = useCallback(async () => {}, [state]);

  if (state.screen === "loading") {
    return null;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      {state.screen === "register" ? (
        <RegisterForm register={register} />
      ) : state.screen === "compose" ? (
        <HaikuForm publish={publish} />
      ) : (
        <Feed days={state.days} />
      )}
      <Button title="log out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
