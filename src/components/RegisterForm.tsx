import { Text, View } from "react-native";
import { useCallback, useState } from "react";
import { registerUser } from "../firebaseClient";
import { storeUsername } from "../storage";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";
import { Validity } from "../Validity";
import { fonts } from "../font";

export const RegisterForm = ({
  setUsername,
}: {
  setUsername: (username: string) => void;
}) => {
  const [input, setInput] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const handleLogin = useCallback(async (username: string) => {
    try {
      setValidity("loading");
      await registerUser(username);
      await storeUsername(username);
      setUsername(username);
    } catch (error: unknown) {
      setValidity("invalid");
    }
  }, []);

  return (
    <View>
      <Text style={{ fontFamily: fonts.PlexMonoItalic, fontSize: 15 }}>
        how do you sign your poems?
      </Text>
      <HaikuLineInput
        placeholder="Bashō"
        value={input || ""}
        onChangeText={(text) => {
          setInput(text);
          setValidity("unchecked");
        }}
        validity={validity}
        long
      />
      <Button
        title="continue"
        onPress={() => handleLogin(input)}
        isLoading={validity == "loading"}
      />
    </View>
  );
};
