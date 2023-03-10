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
    borderBottomWidth: 1,
  },
});

export const HaikuLineInput = (
  props: TextInputProps & { long?: boolean; validity: Validity }
) => {
  const [focused, setIsFocused] = useState(false);
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
          ...(focused
            ? {}
            : {
                borderBottomColor: focused
                  ? "grey"
                  : invalid
                  ? "red"
                  : "lightgrey",
              }),
          width: props.long ? 330 : 250,
        }}
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Text
        style={{
          color: focused || invalid ? "black" : "transparent",
          width: 10,
        }}
      >
        {syllable(props.value || "")}
      </Text>
    </View>
  );
};
