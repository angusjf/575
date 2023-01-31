import {
  ActivityIndicator,
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
import { Day, Post } from "./types";
import { PostBox } from "./Post";
import { useEffect, useState } from "react";
import { getDays } from "../firebaseClient";

export const Feed = ({ days }: { days: Day[] | null }) => {
  return (
    <View>
      {days === null ? (
        <ActivityIndicator />
      ) : (
        days.map((day) =>
          day.posts.map((post) => (
            <PostBox
              key={post.haiku.join("") + post.author}
              author={post.author}
              haiku={post.haiku}
            />
          ))
        )
      )}
    </View>
  );
};
