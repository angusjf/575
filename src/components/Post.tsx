import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Validity } from "../Validity";
import { syllable } from "syllable";
import { fonts } from "../font";
import { Post } from "../types";

const styles = StyleSheet.create({
  line: {
    fontFamily: fonts.PlexSerifRegular,
    fontSize: 20,
  },
  author: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 15,
    textAlign: "right",
  },
  container: {
    marginBottom: 49,
  },
});

export const PostBox = ({ haiku, author }: Post) => {
  return (
    <View style={styles.container}>
      <Text style={styles.line}>{haiku[0]}</Text>
      <Text style={styles.line}>{haiku[1]}</Text>
      <Text style={styles.line}>{haiku[2]}</Text>
      <Text style={styles.author}>– {author}</Text>
    </View>
  );
};
