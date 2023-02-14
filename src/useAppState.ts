import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase";
import { getDays, post, registerUser } from "./firebaseClient";
import { loadFonts } from "./font";
import { Day, Haiku } from "./types";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useReducerWithEffects } from "./useReducerWithEffects";
import { useEffect } from "react";
import { isToday } from "date-fns";

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

type Msg =
  | { msg: "fonts_loaded" }
  | { msg: "loaded_user"; username: string | null }
  | { msg: "set_username"; username: string }
  | { msg: "visit_feed" }
  | { msg: "set_days"; days: Day[] }
  | { msg: "load_feed" }
  | { msg: "register"; username: string }
  | { msg: "logout" }
  | { msg: "publish"; haiku: Haiku };

const badActionForState = (msg: Msg, state: State): [State, []] => {
  return [
    {
      state: "error",
      message: `bad msg <${msg.msg}> for state <${state.state}>`,
    },
    [],
  ];
};

const finishedLoading = (username: string | null): [State, Effect[]] => {
  if (username === null) {
    return [{ state: "register" }, []];
  } else {
    return [
      { state: "finding_out_if_posted", username },
      [{ effect: "get_days" }],
    ];
  }
};

const hasPostedToday = (username: string, days: Day[]): boolean =>
  days
    .filter((day) => isToday(day.date))
    .flatMap((day) => day.posts)
    .some((post) => post.author === username);

// the big rule for this function is no side effects
// just return some effects if needs be
const reducer = (state: State, msg: Msg): [State, Effect[]] => {
  switch (msg.msg) {
    case "set_username":
      return [{ state: "compose", username: msg.username }, []];
    case "visit_feed":
      return [{ state: "feed", days: null }, []];
    case "set_days":
      if (state.state === "finding_out_if_posted") {
        if (hasPostedToday(state.username, msg.days)) {
          return [
            { state: "feed", days: msg.days },
            [{ effect: "hide_splash" }],
          ];
        } else {
          return [
            { state: "compose", username: state.username },
            [{ effect: "hide_splash" }],
          ];
        }
      }
      return [{ state: "feed", days: msg.days }, []];
    case "loaded_user":
      if (state.state === "loading") {
        if (state.fonts) {
          return finishedLoading(msg.username);
        } else {
          return [
            { state: "loading", fonts: false, username: msg.username },
            [],
          ];
        }
      } else {
        // this runs in a use effect so we must assume it can run at any time
        return [state, []];
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
        return badActionForState(msg, state);
      }
    case "load_feed":
      if (state.state === "loading") {
        return [{ ...state, fonts: true }, [{ effect: "get_days" }]];
      } else if (state.state === "feed") {
        return [state, [{ effect: "get_days" }]];
      } else {
        return badActionForState(msg, state);
      }
    case "register":
      return [
        { state: "compose", username: msg.username },
        [
          {
            effect: "create_user",
            username: msg.username,
          },
        ],
      ];
    case "logout": {
      return [{ state: "register" }, [{ effect: "logout" }]];
    }
    case "publish":
      if (state.state === "compose") {
        return [
          { state: "feed", days: null },
          [
            {
              effect: "post",
              haiku: msg.haiku,
              username: state.username,
            },
          ],
        ];
      } else {
        return badActionForState(msg, state);
      }
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "get_days" }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "create_user"; username: string }
  | { effect: "post"; username: string; haiku: Haiku };

const runEffect = async (effect: Effect): Promise<Msg[]> => {
  switch (effect.effect) {
    case "hide_splash":
      await SplashScreen.hideAsync();
      return [];
    case "get_days":
      const days = await getDays();
      return [{ msg: "set_days", days }];
    case "logout":
      const auth = getAuth(firebaseApp);
      await auth.signOut();
      return [];
    case "load_fonts":
      await loadFonts();
      return [{ msg: "fonts_loaded" }];
    case "post":
      await post(effect.username, effect.haiku);
      return [{ msg: "load_feed" }];
    case "create_user":
      await registerUser(effect.username);
      return [];
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
      dispatch({ msg: "loaded_user", username: user?.displayName ?? null });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    register: (username: string) => dispatch({ msg: "register", username }),
    logout: () => dispatch({ msg: "logout" }),
    publish: (haiku: Haiku) => dispatch({ msg: "publish", haiku }),
  };
};
