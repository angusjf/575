import { useReducer } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HaikuLineInput } from "./HaikuLineInput";
import { syllable } from "syllable";
import { Validity } from "../Validity";
import { fonts } from "../font";
import { Haiku } from "../types";
import { Button } from "./Button";
import { format } from "date-fns";
import { valid } from "../valid";
import { getSeason } from "../seasons";

type State = {
  haiku: Haiku;
  validity: Validity;
};

type Action =
  | { type: "change_line"; line: 0 | 1 | 2; newLine: string }
  | { type: "submit" }
  | { type: "invalid" };

const defaultHaiku: Haiku = ["", "", ""];

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
      return {
        ...state,
        haiku: setAt(state.haiku, action.line, action.newLine),
        validity: "unchecked",
      };
    case "submit":
      return { ...state, validity: "loading" };
    case "invalid":
      return { ...state, validity: "invalid" };
  }
};

export const HaikuForm = ({
  publish,
}: {
  publish: (haiku: Haiku, username: string) => void;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    haiku: defaultHaiku,
    validity: "unchecked",
  });

  return (
    <InputScreen
      validity={state.validity}
      haiku={state.haiku}
      changed={(n, l) => dispatch({ type: "change_line", line: n, newLine: l })}
      done={() => {
        dispatch({ type: "submit" });
        setTimeout(() => {
          const syllables = [
            syllable(state.haiku[0]),
            syllable(state.haiku[1]),
            syllable(state.haiku[2]),
          ] as const;

          if (valid(syllables)) {
            publish(state.haiku, "anonymous");
          } else {
            dispatch({ type: "invalid" });
          }
        }, AI_WAIT_TIME);
      }}
    />
  );
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 20,
    fontFamily: fonts.PlexMonoItalic,
    marginTop: 15,
    marginBottom: 25,
  },
  date: {
    fontFamily: fonts.PlexMonoItalic,
  },
  root: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const now = new Date();

const DateToday = () => (
  <Text style={styles.date}>
    {format(now, "do MMM ''yy")} - {getSeason(now)}
  </Text>
);

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
    <View style={styles.root}>
      <View>
        <DateToday />
        <Text style={styles.intro}>Compose today's haiku</Text>
      </View>
      <View>
        <HaikuLineInput
          placeholder="In the twilight rain"
          value={haiku[0]}
          onChangeText={(l) => changed(0, l)}
          validity={validity}
          autoFocus
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
      </View>
      <View>
        <Button
          title="check & share"
          isLoading={validity === "loading"}
          onPress={done}
          style={{ marginTop: 30 }}
        />
        <Button
          title="prefill"
          onPress={() => {
            changed(0, "one two three four five");
            changed(1, "one two three four five six sev");
            changed(2, "one two three four five");
          }}
        />
      </View>
    </View>
  );
};
