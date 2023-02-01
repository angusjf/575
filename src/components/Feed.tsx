import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Day } from "../types";
import { PostBox } from "./Post";
import { Button } from "./Button";
import { clear } from "../storage";

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 147,
  },
});

export const Feed = ({ days }: { days: Day[] | null }) => {
  return (
    <View>
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
      <Button title="clear storage" onPress={() => clear()} />
    </View>
  );
};
