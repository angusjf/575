import {
  Reducer,
  StaticLifecycle,
  useCallback,
  useReducer,
  useState,
} from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { fonts } from "./src/font";
import { HaikuForm } from "./src/HaikuForm";
import { RegisterForm } from "./src/RegisterForm";
import {
  getUsernameFromStorage,
  getTodaysHaikuFromStorage,
  storeTodaysHaiku,
  clear,
} from "./src/storage";
import { Haiku } from "./src/types";
import { post } from "./firebaseClient";

SplashScreen.preventAutoHideAsync();

type State = { state: "init" };

type Action = { action: "set_username" };

const reducer: Reducer<State, Action> = (state, action) => {};

export function useAppState() {
  const [fontsLoaded] = useFonts({
    [fonts.PlexSerifRegular]: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    [fonts.PlexSerifBoldItalic]: require("./assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
  });

  const [state, dispatch] = useReducer(reducer, { state: "init" });

  const [username, register] = useState<string | null>(null);
  const [todaysHaiku, setTodaysHaiku] = useState<Haiku | null>(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      const usernameFromStorage = await getUsernameFromStorage();
      if (usernameFromStorage) {
        register(usernameFromStorage);

        const haikuFromStorage = await getTodaysHaikuFromStorage();
        if (haikuFromStorage) {
          setTodaysHaiku(haikuFromStorage);
        }
      }
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const publish = (haiku: Haiku) => {
    setTodaysHaiku(haiku);
    post(username, haiku);
    storeTodaysHaiku(haiku);
  };

  return {
    loading: !fontsLoaded,
    onLayoutRootView,
    username,
    register,
    todaysHaiku,
    setTodaysHaiku,
    publish,
  };
}
