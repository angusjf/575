import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Validity } from "../Validity";
import { syllable } from "syllable";
import { fonts } from "../font";
import { useState } from "react";

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.PlexMonoItalic,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginVertical: 7,
    fontSize: 16,
  },
});

export const HaikuLineInput = (
  props: TextInputProps & { long?: boolean; validity: Validity }
) => {
  const [isFocused, setIsFocused] = useState(true);
  const invalid =
    props.validity === "invalid" &&
    syllable(props.value || "") !== (props.long ? 7 : 5);

  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        multiline
        editable={props.validity !== "loading"}
        autoCapitalize="none"
        style={{
          ...styles.input,
          ...(isFocused ? { borderBottomWidth: 1, borderColor: "grey" } : {}),
          ...(invalid ? { borderBottomWidth: 1, borderColor: "red" } : {}),
          width: props.long ? 330 : 250,
        }}
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {invalid && <Text>{syllable(props.value || "")}</Text>}
    </View>
  );
};
