import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  View,
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
}: ButtonProps & TouchableOpacityProps) => {
  return (
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
};

const styles = StyleSheet.create({
  submit: {
    marginTop: 15,
    paddingHorizontal: 20,
    height: 42,
    justifyContent: "center",
    alignSelf: "center",
    borderColor: "#f9f6f6",
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "#140802",
  },
  submitText: {
    fontSize: 18,
    fontFamily: fonts.PlexMonoBold,
    alignSelf: "center",
    color: "white",
  },
});
