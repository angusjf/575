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
import { Day, Haiku, User } from "./types";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useReducerWithEffects } from "./useReducerWithEffects";
import { createContext, useContext, useEffect } from "react";
import { isToday } from "date-fns";
import { firebaseUserToUser } from "./utils/user";

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
      user?: User | null;
    }
  | { state: "finding_out_if_posted"; user: User }
  | { state: "register" }
  | { state: "compose"; user: User }
  | { state: "feed"; days: Day[] | null; user: User }
  | { state: "error"; message: string }
  | { state: "settings"; user: User };

type Msg =
  | { msg: "fonts_loaded" }
  | { msg: "loaded_user"; user: User | null }
  | { msg: "set_username"; user: User }
  | { msg: "visit_feed"; user: User }
  | { msg: "set_days"; days: Day[] }
  | { msg: "load_feed"; user: User }
  | { msg: "register"; user: User }
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

const hasPostedToday = (user: User, days: Day[]): boolean =>
  days
    .filter((day) => isToday(day.date))
    .flatMap((day) => day.posts)
    .some((post) => post.author.userId === user.userId);

// the big rule for this function is no side effects
// just return some effects if needs be
const reducer = (state: State, msg: Msg): [State, Effect[]] => {
  switch (msg.msg) {
    case "set_username":
      return [{ state: "compose", user: msg.user }, []];
    case "visit_feed":
      return [{ state: "feed", days: null, user: msg.user }, []];
    case "set_days":
      if (state.state === "finding_out_if_posted") {
        return [
          hasPostedToday(state.user, msg.days)
            ? { state: "feed", days: msg.days, user: state.user }
            : { state: "compose", user: state.user },
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
          if (msg.user === null) {
            return [{ state: "register" }, [{ effect: "hide_splash" }]];
          } else {
            return [
              { state: "finding_out_if_posted", user: msg.user },
              [{ effect: "get_days", user: msg.user }],
            ];
          }
        } else {
          return [{ state: "loading", fonts: false, user: msg.user }, []];
        }
      } else {
        // this runs in a use effect so we must assume it can run at any time
        return [state, []];
      }
    case "fonts_loaded":
      if (state.state === "loading") {
        if (state.user !== undefined) {
          if (state.user === null) {
            return [{ state: "register" }, [{ effect: "hide_splash" }]];
          } else {
            return [
              { state: "finding_out_if_posted", user: state.user },
              [{ effect: "get_days", user: state.user }],
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
          [{ effect: "get_days", user: msg.user }],
        ];
      } else if (state.state === "feed") {
        return [state, [{ effect: "get_days", user: state.user }]];
      } else {
        return badActionForState(msg, state);
      }
    case "register":
      return [{ state: "compose", user: msg.user }, []];
    case "logout": {
      return [{ state: "register" }, [{ effect: "logout" }]];
    }
    case "publish":
      if (state.state === "compose") {
        return [
          { state: "feed", days: null, user: state.user },
          [
            {
              effect: "post",
              haiku: msg.haiku,
              user: state.user,
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
              user: state.user,
              blockedUserId: msg.blockedUserId,
            },
          ],
        ];
      }
      return badActionForState(msg, state);
    case "open_settings":
      if (state.state === "feed") {
        return [{ state: "settings", user: state.user }, []];
      } else {
        return badActionForState(msg, state);
      }
    case "delete_account":
      if (state.state === "settings") {
        return [state, [{ effect: "delete_user", user: state.user }]];
      } else {
        return badActionForState(msg, state);
      }
    case "account_deleted":
      return [{ state: "register" }, []];
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "get_days"; user: User }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "create_user"; user: User }
  | { effect: "post"; user: User; haiku: Haiku }
  | { effect: "block_user"; user: User; blockedUserId: string }
  | { effect: "delete_user"; user: User };

const runEffect = async (effect: Effect): Promise<Msg[]> => {
  switch (effect.effect) {
    case "hide_splash":
      await SplashScreen.hideAsync();
      return [];
    case "get_days":
      const days = await getDays(effect.user);
      return [{ msg: "set_days", days }];
    case "logout":
      const auth = getAuth(firebaseApp);
      await auth.signOut();
      return [];
    case "load_fonts":
      await loadFonts();
      return [{ msg: "fonts_loaded" }];
    case "post":
      await post(effect.user, effect.haiku);
      return [{ msg: "load_feed", user: effect.user }];
    case "create_user":
      await registerUser(effect.user);
      return [];
    case "block_user":
      await blockUser(effect.user, effect.blockedUserId);
      return [{ msg: "load_feed", user: effect.user }];
    case "delete_user":
      await deleteAccount();
      return [{ msg: "account_deleted" }];
  }
};

const init: [State, Effect[]] = [
  { state: "loading", fonts: false },
  [{ effect: "load_fonts" }],
];

type AppContextType = {
  state: State;
  register: (user: User) => void;
  logout: () => void;
  publish: (haiku: Haiku) => void;
  blockUser: (blockedUserId: string) => void;
  refreshFeed: () => void;
  openSettings: () => void;
  deleteAccount: () => void;
};

const AppContext = createContext<AppContextType>({
  state: init[0],
  register: (user: User) => {},
  logout: () => {},
  publish: (haiku: Haiku) => {},
  blockUser: (blockedUserId: string) => {},
  refreshFeed: () => {},
  openSettings: () => {},
  deleteAccount: () => {},
});

export const AppStateProvider = (props: any) => {
  const [state, dispatch] = useReducerWithEffects(reducer, runEffect, init);

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch({
        msg: "loaded_user",
        user: user === null ? user : firebaseUserToUser(user),
      });
    });
    return unsubscribe;
  }, []);

  const context: AppContextType = {
    state,
    register: (user: User) => dispatch({ msg: "register", user }),
    logout: () => dispatch({ msg: "logout" }),
    publish: (haiku: Haiku) => dispatch({ msg: "publish", haiku }),
    blockUser: (blockedUserId: string) => {
      dispatch({ msg: "block_user", blockedUserId });
    },
    refreshFeed: () => {
      if (state.state === "feed") {
        dispatch({ msg: "load_feed", user: state.user });
      }
    },
    openSettings: () => {
      dispatch({ msg: "open_settings" });
    },
    deleteAccount: () => dispatch({ msg: "delete_account" }),
  };

  return <AppContext.Provider value={context} {...props} />;
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};