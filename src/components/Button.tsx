import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { fonts } from "../font";

type ButtonProps = {
  isLoading?: boolean;
  title: string;
  onPress: () => void;
};

export const Button = ({
  isLoading,
  title,
  onPress,
  ...props
}: ButtonProps & TouchableOpacityProps) => (
  <TouchableOpacity
    {...props}
    style={[styles.submit, props.style]}
    onPress={onPress}
  >
    {isLoading ? (
      <ActivityIndicator />
    ) : (
      <Text style={styles.submitText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  submit: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "grey",
    paddingHorizontal: 30,
    height: 50,
    justifyContent: "center",
    borderStyle: "dashed",
    alignSelf: "center",
  },
  submitText: {
    fontSize: 20,
    fontFamily: fonts.PlexMonoItalic,
    alignSelf: "center",
  },
});
