import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Validity } from "../validity";
import { fonts } from "../font";
import { forwardRef, useState } from "react";
import { customSyllables } from "./syllable";

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

export const HaikuLineInput = forwardRef<
  TextInput,
  TextInputProps & { length?: number; validity: Validity }
>((props, ref) => {
  const [focused, setIsFocused] = useState(false);
  const invalid =
    props.validity === "invalid" &&
    customSyllables(props.value || "") !== props.length;

  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        ref={ref}
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
          width: props.length == 7 ? 330 : 250,
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
        {customSyllables(props.value || "")}
      </Text>
    </View>
  );
});

HaikuLineInput.displayName = "HaikuLineInput";
