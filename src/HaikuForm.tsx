import { useReducer } from "react";
import {
  ActivityIndicator,
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
import { post } from "../firebaseClient";
import { Button } from "./Button";

type State =
  | {
      screen: "input";
      haiku: Haiku;
      validity: Validity;
    }
  | { screen: "feed"; haikus: Post[] };

type Action =
  | { type: "change_line"; line: 0 | 1 | 2; newLine: string }
  | { type: "start_analysis" }
  | { type: "finish_analysis"; username: string };

const defaultHaiku: Haiku = [
  "one two three four five",
  "one two three four five six sev",
  "one two three four five",
];

const AI_WAIT_TIME = 2000;

const setAt = <T extends unknown>(
  [a, b, c]: [T, T, T],
  n: number,
  x: T
): [T, T, T] => {
  if (n === 0) {
    return [x, b, c];
  }
  if (n == 1) {
    return [a, x, c];
  }
  return [a, b, x];
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "change_line":
      if (state.screen == "input") {
        return {
          ...state,
          haiku: setAt(state.haiku, action.line, action.newLine),
          validity: "unchecked",
        };
      } else {
        return state;
      }
    case "start_analysis":
      if (state.screen == "input") {
        return { ...state, validity: "loading" };
      } else {
        return state;
      }
    case "finish_analysis":
      if (state.screen == "input") {
        const syllables = [
          syllable(state.haiku[0]),
          syllable(state.haiku[1]),
          syllable(state.haiku[2]),
        ] as const;

        if (valid(syllables)) {
          post(action.username, state.haiku);
          return {
            screen: "feed",
            haikus: [{ haiku: state.haiku, author: action.username }],
          };
        } else {
          return {
            ...state,
            validity: "invalid",
          };
        }
      } else {
        return state;
      }
  }
};

const valid = (syllables: readonly [number, number, number]): boolean =>
  syllables[0] === 5 && syllables[1] === 7 && syllables[2] === 5;

export const HaikuForm = ({ username }: { username: string }) => {
  const [state, dispatch] = useReducer(reducer, {
    screen: "input",
    haiku: defaultHaiku,
    validity: "unchecked",
  });

  switch (state.screen) {
    case "input":
      return (
        <InputScreen
          validity={state.validity}
          haiku={state.haiku}
          changed={(n, l) =>
            dispatch({ type: "change_line", line: n, newLine: l })
          }
          done={() => {
            dispatch({ type: "start_analysis" });
            setTimeout(
              () => dispatch({ type: "finish_analysis", username }),
              AI_WAIT_TIME
            );
          }}
        />
      );
    case "feed":
      return <Feed posts={state.haikus} />;
  }
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 20,
    fontFamily: fonts.PlexSerifBoldItalic,
  },
});

const now = new Date();

const InputScreen = ({
  haiku,
  changed,
  done,
  validity,
}: {
  haiku: Haiku;
  changed: (n: 0 | 1 | 2, l: string) => void;
  done: () => void;
  validity: Validity;
}) => {
  return (
    <View>
      <Text>{JSON.stringify(now)}</Text>
      <Text style={styles.intro}>Compose today's haiku</Text>
      <HaikuLineInput
        placeholder="In the twilight rain"
        value={haiku[0]}
        onChangeText={(l) => changed(0, l)}
        validity={validity}
      />
      <HaikuLineInput
        placeholder="these brilliant-hued hibiscus -"
        value={haiku[1]}
        onChangeText={(l) => changed(1, l)}
        validity={validity}
        long
      />
      <HaikuLineInput
        placeholder="A lovely sunset."
        value={haiku[2]}
        validity={validity}
        onChangeText={(l) => changed(2, l)}
      />
      <Button
        title="check & share"
        isLoading={validity === "loading"}
        onPress={done}
      />
    </View>
  );
};
