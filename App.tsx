import { StyleSheet, Text, View } from "react-native";
import { Feed } from "./src/components/Feed";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { useAppState } from "./src/useAppState";
import { Button } from "./src/components/Button";

export default function App() {
  const { state, register, publish, logout } = useAppState();

  if (state.state === "loading" || state.state === "finding_out_if_posted") {
    return null;
  }

  return (
    <View style={styles.root}>
      {state.state === "register" ? (
        <RegisterForm register={register} />
      ) : state.state === "compose" ? (
        <HaikuForm publish={publish} />
      ) : state.state === "feed" ? (
        <Feed days={state.days} />
      ) : (
        <Text>Error: {state.message}</Text>
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
