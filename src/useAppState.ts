import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase";
import {
  blockUser,
  deleteAccount,
  getDays,
  post,
  registerUser,
} from "./firebaseClient";
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
  | { state: "feed"; days: Day[] | null; username: string }
  | { state: "error"; message: string }
  | { state: "settings"; user: string };

type Msg =
  | { msg: "fonts_loaded" }
  | { msg: "loaded_user"; username: string | null }
  | { msg: "set_username"; username: string }
  | { msg: "visit_feed"; username: string }
  | { msg: "set_days"; days: Day[] }
  | { msg: "load_feed"; username: string }
  | { msg: "register"; username: string }
  | { msg: "logout" }
  | { msg: "publish"; haiku: Haiku }
  | { msg: "block_user"; blockedUserId: string }
  | { msg: "open_settings" }
  | { msg: "delete_account" }
  | { msg: "account_deleted" };

const badActionForState = (msg: Msg, state: State): [State, []] => {
  return [
    {
      state: "error",
      message: `bad msg <${msg.msg}> for state <${state.state}>`,
    },
    [],
  ];
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
      return [{ state: "feed", days: null, username: msg.username }, []];
    case "set_days":
      if (state.state === "finding_out_if_posted") {
        return [
          hasPostedToday(state.username, msg.days)
            ? { state: "feed", days: msg.days, username: state.username }
            : { state: "compose", username: state.username },
          [{ effect: "hide_splash" }],
        ];
      } else if (state.state === "feed") {
        console.log("set_days", msg.days);
        return [{ ...state, days: msg.days }, []];
      } else {
        return badActionForState(msg, state);
      }
    case "loaded_user":
      if (state.state === "loading") {
        if (state.fonts) {
          if (msg.username === null) {
            return [{ state: "register" }, [{ effect: "hide_splash" }]];
          } else {
            return [
              { state: "finding_out_if_posted", username: msg.username },
              [{ effect: "get_days", username: msg.username }],
            ];
          }
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
          if (state.username === null) {
            return [{ state: "register" }, [{ effect: "hide_splash" }]];
          } else {
            return [
              { state: "finding_out_if_posted", username: state.username },
              [{ effect: "get_days", username: state.username }],
            ];
          }
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
        return [
          { ...state, fonts: true },
          [{ effect: "get_days", username: msg.username }],
        ];
      } else if (state.state === "feed") {
        return [state, [{ effect: "get_days", username: state.username }]];
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
          { state: "feed", days: null, username: state.username },
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
    case "block_user":
      if (state.state === "feed") {
        return [
          state,
          [
            {
              effect: "block_user",
              username: state.username,
              blockedUserId: msg.blockedUserId,
            },
          ],
        ];
      }
      return badActionForState(msg, state);
    case "open_settings":
      if (state.state === "feed") {
        return [{ state: "settings", user: state.username }, []];
      } else {
        return badActionForState(msg, state);
      }
    case "delete_account":
      if (state.state === "settings") {
        return [state, [{ effect: "delete_user", username: state.user }]];
      } else {
        return badActionForState(msg, state);
      }
    case "account_deleted":
      return [{ state: "register" }, []];
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "get_days"; username: string }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "create_user"; username: string }
  | { effect: "post"; username: string; haiku: Haiku }
  | { effect: "block_user"; username: string; blockedUserId: string }
  | { effect: "delete_user"; username: string };

const runEffect = async (effect: Effect): Promise<Msg[]> => {
  switch (effect.effect) {
    case "hide_splash":
      await SplashScreen.hideAsync();
      return [];
    case "get_days":
      const days = await getDays(effect.username);
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
      return [{ msg: "load_feed", username: effect.username }];
    case "create_user":
      await registerUser(effect.username);
      return [];
    case "block_user":
      await blockUser(effect.username, effect.blockedUserId);
      return [{ msg: "load_feed", username: effect.username }];
    case "delete_user":
      await deleteAccount();
      return [{ msg: "account_deleted" }];
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
    blockUser: (blockedUserId: string) => {
      dispatch({ msg: "block_user", blockedUserId });
    },
    refreshFeed: () => {
      if (state.state === "feed") {
        dispatch({ msg: "load_feed", username: state.username });
      }
    },
    openSettings: () => {
      dispatch({ msg: "open_settings" });
    },
    deleteAccount: () => dispatch({ msg: "delete_account" }),
  };
};
