import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useReducer } from "react";
import { firebaseApp } from "./firebase";
import { registerForPushNotificationsAsync } from "./components/useNotifications";
import {
  getDays,
  hasPostedToday,
  post,
  uploadExpoPushToken,
} from "./firebaseClient";
import { loadFonts } from "./font";
import { Day, Haiku } from "./types";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";

// SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type State =
  | {
      screen: "loading";
      fonts: boolean;
      username?: string | null;
      feed?: Day[] | null;
    }
  | { screen: "register" }
  | { screen: "compose"; username: string }
  | { screen: "feed"; days: Day[] | null };

type Action =
  | { type: "fonts_loaded" }
  | { type: "loaded_user"; username: string | null }
  | { type: "found_out_if_posted"; posted: boolean }
  | { type: "set_username"; username: string }
  | { type: "visit_feed" }
  | { type: "set_days"; days: Day[] };

export const useAppState = () => {
  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "set_username":
          return { screen: "compose", username: action.username };
        case "visit_feed":
          return { screen: "feed", days: null };
        case "set_days":
          return { screen: "feed", days: action.days };
        case "loaded_user":
          if (action.username === null) {
            return { screen: "register" };
          } else {
            SplashScreen.hideAsync();
            hasPostedToday(action.username).then((posted) =>
              dispatch({ type: "found_out_if_posted", posted })
            );
            return {
              screen: "loading",
              username: action.username,
              fonts: true,
            };
          }
        case "found_out_if_posted":
          if (action.posted) {
            getDays().then((days) => dispatch({ type: "set_days", days }));
            return { screen: "feed", days: null };
          } else {
            return { screen: "compose", username: "state.username" };
          }
        case "fonts_loaded":
          return state.screen === "loading" ? { ...state, fonts: true } : state;
      }
    },
    { screen: "loading", fonts: false, feed: undefined, username: undefined }
  );

  console.log(state);
  useEffect(() => {
    loadFonts()
      .then(() => dispatch({ type: "fonts_loaded" }))
      .catch(console.error);
  }, []);

  const setUsername = useCallback(
    (username: string) => dispatch({ type: "set_username", username }),
    []
  );

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch({ type: "loaded_user", username: user?.displayName ?? null });
    });
    return unsubscribe;
  }, []);

  const loadFeed = useCallback(async () => {
    dispatch({ type: "visit_feed" });
    try {
      const days = await getDays();
      dispatch({ type: "set_days", days });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const register = (username: string) => {
    setUsername(username);
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        uploadExpoPushToken({ userId: username, token });
      }
    });
  };

  const logout = () => {
    const auth = getAuth(firebaseApp);
    auth.signOut();
  };

  const publish = async (haiku: Haiku) => {
    if (state.screen === "compose") {
      await post(state.username, haiku);
      loadFeed();
    }
  };

  return {
    state,
    register,
    logout,
    publish,
  };
};
