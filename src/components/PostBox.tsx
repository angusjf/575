import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { fonts } from "../font";
import { Comment, Post } from "../types";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../utils/consts";
import { timestampToRelative } from "../utils/date";
import { memo, useEffect, useRef, useState } from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { HaikuLineInput } from "./HaikuLineInput";
import { SmallButton } from "./SmallButton";
import { useAppState } from "../useAppState";
import { Validity } from "../validity";
import { customSyllables } from "./syllable";
import { addComment } from "../firebaseClient";

const CommentLine = ({ comment }: { comment: Comment }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={{ fontFamily: fonts.PlexMonoItalic }}>
        {comment.comment}{" "}
      </Text>
      <Text style={{ marginRight: 10, fontFamily: fonts.PlexSansBoldItalic }}>
        ~ {comment.author}
      </Text>
    </View>
  );
};

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
    fontSize: 20,
    fontFamily: fonts.PlexSansBoldItalic,
    paddingRight: 10,
  },
  container: {
    marginTop: 10,
    width: "100%",
  },
  selected: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
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

const toComments = (cs: Record<string, string>): Comment[] =>
  Object.entries(cs).map(([author, comment]) => ({
    author,
    comment,
  }));

const PostBoxNoMemo = ({
  haiku,
  author,
  showOptions,
  isMyPost,
  signature,
  timestamp,
  open,
  onPress,
  comments: initialComments,
}: Post & {
  showOptions: (
    sharingMessage: string,
    userId: string,
    userName: string,
    isMyPost: boolean
  ) => void;
  isMyPost: boolean;
  open: boolean;
  onPress: () => void;
}) => {
  const [comments, setComments] = useState(() => toComments(initialComments));

  const openAnim = useSharedValue(open ? 1 : 0);

  const [h, setH] = useState(0);

  const { state } = useAppState();

  const selected = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(
        openAnim.value,
        [0, 1],
        [0, h + styles.wrapper.marginBottom],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    openAnim.value = withSpring(open ? 1 : 0);
  }, [open, openAnim]);

  return (
    <Animated.View style={[styles.wrapper, selected, { overflow: "hidden" }]}>
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
        onPress={onPress}
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
      {(open || openAnim.value > 0) && (
        <View
          style={{ position: "absolute", top: 170 }}
          onLayout={({ nativeEvent }) => setH(nativeEvent.layout.height)}
        >
          <FlatList
            renderItem={(comment) => <CommentLine comment={comment.item} />}
            data={comments}
          />
          {comments.filter(({ author }) => author === state.user?.username)
            .length === 0 ? (
            <AddReaction
              postComment={(comment) => {
                const user = state.user;
                if (user) {
                  setComments((old) => [
                    ...old,
                    { author: user.username || "me", comment },
                  ]);
                  addComment(author, timestamp, {
                    comment,
                    author: user.username,
                  });
                }
              }}
            />
          ) : (
            <></>
          )}
        </View>
      )}
    </Animated.View>
  );
};

function AddReaction({ postComment }: { postComment: (c: string) => void }) {
  const [comment, setComment] = useState<string>("");
  const [validity, setValid] = useState<Validity>("unchecked");
  const ref = useRef<TextInput>(null);

  const done = () => {
    if (customSyllables(comment) == 3) {
      postComment(comment);
    } else {
      setValid("invalid");
      ref.current?.blur();
    }
  };

  return (
    <View style={{ flexDirection: "row", marginTop: 5 }}>
      <View style={{ marginRight: 12 }}>
        <HaikuLineInput
          placeholder="leave a thought..."
          ref={ref}
          validity={validity}
          onChangeText={setComment}
          value={comment}
          onSubmitEditing={done}
        />
      </View>
      <SmallButton viewStyle={{ marginTop: 5 }} onPress={done}>
        言
      </SmallButton>
    </View>
  );
}

export const PostBox = memo(PostBoxNoMemo);
