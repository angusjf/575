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
    borderBottomWidth: 1,
    borderEndWidth: 1,
    borderColor: "grey",
    paddingHorizontal: 14,
    paddingBottom: 4,
    alignSelf: "center",
  },
  submitText: {
    fontSize: 20,
    fontFamily: fonts.PlexMonoItalic,
    alignSelf: "center",
  },
});
