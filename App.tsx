import { Text } from "react-native";
import { Feed } from "./src/components/Feed";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { useAppState } from "./src/useAppState";

export default function App() {
  const { state, register, publish, logout } = useAppState();

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
    return <Feed days={state.days} logout={logout} />;
  }

  return <Text>Error: {state.message}</Text>;
}
