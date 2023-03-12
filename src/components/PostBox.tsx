import { StyleSheet, Text, TouchableOpacity } from "react-native";
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
    marginRight: 10,
  },
  container: {
    marginTop: 21,
    width: "100%",
  },
});

export const PostBox = ({
  haiku,
  author,
  showOptions,
}: Omit<Post, "signature"> & {
  showOptions: (
    sharingMessage: string,
    userId: string,
    userName: string
  ) => void;
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
          author.userId,
          author.username
        )
      }
    >
      <Text style={styles.line}>{haiku[0]}</Text>
      <Text style={styles.line}>{haiku[1]}</Text>
      <Text style={styles.line}>{haiku[2]}</Text>
      <Text style={styles.author}>– {author.username}</Text>
    </TouchableOpacity>
  );
};
