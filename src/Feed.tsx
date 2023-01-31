import { FlatList, SafeAreaView } from "react-native";
import { Post } from "./haiku";
import { PostBox } from "./Post";

export const Feed = ({ posts }: { posts: Post[] }) => {
  return (
    <SafeAreaView>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostBox
            key={item.haiku.join("") + item.author}
            author={item.author}
            haiku={item.haiku}
          />
        )}
      />
    </SafeAreaView>
  );
};
