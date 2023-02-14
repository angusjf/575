import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase";
import { getDays, post } from "./firebaseClient";
import { loadFonts } from "./font";
import { Day, Haiku } from "./types";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useReducerWithEffects } from "./useReducerWithEffects";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type State =
  | {
      state: "loading";
      fonts: boolean;
      username?: string | null;
    }
  | { state: "finding_out_if_posted"; username: string }
  | { state: "register" }
  | { state: "compose"; username: string }
  | { state: "feed"; days: Day[] | null }
  | { state: "error"; message: string };

type Action =
  | { action: "fonts_loaded" }
  | { action: "loaded_user"; username: string | null }
  | { action: "set_username"; username: string }
  | { action: "visit_feed" }
  | { action: "set_days"; days: Day[] }
  | { action: "load_feed" }
  | { action: "register" }
  | { action: "logout" }
  | { action: "publish" };

const badActionForState = (action: Action, state: State): [State, []] => {
  return [
    {
      state: "error",
      message: `bad action <${action.action}> for state <${state.state}>`,
    },
    [],
  ];
};

const finishedLoading = (username: string | null): [State, Effect[]] => {
  if (username === null) {
    SplashScreen.hideAsync();
    return [{ state: "register" }, []];
  } else {
    return [
      { state: "finding_out_if_posted", username },
      [{ effect: "get_days" }],
    ];
  }
};

const reducer = (state: State, action: Action): [State, Effect[]] => {
  switch (action.action) {
    case "set_username":
      return [{ state: "compose", username: action.username }, []];
    case "visit_feed":
      return [{ state: "feed", days: null }, []];
    case "set_days":
      if (state.state === "loading") {
        SplashScreen.hideAsync();
      }
      return [{ state: "feed", days: action.days }, []];
    case "loaded_user":
      if (state.state === "loading") {
        if (state.fonts) {
          return finishedLoading(action.username);
        } else {
          return [
            { state: "loading", fonts: false, username: action.username },
            [],
          ];
        }
      } else {
        return badActionForState(action, state);
      }
    case "fonts_loaded":
      if (state.state === "loading") {
        if (state.username !== undefined) {
          return finishedLoading(state.username);
        } else {
          return [
            state.state === "loading"
              ? { state: "loading", fonts: true }
              : state,
            [],
          ];
        }
      } else {
        return badActionForState(action, state);
      }
    case "load_feed":
      if (state.state === "loading") {
        return [{ ...state, fonts: true }, [{ effect: "get_days" }]];
      } else {
        return badActionForState(action, state);
      }
    case "register":
      return badActionForState(action, state);
    case "logout": {
      const auth = getAuth(firebaseApp);

      auth.signOut();

      return [{ state: "register" }, []];
    }
    case "publish":
      return badActionForState(action, state);
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "get_days" }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "publish"; username: string; haiku: Haiku };

const runEffect = async (effect: Effect): Promise<Action[]> => {
  switch (effect.effect) {
    case "hide_splash":
      return Promise.resolve([]);
    case "get_days":
      const days = await getDays();
      return [{ action: "set_days", days }];
    case "logout":
      const auth = getAuth(firebaseApp);
      auth.signOut();
      return Promise.resolve([]);
    case "load_fonts":
      await loadFonts();
      return Promise.resolve([{ action: "fonts_loaded" }]);
    case "publish":
      await post(effect.username, effect.haiku);
      return [{ action: "load_feed" }];
  }
};

const init: [State, Effect[]] = [
  { state: "loading", fonts: false },
  [{ effect: "load_fonts" }],
];

export const useAppState = () => {
  const [state, dispatch] = useReducerWithEffects(reducer, runEffect, init);

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch({ action: "loaded_user", username: user?.displayName ?? null });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    register: () => dispatch({ action: "register" }),
    logout: () => dispatch({ action: "logout" }),
    publish: () => dispatch({ action: "publish" }),
  };
};
