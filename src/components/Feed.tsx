import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fonts } from "../font";
import { Day } from "../types";
import { Button } from "./Button";
import { LinearGradient } from "expo-linear-gradient";
import { PostBox } from "./Post";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Haptics from "expo-haptics";
import { useAppState } from "../useAppState";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 5,
  },
  logo: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 32,
  },
  topBar: {
    position: "absolute",
    background: "transparent",
    zIndex: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  feed: {
    paddingTop: 64,
  },
});

const TopBar = () => {
  const white = "rgba(255, 255, 255, 255)";
  const transparent = "rgba(255, 255, 255, 0)";

  return (
    <LinearGradient colors={[white, white, transparent]} style={styles.topBar}>
      <Text style={styles.logo}>575</Text>
    </LinearGradient>
  );
};

export const Feed = ({
  days,
  logout,
}: {
  days: Day[] | null;
  logout: () => void;
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { blockUser } = useAppState();

  const showOptions = (blockedUserId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const options = ["Block User", "Cancel"];
    const destructiveButtonIndex = 0;
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
            blockUser(blockedUserId);
            break;
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <TopBar />
        {days === null ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            style={styles.feed}
            data={days[days.length - 1].posts}
            renderItem={({ item }) => {
              return (
                <PostBox
                  key={item.haiku.join("") + item.author}
                  author={item.author}
                  haiku={item.haiku}
                  showOptions={showOptions}
                />
              );
            }}
          />
        )}
        <Button title="log out" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};
