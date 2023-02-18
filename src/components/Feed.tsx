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
import { PostBox } from "./Post";
import { LinearGradient } from "expo-linear-gradient";

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
            renderItem={({ item }) => (
              <PostBox
                key={item.haiku.join("") + item.author}
                author={item.author}
                haiku={item.haiku}
              />
            )}
          />
        )}
        <Button title="log out" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};
