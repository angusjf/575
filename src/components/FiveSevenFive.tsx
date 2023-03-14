import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../font";

export const FiveSevenFive = ({
  marginTop,
  fontSize,
}: {
  marginTop: number;
  fontSize: number;
}) => (
  <View style={{ flexDirection: "row" }}>
    <Text style={[styles.logo, { fontSize, marginTop: marginTop + 0 }]}>5</Text>
    <Text
      style={[styles.logo, { fontSize, marginTop: marginTop + fontSize / 3.8 }]}
    >
      7
    </Text>
    <Text
      style={[styles.logo, { fontSize, marginTop: marginTop + fontSize / 1.9 }]}
    >
      5
    </Text>
  </View>
);

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.PlexMonoBoldItalic,
  },
});
