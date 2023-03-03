import { useEffect, useReducer, useState } from "react";

export function useReducerWithEffects<
  State,
  Msg extends { msg: string },
  Effect extends { effect: string }
>(
  /* an action changes the state to a new `State`, and possibly triggers some `Effect`s
   * crucially, it doesn't do anything else
   */
  reducer: (state: State, msg: Msg) => [State, Effect[]],
  /* an `Effect` runs some side-effect, and possibly kicks some `Msg`s into the system when it's done
   */
  runEffect: (effect: Effect) => Promise<Msg[]>,
  /* the starting state, and any `Effect`s to run on mount
   */
  [initialState, initialEffects]: [State, Effect[]]
): [State, (msg: Msg) => void] {
  const [effects, setEffects] = useState<Effect[]>(initialEffects);

  const [state, dispatch] = useReducer((state: State, msg: Msg): State => {
    console.log(JSON.stringify(msg));
    const [nextState, effects] = reducer(state, msg);
    setEffects(effects);
    return nextState;
  }, initialState);

  useEffect(() => {
    console.log(effects);
    const nextMsgs = effects.map(runEffect);
    nextMsgs.forEach((promise) =>
      promise.then((resolved) => resolved.forEach(dispatch))
    );
  }, [effects]);

  console.log(JSON.stringify(state));

  return [state, dispatch];
}
