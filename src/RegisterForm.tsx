import { Text, View } from "react-native";
import { useCallback, useState } from "react";
import { registerUser } from "../firebaseClient";
import { storeUsername } from "./storage";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";
import { Validity } from "./Validity";

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
      <HaikuLineInput
        placeholder="how do you sign your poems?"
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
