import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { fonts } from "../font";
import { Post } from "../types";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../utils/consts";
import { timestampToRelative } from "../utils/date";
import { memo, useEffect, useMemo, useRef } from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";

type Reaction = string;

const ReactionDrawing = ({ reaction }: { reaction: Reaction }) => {
  return (
    <View
      style={{ paddingHorizontal: 10, width: 100, height: 100, borderWidth: 1 }}
    >
      <Text>{reaction}</Text>
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

const PostBoxNoMemo = ({
  haiku,
  author,
  showOptions,
  isMyPost,
  signature,
  timestamp,
  open,
  onPress,
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
  const openAnim = useSharedValue(open ? 1 : 0);
  console.log(openAnim.value);

  const selected = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(
        openAnim.value,
        [0, 1],
        [0, 2 * 120],
        Extrapolate.EXTEND
      ),
    };
  });

  useEffect(() => {
    openAnim.value = withSpring(open ? 1 : 0, {
      velocity: 7,
      restSpeedThreshold: 4,
    });
  }, [open]);

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
        <View style={{ position: "absolute", top: 170 }}>
          <FlatList
            renderItem={(reaction) =>
              reaction.item === "+" ? (
                <AddReaction />
              ) : (
                <ReactionDrawing reaction={reaction.item} />
              )
            }
            numColumns={3}
            data={[
              "something here",
              "something more",
              "something here",
              "something more",
              "something here",
              "something more",
              "+",
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
};

function AddReaction() {
  const ref = useRef<BottomSheet>(null);
  const snaps = useMemo(() => ["50%", "60%"], []);
  return (
    <TouchableOpacity onPress={() => ref.current?.collapse()}>
      <BottomSheet
        ref={ref}
        snapPoints={snaps}
        bottomInset={46}
        detached={true}
        style={{
          marginHorizontal: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 8,
          backgroundColor: "white",
          borderRadius: 15,
        }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        index={-1}
      >
        <View>
          <Text>Gl</Text>
        </View>
      </BottomSheet>
      <Text>+</Text>
    </TouchableOpacity>
  );
}

export const PostBox = memo(PostBoxNoMemo);
