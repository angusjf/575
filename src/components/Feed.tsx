import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Day } from "../types";
import { Button } from "./Button";
import { PostBox } from "./Post";

const styles = StyleSheet.create({
  wrapper: {},
  root: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
  },
});

export const Feed = ({
  days,
  logout,
}: {
  days: Day[] | null;
  logout: () => void;
}) => {
  return (
    <View style={styles.root}>
      {days === null ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView style={styles.wrapper}>
          <FlatList
            data={days[days.length - 1].posts}
            renderItem={({ item }) => (
              <PostBox
                key={item.haiku.join("") + item.author}
                author={item.author}
                haiku={item.haiku}
              />
            )}
          />
        </SafeAreaView>
      )}
      <Button title="log out" onPress={logout} />
    </View>
  );
};
