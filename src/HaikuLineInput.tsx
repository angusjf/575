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
import { fonts } from "./font";

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

export const HaikuLineInput = (
  props: TextInputProps & { long?: boolean; validity: Validity }
) => {
  const invalid =
    props.validity === "invalid" &&
    syllable(props.value || "") !== (props.long ? 7 : 5);

  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        editable={props.validity !== "loading"}
        autoCapitalize="none"
        style={{
          ...styles.input,
          ...(invalid ? { borderColor: "red" } : {}),
          width: props.long ? 330 : 250,
        }}
        {...props}
      />
      {invalid && <Text>{syllable(props.value || "")}</Text>}
    </View>
  );
};
