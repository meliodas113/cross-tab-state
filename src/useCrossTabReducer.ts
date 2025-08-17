import { useState, useEffect, useCallback } from "react";

/**
 * A React hook that provides cross-tab state synchronization using the reducer pattern.
 *
 * This hook works similarly to React's `useReducer` but automatically synchronizes
 * state changes across all open browser tabs/windows of the same origin.
 *
 * @template State - The type of the state object. Must be JSON-serializable.
 * @template Action - The type of actions that can be dispatched to the reducer.
 * @param reducer - A pure function that takes the current state and an action,
 *                  and returns the new state. Should handle all possible action types.
 * @param initialState - The initial state value when first created.
 *                       This value is used if no existing state is found in localStorage.
 * @param key - A unique string identifier for this piece of state across tabs.
 *              Must be unique within your application to avoid conflicts.
 *
 * @returns A tuple containing:
 *          - The current state value
 *          - A dispatch function that sends actions to the reducer and syncs across tabs
 *
 * @example
 * ```tsx
 * const todoReducer = (state, action) => {
 *   switch (action.type) {
 *     case 'ADD_TODO':
 *       return [...state, action.payload];
 *     case 'REMOVE_TODO':
 *       return state.filter(todo => todo.id !== action.payload);
 *     default:
 *       return state;
 *   }
 * };
 *
 * const [todos, dispatch] = useCrossTabReducer(todoReducer, [], 'todos');
 *
 * // Dispatch actions (automatically syncs across tabs)
 * dispatch({ type: 'ADD_TODO', payload: { id: 1, text: 'New todo' } });
 * ```
 *
 * @remarks
 * - State is automatically persisted to localStorage
 * - Changes are synchronized via localStorage events (no BroadcastChannel for performance)
 * - Only works across tabs of the same origin (protocol + domain + port)
 * - Uses localStorage-only sync for better performance with complex state objects
 */
export function useCrossTabReducer<State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  key: string
): [State, React.Dispatch<Action>] {
  // Initialize state with value from localStorage if available, otherwise use initialState
  // This ensures state persists across page reloads and is available immediately
  const [state, setState] = useState<State>(() => {
    try {
      // Attempt to retrieve existing state from localStorage
      const stored = localStorage.getItem(key);
      // If stored state exists, parse it from JSON; otherwise use initialState
      return stored ? (JSON.parse(stored) as State) : initialState;
    } catch (error) {
      // If JSON parsing fails (e.g., corrupted data), fall back to initialState
      console.warn(
        `Failed to parse localStorage value for key "${key}":`,
        error
      );
      return initialState;
    }
  });

  /**
   * Dispatch function that sends actions to the reducer and synchronizes state across tabs.
   *
   * @param action - The action object to be processed by the reducer function.
   *                 The action should contain a `type` property and any additional data.
   *
   * @remarks
   * This function:
   * 1. Calls the reducer with the current state and action to get new state
   * 2. Updates the local state using React's setState
   * 3. Persists the new state to localStorage for cross-tab synchronization
   * 4. Uses useCallback to maintain referential stability across re-renders
   */
  const dispatch = useCallback(
    (action: Action) => {
      setState((prev) => {
        // Use the reducer function to calculate the new state based on the action
        const newState = reducer(prev, action);

        // Persist the new state to localStorage for persistence across page reloads
        // This also triggers the storage event in other tabs for synchronization
        try {
          localStorage.setItem(key, JSON.stringify(newState));
        } catch (error) {
          // Handle localStorage errors (e.g., quota exceeded, private browsing mode)
          console.warn(
            `Failed to save state to localStorage for key "${key}":`,
            error
          );
        }

        // Return the new state to update the local state
        return newState;
      });
    },
    [key, reducer] // Dependencies for useCallback - only recreate if key or reducer changes
  );

  // Set up cross-tab synchronization via localStorage events
  useEffect(() => {
    /**
     * Event handler for localStorage changes from other tabs.
     * This function is called whenever localStorage is modified in another tab.
     *
     * @param e - The StorageEvent containing information about the storage change
     */
    const handler = (e: StorageEvent) => {
      // Only process events for this specific state key
      if (e.key === key && e.newValue) {
        try {
          // Parse the new value from the storage event and update local state
          setState(JSON.parse(e.newValue) as State);
        } catch (error) {
          // If JSON parsing fails, log a warning but don't crash
          console.warn(
            `Failed to parse storage event value for key "${key}":`,
            error
          );
        }
      }
    };

    // Add the storage event listener to the window
    // This event fires when localStorage is modified in other tabs
    window.addEventListener("storage", handler);

    // Cleanup function to remove the event listener
    // This prevents memory leaks and ensures proper cleanup when the component unmounts
    return () => window.removeEventListener("storage", handler);
  }, [key]); // Only re-run effect if the key changes

  // Return the current state and dispatch function
  // The dispatch function handles both local state updates and cross-tab synchronization
  return [state, dispatch];
}
