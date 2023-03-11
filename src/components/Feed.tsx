import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
  Share,
  Alert,
  Text,
} from "react-native";
import { PostBox } from "./Post";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { useAppState } from "../useAppState";
import { SvgXml } from "react-native-svg";
import { italicize } from "../italicize";
import { Post } from "../types";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#f9f6f6",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
    flex: 1,
  },
  feed: {
    paddingTop: 64,
  },
});

export const Feed = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { state, refreshFeed, blockUser } = useAppState();

  const days = state.days;

  const showOptions = (
    sharingMessage: string,
    blockedUserId: string,
    blockedUserName: string
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const options = ["Share", "Block User", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            Share.share({ message: italicize(sharingMessage) });
            break;
          case 1:
            Alert.alert(
              "Block User",
              "Are you sure you want to block this user?",
              [
                { text: "Cancel" },
                {
                  text: "Block",
                  onPress: () => blockUser(blockedUserId, blockedUserName),
                },
              ],
              { cancelable: true }
            );
            break;
        }
      }
    );
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    refreshFeed();
    setTimeout(() => setRefreshing(false), 500);
  };

  const feedData: ("separator" | Post)[] | undefined = useMemo(
    () =>
      days !== undefined
        ? days[days.length - 2].posts.length > 0
          ? [
              ...sortByTimestamp(days[days.length - 1].posts),
              "separator",
              ...sortByTimestamp(days[days.length - 2].posts),
            ]
          : sortByTimestamp(days[days.length - 1].posts)
        : undefined,
    []
  );

  return (
    <View style={styles.root}>
      {feedData === undefined ? (
        <View style={{ flexGrow: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 50, paddingBottom: 80 }}
          style={styles.feed}
          data={feedData}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item !== "separator" ? (
              <View style={{ alignItems: "center" }}>
                <PostBox
                  key={item.haiku.join("") + item.author}
                  author={item.author}
                  haiku={item.haiku}
                  showOptions={showOptions}
                  timestamp={item.timestamp}
                />
                <SvgXml
                  xml={item.signature}
                  width={100}
                  height={100}
                  viewBox="0 0 500 200"
                />
              </View>
            ) : (
              <Separator />
            )
          }
        />
      )}
    </View>
  );
};

const Separator = () => <Text>Yesterday's Haikus</Text>;

const sortByTimestamp = <T extends { timestamp: number }>(xs: T[]): T[] =>
  xs.sort((postA, postB) => postB.timestamp - postA.timestamp);
