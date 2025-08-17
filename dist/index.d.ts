/**
 * A React hook that provides cross-tab state synchronization.
 *
 * This hook works similarly to React's `useState` but automatically synchronizes
 * state changes across all open browser tabs/windows of the same origin.
 *
 * @template T - The type of the state value. Must be JSON-serializable.
 * @param key - A unique string identifier for this piece of state across tabs.
 *               Must be unique within your application to avoid conflicts.
 * @param initialValue - The initial value for the state when first created.
 *                       This value is used if no existing state is found in localStorage.
 *
 * @returns A tuple containing:
 *          - The current state value
 *          - A setter function that updates the state and syncs across tabs
 *
 * @example
 * ```tsx
 * const [count, setCount] = useCrossTabState('counter', 0);
 *
 * // Update state (automatically syncs across tabs)
 * setCount(count + 1);
 *
 * // Use functional updates
 * setCount(prev => prev + 1);
 * ```
 *
 * @remarks
 * - State is automatically persisted to localStorage
 * - Changes are broadcast to other tabs using BroadcastChannel API
 * - Falls back to localStorage-only sync for older browsers
 * - Only works across tabs of the same origin (protocol + domain + port)
 */
declare function useCrossTabState<T>(key: string, initialValue: T): readonly [T, (value: T | ((prev: T) => T)) => void];

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
declare function useCrossTabReducer<State, Action>(reducer: (state: State, action: Action) => State, initialState: State, key: string): [State, React.Dispatch<Action>];

export { useCrossTabReducer, useCrossTabState };
