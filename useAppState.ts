import { Reducer, useCallback, useReducer } from "react";
import { getDays } from "./firebaseClient";
import { Day } from "./src/types";

type State =
  | { screen: "register" }
  | { screen: "compose"; username: string }
  | { screen: "feed"; days: Day[] | null };

type Action =
  | { type: "set_username"; username: string }
  | { type: "visit_feed" }
  | { type: "set_days"; days: Day[] };

const reducer: Reducer<State, Action> = (state, action) => {
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

  const loadFeed = useCallback(() => {
    dispatch({ type: "visit_feed" });
    getDays().then((days) => dispatch({ type: "set_days", days }));
  }, []);

  return {
    state,
    setUsername,
    loadFeed,
  };
};
