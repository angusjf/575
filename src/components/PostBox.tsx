import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { fonts } from "../font";
import { Post } from "../types";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../utils/consts";
import { timestampToRelative } from "../utils/date";

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 45,
  },
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
    marginTop: 10,
    width: "100%",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  signatureContainer: {
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "#000",
    marginRight: 10,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  headerInfo: {
    alignItems: "flex-start",
  },
  postTime: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 10,
  },
});

export const PostBox = ({
  haiku,
  author,
  showOptions,
  isMyPost,
  signature,
  timestamp,
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
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.signatureContainer}>
          <SvgXml
            xml={signature}
            width={40}
            height={40}
            viewBox={`0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}`}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.author}>{isMyPost ? "Me" : author.username}</Text>
          <Text style={styles.postTime}>{timestampToRelative(timestamp)}</Text>
        </View>
      </View>
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
      </TouchableOpacity>
    </View>
  );
};
