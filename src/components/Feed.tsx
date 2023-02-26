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
} from "react-native";
import { PostBox } from "./Post";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useAppState } from "../useAppState";
import { SEPARATORS } from "../../assets/FeedSeparators";

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

  if (state.state !== "feed") return null;

  const days = state.days;

  const showOptions = (sharingMessage: string, blockedUserId: string) => {
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
            Share.share({ message: sharingMessage });
            break;
          case 1:
            Alert.alert(
              "Block User",
              "Are you sure you want to block this user?",
              [
                { text: "Cancel" },
                { text: "Block", onPress: () => blockUser(blockedUserId) },
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

  return (
    <View style={styles.root}>
      {days === null ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 50, paddingBottom: 80 }}
          style={styles.feed}
          data={days[days.length - 1].posts.sort(
            (postA, postB) => postB.timestamp - postA.timestamp
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return (
              <View>
                <PostBox
                  key={item.haiku.join("") + item.author}
                  author={item.author}
                  haiku={item.haiku}
                  showOptions={showOptions}
                  timestamp={item.timestamp}
                />
                {index === days[days.length - 1].posts.length - 1 ? null : (
                  <View style={{ alignItems: "center" }}>
                    {SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)]}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
};
