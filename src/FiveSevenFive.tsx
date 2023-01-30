import { useReducer } from "react";
import { StyleSheet, Text, View } from "react-native";

type Haiku = [string, string, string];

type State = { screen: "splash" } | { screen: "input"; haiku: Haiku };

type Action =
  | { type: "start" }
  | { type: "change_line"; line: 0 | 1 | 2; newLine: string }
  | { type: "submit" };

const defaultHaiku: Haiku = ["", "", ""];

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "change_line":
      if (state.screen == "input") {
        return {
          ...state,
          haiku: { ...state.haiku, [action.line]: action.newLine },
        };
      } else {
        return state;
      }
  }
};

export const FiveSevenFive = () => {
  const [state, dispatch] = useReducer(reducer, {
    screen: "splash",
  });

  return (
    <View>
      <Text style={styles.number}>5</Text>
      <Text style={styles.number}>7</Text>
      <Text style={styles.number}>5</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  number: {
    fontSize: 36,
    fontFamily: "PlexSerifRegular",
  },
});
