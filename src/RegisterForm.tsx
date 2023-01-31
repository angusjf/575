import { StyleSheet, Text, TextInput, View } from "react-native";
import { fonts } from "./font";
import { useCallback, useState } from "react";
import { registerUser } from "../firebaseClient";
import { storeUsername } from "./storage";
import { Button } from "./Button";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "grey",
    fontFamily: fonts.PlexSerifRegular,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginVertical: 7,
    fontSize: 20,
  },
});

export const RegisterForm = ({
  setUsername,
}: {
  setUsername: (username: string) => void;
}) => {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"unchecked" | "loading" | "taken">(
    "unchecked"
  );
  const handleLogin = useCallback(async (username: string) => {
    try {
      setState("loading");
      await registerUser(username);
      await storeUsername(username);
      setUsername(username);
    } catch (error: unknown) {
      setState("taken");
    }
  }, []);

  return (
    <View>
      <TextInput
        placeholder="how do you sign your poems?"
        value={input || ""}
        onChangeText={(text) => {
          setInput(text);
          setState("unchecked");
        }}
        style={{
          ...styles.input,
          ...(state === "taken" ? { borderColor: "red" } : {}),
        }}
      />
      <Text>{JSON.stringify(state)}</Text>
      <Button
        title="continue"
        onPress={() => handleLogin(input)}
        isLoading={state == "loading"}
      />
    </View>
  );
};
