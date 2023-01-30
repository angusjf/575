import { useReducer } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HaikuBox } from "./HaikuBox";
import { syllable } from "syllable";
import { Validity } from "./Validity";

type Haiku = [string, string, string];

type State =
  | { screen: "splash" }
  | {
      screen: "input";
      haiku: Haiku;
      validity: Validity;
    }
  | { screen: "feed"; haikus: { haiku: Haiku; author: string }[] };

type Action =
  | { type: "start" }
  | { type: "change_line"; line: 0 | 1 | 2; newLine: string }
  | { type: "start_analysis" }
  | { type: "finish_analysis" };

const defaultHaiku: Haiku = ["", "", ""];

const AI_WAIT_TIME = 2000;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "start":
      return { screen: "input", haiku: defaultHaiku, validity: "loading" };
    case "change_line":
      if (state.screen == "input") {
        return {
          ...state,
          haiku: { ...state.haiku, [action.line]: action.newLine },
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
          return {
            screen: "feed",
            haikus: [{ haiku: state.haiku, author: "rohan" }],
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

export const FiveSevenFive = () => {
  const [state, dispatch] = useReducer(reducer, {
    screen: "splash",
  });

  switch (state.screen) {
    case "splash":
      return <Splash advance={() => dispatch({ type: "start" })} />;
    case "input":
      return (
        <>
          <InputScreen
            validity={state.validity}
            haiku={state.haiku}
            changed={(n, l) =>
              dispatch({ type: "change_line", line: n, newLine: l })
            }
            done={() => {
              dispatch({ type: "start_analysis" });
              setTimeout(
                () => dispatch({ type: "finish_analysis" }),
                AI_WAIT_TIME
              );
            }}
          />
          <Text>{JSON.stringify(state)}</Text>
        </>
      );
    case "feed":
      return <Text>{JSON.stringify(state)}</Text>;
  }
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 20,
    fontFamily: "PlexSerifBoldItalic",
  },
  number: {
    fontSize: 35,
    fontFamily: "PlexSerifRegular",
  },
  submit: {
    borderWidth: 1,
    borderColor: "grey",
    paddingHorizontal: 7,
    alignSelf: "center",
  },
  submitText: {
    fontSize: 20,
    fontFamily: "PlexSerifBoldItalic",
    alignSelf: "center",
  },
});

const Splash = ({ advance }: { advance: () => void }) => {
  return (
    <TouchableOpacity onPress={advance}>
      <Text style={styles.number}>5</Text>
      <Text style={styles.number}>7</Text>
      <Text style={styles.number}>5</Text>
    </TouchableOpacity>
  );
};

const now = new Date();

const date = new Intl.DateTimeFormat();

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
      <Text>{date.format(now)}</Text>
      <Text style={styles.intro}>Compose today's haiku</Text>
      <HaikuBox
        placeholder="In the twilight rain"
        value={haiku[0]}
        onChangeText={(l) => changed(0, l)}
        validity={validity}
      />
      <HaikuBox
        placeholder="these brilliant-hued hibiscus -"
        value={haiku[1]}
        onChangeText={(l) => changed(1, l)}
        validity={validity}
        long
      />
      <HaikuBox
        placeholder="A lovely sunset."
        value={haiku[2]}
        validity={validity}
        onChangeText={(l) => changed(2, l)}
      />
      <SubmitButton done={done} loading={validity === "loading"} />
    </View>
  );
};

const SubmitButton = ({
  done,
  loading,
}: {
  done: () => void;
  loading: boolean;
}) => (
  <TouchableOpacity style={styles.submit} onPress={done}>
    <Text style={styles.submitText}>
      {loading ? "loading" : "check & share"}
    </Text>
  </TouchableOpacity>
);
