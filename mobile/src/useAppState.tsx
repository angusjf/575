import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase";
import {
  blockUser,
  deleteAccount,
  getBlockingUsers,
  getDays,
  getUser,
  incStreak,
  post,
  reportUser,
  unblockUser,
  updateSignature,
  updateUsername,
  uploadExpoPushToken,
} from "./firebaseClient";
import { loadFonts } from "./font";
import { BlockedUser, Day, Haiku, User } from "./types";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as Network from "expo-network";
import { useReducerWithEffects } from "./useReducerWithEffects";
import { createContext, useContext, useEffect } from "react";
import { isToday } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { registerForPushNotificationsAsync } from "./components/useNotifications";
import { AppState } from "react-native";
import { AppStateStatus } from "react-native";

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
  blockedUsers: BlockedUser[] | undefined;
  offline: boolean | undefined;
};

type Msg =
  | { msg: "fonts_loaded" }
  | { msg: "loaded_user"; user: User | null }
  | { msg: "set_username"; user: User }
  | { msg: "visit_feed"; user: User }
  | { msg: "set_days"; days: Day[]; blockedUsers: BlockedUser[] }
  | { msg: "load_feed"; user: User }
  | { msg: "register"; user: User }
  | { msg: "logout" }
  | { msg: "publish"; haiku: Haiku; location: string | undefined }
  | {
      msg: "block_user";
      blockedUserId: string;
      blockedUserName: string;
      report: boolean;
    }
  | { msg: "open_settings" }
  | { msg: "delete_account"; password: string }
  | { msg: "account_deleted" }
  | { msg: "finish_onboarding" }
  | { msg: "unblock_user"; blockedUserId: string }
  | { msg: "update_signature"; signature: string }
  | { msg: "update_username"; username: string }
  | { msg: "network_checked"; reachable: boolean }
  | { msg: "app_state_changed"; appState: AppStateStatus };

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
        // This is when we first load the feed
        const newState = {
          ...state,
          days: msg.days,
          user: state.user,
          loading: false,
          blockedUsers: msg.blockedUsers,
        };
        return hasPostedToday(state.user!, msg.days)
          ? [
              newState,
              [
                { effect: "hide_splash" },
                { effect: "navigate", route: "Feed" },
              ],
            ]
          : [
              newState,
              [
                { effect: "hide_splash" },
                { effect: "navigate", route: "Compose" },
              ],
            ];
      } else {
        // This is when we refresh the feed
        return [
          { ...state, days: msg.days, blockedUsers: msg.blockedUsers },
          [],
        ];
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
      // if (state.offline) { TODO - OFFLINE
      //   return [
      //     { ...state, loading: false },
      //     [{ effect: "hide_splash" }, { effect: "navigate", route: "Compose" }],
      //   ];
      // }
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
        [
          { effect: "navigate", route: "Compose" },
          { effect: "register_for_notifications", userId: msg.user.userId },
        ],
      ];
    case "logout": {
      return [
        {
          ...state,
          fonts: true,
          loading: false,
          days: undefined,
          user: null,
          blockedUsers: undefined,
        },
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
            location: msg.location,
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
            blockedUserName: msg.blockedUserName,
          },
          ...(msg.report
            ? [
                {
                  effect: "report_user" as const,
                  reporterId: state.user!.userId,
                  badGuyId: msg.blockedUserId,
                },
              ]
            : []),
        ],
      ];
    case "unblock_user":
      return [
        state,
        [
          {
            effect: "unblock_user",
            user: state.user!,
            blockedUserId: msg.blockedUserId,
          },
        ],
      ];
    case "update_signature":
      if (!state.user) return [state, []];
      return [
        { ...state, user: { ...state.user, signature: msg.signature } },
        [
          {
            effect: "update_signature",
            signature: msg.signature,
            user: state.user,
          },
        ],
      ];
    case "update_username":
      if (!state.user) return [state, []];
      return [
        { ...state, user: { ...state.user, username: msg.username } },
        [
          {
            effect: "update_username",
            username: msg.username,
            user: state.user,
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
      return [state, [{ effect: "navigate", route: "Email" }]];
    case "network_checked":
      return [{ ...state, offline: !msg.reachable }, []];
    case "app_state_changed":
      if (state.offline) {
        // if you reopen the app, check the network status again
        return [state, [{ effect: "check_network_status" }]];
      }
      if (msg.appState === "active") {
        // the app re-opened...
        // if sun has set and risen,
        // move back to compose
        if (
          state.user &&
          state.days &&
          !hasPostedToday(state.user, state.days)
        ) {
          return [state, [{ effect: "navigate", route: "Compose" }]];
        }
      }
      return [state, []];
  }
};

type Effect =
  | { effect: "hide_splash" }
  | { effect: "check_network_status" }
  | { effect: "get_days"; user: User }
  | { effect: "logout" }
  | { effect: "load_fonts" }
  | { effect: "post"; user: User; haiku: Haiku; location: string | undefined }
  | {
      effect: "block_user";
      user: User;
      blockedUserId: string;
      blockedUserName: string;
    }
  | { effect: "delete_user"; user: User; password: string }
  | { effect: "navigate"; route: string }
  | { effect: "register_for_notifications"; userId: string }
  | { effect: "unblock_user"; user: User; blockedUserId: string }
  | { effect: "update_signature"; user: User; signature: string }
  | { effect: "update_username"; user: User; username: string }
  | { effect: "report_user"; reporterId: string; badGuyId: string };

const runEffect =
  (navigate: (route: string) => void) =>
  async (effect: Effect): Promise<Msg[]> => {
    switch (effect.effect) {
      case "check_network_status":
        const networkState = await Network.getNetworkStateAsync();
        return [
          {
            msg: "network_checked",
            reachable: !!networkState.isInternetReachable,
          },
        ];
      case "hide_splash":
        await SplashScreen.hideAsync();
        return [];
      case "get_days":
        const days = await getDays(effect.user);
        const blockedUsers = await getBlockingUsers(effect.user);
        return [{ msg: "set_days", days, blockedUsers }];
      case "logout":
        const auth = getAuth(firebaseApp);
        await auth.signOut();
        return [];
      case "load_fonts":
        await loadFonts();
        return [{ msg: "fonts_loaded" }];
      case "post":
        await post(effect.user, effect.haiku, effect.location ?? null);
        incStreak(effect.user.userId);
        return [{ msg: "load_feed", user: effect.user }];
      case "block_user":
        await blockUser(
          effect.user,
          effect.blockedUserId,
          effect.blockedUserName
        );
        return [{ msg: "load_feed", user: effect.user }];
      case "unblock_user":
        await unblockUser(effect.user, effect.blockedUserId);
        return [{ msg: "load_feed", user: effect.user }];
      case "update_signature":
        await updateSignature(effect.user, effect.signature);
        return [{ msg: "load_feed", user: effect.user }];
      case "update_username":
        await updateUsername(effect.user, effect.username);
        return [];
      case "delete_user":
        try {
          await deleteAccount(effect.password);
          return [{ msg: "account_deleted" }];
        } catch (e) {
          console.log(e);
          return [];
        }
      case "register_for_notifications":
        const token = await registerForPushNotificationsAsync();
        console.log("reg", token);
        if (token) {
          uploadExpoPushToken({ userId: effect.userId, token });
        }
        return [];
      case "report_user":
        reportUser({
          reporterId: effect.reporterId,
          badGuyId: effect.badGuyId,
        });
        return [];
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
    blockedUsers: undefined,
    offline: undefined,
  },
  [{ effect: "load_fonts" }, { effect: "check_network_status" }],
];

type AppContextType = {
  state: State;
  register: (user: User) => void;
  logout: () => void;
  publish: (haiku: Haiku, location: string | undefined) => void;
  blockUser: (
    blockedUserId: string,
    blockedUserName: string,
    report: boolean
  ) => void;
  refreshFeed: () => void;
  openSettings: () => void;
  deleteAccount: (password: string) => void;
  finishOnboarding: () => void;
  unblockUser: (blockedUserId: string) => void;
  updateSignature: (signature: string) => void;
  updateUsername: (username: string) => void;
};

const AppContext = createContext<AppContextType>({
  state: init[0],
  register: () => {},
  logout: () => {},
  publish: () => {},
  blockUser: () => {},
  refreshFeed: () => {},
  openSettings: () => {},
  deleteAccount: () => {},
  finishOnboarding: () => {},
  unblockUser: () => {},
  updateSignature: () => {},
  updateUsername: () => {},
});

export const AppStateProvider = (props: any) => {
  const { navigate } = useNavigation();

  const [state, dispatch] = useReducerWithEffects(
    reducer,
    runEffect(navigate),
    init
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (appState) =>
      dispatch({ msg: "app_state_changed", appState })
    );
    return () => sub.remove();
  });

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser === null) {
        dispatch({
          msg: "loaded_user",
          user: null,
        });
      } else {
        const user = await getUser(firebaseUser);
        dispatch({
          msg: "loaded_user",
          user,
        });
      }
    });
    return unsubscribe;
  }, [dispatch]);

  const context: AppContextType = {
    state,
    register: (user: User) => dispatch({ msg: "register", user }),
    logout: () => dispatch({ msg: "logout" }),
    publish: (haiku: Haiku, location: string | undefined) =>
      dispatch({ msg: "publish", haiku, location }),
    blockUser: (
      blockedUserId: string,
      blockedUserName: string,
      report: boolean
    ) =>
      dispatch({ msg: "block_user", blockedUserId, blockedUserName, report }),
    refreshFeed: () => dispatch({ msg: "load_feed", user: state.user! }),
    openSettings: () => dispatch({ msg: "open_settings" }),
    deleteAccount: (password: string) =>
      dispatch({ msg: "delete_account", password }),
    finishOnboarding: () => dispatch({ msg: "finish_onboarding" }),
    unblockUser: (blockedUserId: string) =>
      dispatch({ msg: "unblock_user", blockedUserId }),
    updateSignature: (signature: string) =>
      dispatch({ msg: "update_signature", signature }),
    updateUsername: (username: string) =>
      dispatch({ msg: "update_username", username }),
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
