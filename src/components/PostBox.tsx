import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    paddingRight: 10,
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
  isMyPost,
  signature,
}: Post & {
  showOptions: (
    sharingMessage: string,
    userId: string,
    userName: string,
    isMyPost: boolean
  ) => void;
  isMyPost: boolean;
}) => {
  return (
    <View style={{ alignItems: "center" }}>
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
            author.username,
            isMyPost
          )
        }
      >
        <Text style={styles.line}>{haiku[0]}</Text>
        <Text style={styles.line}>{haiku[1]}</Text>
        <Text style={styles.line}>{haiku[2]}</Text>
        <Text style={styles.author}>– {isMyPost ? "Me" : author.username}</Text>
      </TouchableOpacity>
      <SvgXml
        xml={signature}
        width={150}
        height={75}
        style={{ marginBottom: 38 }}
        viewBox="0 0 500 200"
      />
    </View>
  );
};
