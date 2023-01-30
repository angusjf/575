import { useReducer } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HaikuLineInput } from "./HaikuLineInput";
import { syllable } from "syllable";
import { Validity } from "./Validity";
import { fonts } from "./font";
import { Haiku, Post } from "./haiku";
import { Feed } from "./Feed";

const styles = StyleSheet.create({
  number: {
    fontSize: 35,
    fontFamily: fonts.PlexSerifRegular,
  },
});

export const FiveSevenFive = () => {
  return (
    <View>
      <Text style={styles.number}>5</Text>
      <Text style={styles.number}>7</Text>
      <Text style={styles.number}>5</Text>
    </View>
  );
};
