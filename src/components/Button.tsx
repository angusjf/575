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
    <View style={styles.topShadow}>
      <View style={styles.bottomShadow}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  submit: {
    marginTop: 15,
    paddingHorizontal: 30,
    height: 50,
    justifyContent: "center",
    alignSelf: "center",
    borderColor: "#f9f6f6",
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "#f9f6f6",
  },
  topShadow: {
    shadowOffset: {
      width: -6,
      height: -6,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowColor: "#ffffff",
  },
  bottomShadow: {
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowColor: "#dbd8d8",
  },
  submitText: {
    fontSize: 20,
    fontFamily: fonts.PlexMonoItalic,
    alignSelf: "center",
  },
});
