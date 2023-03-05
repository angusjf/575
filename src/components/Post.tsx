import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import { fonts } from "../font";
import { Post } from "../types";

const styles = StyleSheet.create({
  line: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 20,
    marginBottom: 5,
  },
  author: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 15,
    textAlign: "right",
    marginTop: 5,
  },
  container: {
    marginVertical: 21,
  },
});

export const PostBox = ({
  haiku,
  author,
  showOptions,
  signature,
}: Post & {
  showOptions: (sharingMessage: string, userId: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={() =>
        showOptions(
          haiku[0] +
            "\n" +
            haiku[1] +
            "\n" +
            haiku[2] +
            "\n~ " +
            author.username,
          author.userId
        )
      }
    >
      <Text style={styles.line}>{haiku[0]}</Text>
      <Text style={styles.line}>{haiku[1]}</Text>
      <Text style={styles.line}>{haiku[2]}</Text>
      <Text style={styles.author}>– {author.username}</Text>
      <SvgXml xml={signature} />
    </TouchableOpacity>
  );
};
