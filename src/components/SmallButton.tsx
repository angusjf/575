import { Text, TextStyle, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export const SmallButton = ({
  onPress,
  children,
  viewStyle,
  textStyle,
}: {
  onPress: () => void;
  children: string;
  viewStyle?: ViewStyle;
  textStyle?: TextStyle;
}) => {
  return (
    <TouchableOpacity
      style={[
        {
          marginLeft: "auto",
          marginRight: 5,
          borderColor: "black",
          borderWidth: 1,
          borderRadius: 50,
          backgroundColor: "black",
          height: 33,
          width: 33,
          justifyContent: "center",
          alignItems: "center",
        },
        viewStyle,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          {
            fontSize: 20,
            color: "white",
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
