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
import { useNavigation } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type State = {
  loading: boolean;
  fonts: boolean;
  user: User | null | undefined;
  days: Day[] | undefined;
};

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
  | { msg: "delete_account"; password: string }
  | { msg: "account_deleted" }
  | { msg: "finish_onboarding" };

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
      return [{ ...state, user: msg.user }, []];
    case "visit_feed":
      return [{ ...state, user: msg.user }, []];
    case "set_days":
      if (!state.days) {
        return hasPostedToday(state.user!, msg.days)
          ? [
              { ...state, days: msg.days, user: state.user, loading: false },
              [
                { effect: "hide_splash" },
                { effect: "navigate", route: "Feed" },
              ],
            ]
          : [
              { ...state, user: state.user, loading: false },
              [
                { effect: "hide_splash" },
                { effect: "navigate", route: "Compose" },
              ],
            ];
      } else {
        console.log("set_days", msg.days);
        return [{ ...state, days: msg.days }, []];
      }
    case "loaded_user":
      if (state.fonts) {
        if (msg.user === null) {
          return [
            { ...state, loading: false },
            [
              { effect: "hide_splash" },
              { effect: "navigate", route: "Onboarding" },
            ],
          ];
        } else {
          return [
            { ...state, loading: false, user: msg.user },
            [{ effect: "get_days", user: msg.user }],
          ];
        }
      } else {
        return [{ ...state, fonts: false, user: msg.user }, []];
      }
    case "fonts_loaded":
      if (state.user !== undefined) {
        if (state.user === null) {
          return [
            state,
            [
              { effect: "hide_splash" },
              { effect: "navigate", route: "Onboarding" },
            ],
          ];
        } else {
          return [
            { ...state, user: state.user },
            [{ effect: "get_days", user: state.user }],
          ];
        }
      } else {
        return [state.loading ? { ...state, fonts: true } : state, []];
      }
    case "load_feed":
      if (state.loading) {
        return [
          { ...state, fonts: true },
          [{ effect: "get_days", user: msg.user }],
        ];
      } else {
        return [state, [{ effect: "get_days", user: state.user! }]];
      }
    case "register":
      return [
        { ...state, user: msg.user },
        [{ effect: "navigate", route: "Compose" }],
      ];
    case "logout": {
      return [
        { ...state, fonts: true, loading: false },
        [{ effect: "logout" }, { effect: "navigate", route: "Onboarding" }],
      ];
    }
    case "publish":
      return [
        { ...state, days: undefined, user: state.user },
        [
          {
            effect: "post",
            haiku: msg.haiku,
            user: state.user!,
          },
          { effect: "navigate", route: "Feed" },
        ],
      ];
    case "block_user":
      return [
        state,
        [
          {
            effect: "block_user",
            user: state.user!,
            blockedUserId: msg.blockedUserId,
          },
        ],
      ];
    case "open_settings":
      return [
        { ...state, user: state.user },
        [{ effect: "navigate", route: "Settings" }],
      ];
    case "delete_account":
      return [
        state,
        [{ effect: "delete_user", user: state.user!, password: msg.password }],
      ];
    case "account_deleted":
      return [state, [{ effect: "navigate", route: "Onboarding" }]];
    case "finish_onboarding":
      return [state, [{ effect: "navigate", route: "Register" }]];
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "get_days"; user: User }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "post"; user: User; haiku: Haiku }
  | { effect: "block_user"; user: User; blockedUserId: string }
  | { effect: "delete_user"; user: User; password: string }
  | { effect: "navigate"; route: string };

const runEffect =
  (navigate: (route: string) => void) =>
  async (effect: Effect): Promise<Msg[]> => {
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
      case "block_user":
        await blockUser(effect.user, effect.blockedUserId);
        return [{ msg: "load_feed", user: effect.user }];
      case "delete_user":
        try {
          await deleteAccount(effect.password);
          return [{ msg: "account_deleted" }];
        } catch (e) {
          console.log(e);
          return [];
        }
      case "navigate":
        navigate(effect.route);
        return [];
    }
  };

const init: [State, Effect[]] = [
  {
    loading: true,
    fonts: false,
    days: undefined,
    user: undefined,
  },
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
  deleteAccount: (password: string) => void;
  finishOnboarding: () => void;
};

const AppContext = createContext<AppContextType>({
  state: init[0],
  register: (user: User) => {},
  logout: () => {},
  publish: (haiku: Haiku) => {},
  blockUser: (blockedUserId: string) => {},
  refreshFeed: () => {},
  openSettings: () => {},
  deleteAccount: (password: string) => {},
  finishOnboarding: () => {},
});

export const AppStateProvider = (props: any) => {
  const { navigate } = useNavigation();

  const [state, dispatch] = useReducerWithEffects(
    reducer,
    runEffect(navigate),
    init
  );

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
    blockUser: (blockedUserId: string) =>
      dispatch({ msg: "block_user", blockedUserId }),
    refreshFeed: () => dispatch({ msg: "load_feed", user: state.user! }),
    openSettings: () => dispatch({ msg: "open_settings" }),
    deleteAccount: (password: string) =>
      dispatch({ msg: "delete_account", password }),
    finishOnboarding: () => dispatch({ msg: "finish_onboarding" }),
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
