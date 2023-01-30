import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Validity } from "./Validity";
import { syllable } from "syllable";
import { fonts } from "./font";
import { Post } from "./haiku";
import { PostBox } from "./Post";

export const Feed = ({ posts }: { posts: Post[] }) => {
  return (
    <View>
      {posts.map((post) => (
        <PostBox
          key={post.haiku.join("") + post.author}
          author={post.author}
          haiku={post.haiku}
        />
      ))}
    </View>
  );
};
