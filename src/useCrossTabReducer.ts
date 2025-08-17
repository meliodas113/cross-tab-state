import { useState, useEffect, useCallback } from "react";

export function useCrossTabReducer<State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  key: string
): [State, React.Dispatch<Action>] {
  const [state, setState] = useState<State>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as State) : initialState;
    } catch {
      return initialState;
    }
  });

  const dispatch = useCallback(
    (action: Action) => {
      setState((prev) => {
        const newState = reducer(prev, action);
        localStorage.setItem(key, JSON.stringify(newState));
        return newState;
      });
    },
    [key, reducer]
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setState(JSON.parse(e.newValue) as State);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [state, dispatch];
}
