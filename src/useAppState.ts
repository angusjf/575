import { getAuth } from "firebase/auth";
import { Reducer, useCallback, useEffect, useReducer } from "react";
import { firebaseApp } from "./firebase";
import { getDays } from "./firebaseClient";
import { Day } from "./types";

type State =
  | { screen: "register" }
  | { screen: "compose"; username: string }
  | { screen: "feed"; days: Day[] | null };

type Action =
  | { type: "set_username"; username: string }
  | { type: "visit_feed" }
  | { type: "set_days"; days: Day[] };

const reducer: Reducer<State, Action> = (_state, action) => {
  switch (action.type) {
    case "set_username":
      return { screen: "compose", username: action.username };
    case "visit_feed":
      return { screen: "feed", days: null };
    case "set_days":
      return { screen: "feed", days: action.days };
  }
};

export const useAppState = () => {
  const [state, dispatch] = useReducer(reducer, { screen: "register" });

  const setUsername = useCallback(
    (username: string) => dispatch({ type: "set_username", username }),
    []
  );

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsername(user.displayName ?? "");
      }
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
  };
};
