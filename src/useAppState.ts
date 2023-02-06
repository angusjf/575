import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useReducer } from "react";
import { firebaseApp } from "./firebase";
import { getDays, hasPostedToday } from "./firebaseClient";
import { useLoadFonts } from "./font";
import { Day } from "./types";

type State =
  | { screen: "loading_user" }
  | { screen: "loading_haiku"; username: string }
  | { screen: "register" }
  | { screen: "compose"; username: string }
  | { screen: "feed"; days: Day[] | null };

type Action =
  | { type: "set_username"; username: string }
  | { type: "visit_feed" }
  | { type: "set_days"; days: Day[] }
  | { type: "found_out_if_posted"; posted: boolean }
  | { type: "loaded_user"; username: string | null };

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
            hasPostedToday(action.username).then((posted) =>
              dispatch({ type: "found_out_if_posted", posted })
            );
            return { screen: "loading_haiku", username: action.username };
          }
        case "found_out_if_posted":
          if (action.posted) {
            return { screen: "feed", days: null };
          } else {
            return { screen: "compose", username: state.username };
          }
      }
    },
    { screen: "loading_user" }
  );

  const fontsLoaded = useLoadFonts();

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
    const days = await getDays();
    dispatch({ type: "set_days", days });
  }, []);

  return {
    state,
    setUsername,
    loadFeed,
    booting:
      !fontsLoaded &&
      !["loading_haiku", "loading_haiku"].includes(state.screen),
  };
};
