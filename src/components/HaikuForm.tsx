import { FC, useEffect, useMemo, useReducer, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HaikuLineInput } from "./HaikuLineInput";
import { syllable } from "syllable";
import { Validity } from "../Validity";
import { fonts } from "../font";
import { Haiku } from "../types";
import { Button } from "./Button";
import { format } from "date-fns";
import { valid } from "../valid";
import { getSeason } from "../seasons";
import { useAppState } from "../useAppState";
import BottomSheet from "@gorhom/bottom-sheet";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParams } from "./RootStack";

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

type FeedParams = NativeStackScreenProps<RootStackParams, "Compose">;

export const HaikuForm: FC<FeedParams> = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, {
    haiku: defaultHaiku,
    validity: "unchecked",
  });

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (e.data.action.type !== "GO_BACK") return;
        e.preventDefault();
      }),
    [navigation]
  );

  const {
    publish,
    state: { user },
  } = useAppState();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["40%"], []);

  return (
    <>
      <InputScreen
        validity={state.validity}
        haiku={state.haiku}
        changed={(n, l) =>
          dispatch({ type: "change_line", line: n, newLine: l })
        }
        signature={user?.signature || "<svg></svg>"}
        done={() => {
          dispatch({ type: "submit" });
          setTimeout(() => {
            const syllables = [
              syllable(state.haiku[0]),
              syllable(state.haiku[1]),
              syllable(state.haiku[2]),
            ] as const;

            if (valid(syllables)) {
              publish(state.haiku);
            } else {
              bottomSheetRef.current?.expand();
              dispatch({ type: "invalid" });
            }
          }, AI_WAIT_TIME);
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={{
          shadowColor: "#000",
          backgroundColor: "white",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,

          elevation: 8,
        }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.guideTitle}>How to write a valid Haiku</Text>
          <View style={styles.guideContainer}>
            <Text style={styles.guideLine}>
              1. The first and last lines have 5 syllables each.
            </Text>
            <Text style={styles.guideLine}>
              2. The middle line has 7 syllables.
            </Text>
            <Text style={styles.guideLine}>
              3. Traditionally, it would also incorporate a nature or seasonal
              theme.
            </Text>
          </View>
        </View>
      </BottomSheet>
    </>
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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 15,
  },
  guideTitle: {
    fontFamily: fonts.PlexMonoBold,
    fontSize: 20,
  },
  guideContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  guideLine: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 28,
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
  signature,
  validity,
}: {
  haiku: Haiku;
  changed: (n: 0 | 1 | 2, l: string) => void;
  done: () => void;
  validity: Validity;
  signature: string;
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        {__DEV__ && (
          <Button
            title="prefill"
            onPress={() => {
              changed(0, "one two three four five");
              changed(1, "one two three four five six sev");
              changed(2, "one two three four five");
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
