import { useEffect, useReducer, useState } from "react";

export function useReducerWithEffects<
  State extends { state: string },
  Action extends { action: string },
  Effect extends { effect: string }
>(
  // an action changes the state, and possibly triggers some effects
  reducer: (state: State, action: Action) => [State, Effect[]],
  // an effect runs some side-effect
  runEffect: (effect: Effect) => Promise<Action[]>,
  // starting state and effects to run
  [initialState, initialEffects]: [State, Effect[]]
): [State, (action: Action) => void] {
  const [effects, setEffects] = useState<Effect[]>(initialEffects);

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      console.log(JSON.stringify(action));
      const [nextState, effects] = reducer(state, action);
      setEffects(effects);
      return nextState;
    },
    initialState
  );

  useEffect(() => {
    console.log(effects);
    const nextActions = effects.map(runEffect);
    nextActions.forEach((promise) =>
      promise.then((resolved) => resolved.forEach(dispatch))
    );
  }, [effects]);

  console.log(JSON.stringify(state));

  return [state, dispatch];
}
