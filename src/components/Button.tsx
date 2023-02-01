import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { fonts } from "../font";

type ButtonProps = {
  isLoading?: boolean;
  title: string;
  onPress: () => void;
};

export const Button = ({ isLoading, title, onPress }: ButtonProps) => (
  <TouchableOpacity style={styles.submit} onPress={onPress}>
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
    paddingHorizontal: 7,
    alignSelf: "center",
  },
  submitText: {
    fontSize: 20,
    fontFamily: fonts.PlexSerifRegular,
    alignSelf: "center",
  },
});
