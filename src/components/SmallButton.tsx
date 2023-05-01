import { Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export const SmallButton = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: string;
}) => {
  return (
    <TouchableOpacity
      style={{
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
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 20,
          color: "white",
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
