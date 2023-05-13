import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { fonts } from "../font";
import { Post } from "../types";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../utils/consts";
import { timestampToRelative } from "../utils/date";
import { memo } from "react";

const styles = StyleSheet.create({
  normal: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 20,
    marginBottom: 5,
  },
  small: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 15,
    marginBottom: 5,
  },
});

export const HaikuLine = ({
  text,
  size = "normal",
}: {
  text: string;
  size?: "small" | "normal";
}) => {
  return <Text style={styles[size]}>{text}</Text>;
};
