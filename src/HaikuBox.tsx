import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Validity } from "./Validity";
import { syllable } from "syllable";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "grey",
    fontFamily: "PlexSerifRegular",
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginVertical: 7,
    fontSize: 20,
  },
});

export const HaikuBox = (
  props: TextInputProps & { long?: boolean; validity: Validity }
) => {
  const invalid =
    props.validity === "invalid" &&
    syllable(props.value || "") !== (props.long ? 7 : 5);

  return (
    <TextInput
      style={{
        ...styles.input,
        ...(invalid ? { borderColor: "red" } : {}),
        width: props.long ? 330 : 250,
      }}
      {...props}
    />
  );
};
