import { StyleSheet, TextInput, View } from "react-native";
import { fonts } from "./font";
import { useCallback, useState } from "react";
import { registerUser } from "../firebaseClient";
import { storeUsername, USERNAME_KEY } from "./storage";
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
  const [isLoading, setLoading] = useState(false);
  const handleLogin = useCallback(async (username: string) => {
    try {
      setLoading(true);
      await registerUser(username);
      await storeUsername(username);
      setUsername(username);
    } catch (error: unknown) {
      console.log("couldn't log in");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View>
      <TextInput
        placeholder="what should we call you"
        value={input || ""}
        onChangeText={setInput}
      />
      <Button
        title="continue"
        onPress={() => handleLogin(input)}
        isLoading={isLoading}
      />
    </View>
  );
};
