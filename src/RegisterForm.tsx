import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Validity } from "./Validity";
import { syllable } from "syllable";
import { fonts } from "./font";
import { useState } from "react";

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
  return (
    <View>
      <TextInput
        placeholder="what should we call you"
        value={input || ""}
        onChangeText={setInput}
      />
      <Button title="continue" onPress={() => setUsername(input)} />
    </View>
  );
};
