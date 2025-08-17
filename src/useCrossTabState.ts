import { useState, useEffect, useRef } from "react";

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
export function useCrossTabState<T>(key: string, initialValue: T) {
  // Initialize state with value from localStorage if available, otherwise use initialValue
  // This ensures state persists across page reloads and is available immediately
  const [state, setState] = useState<T>(() => {
    try {
      // Attempt to retrieve existing state from localStorage
      const saved = localStorage.getItem(key);
      // If saved state exists, parse it from JSON; otherwise use initialValue
      return saved ? JSON.parse(saved) : initialValue;
    } catch (error) {
      // If JSON parsing fails (e.g., corrupted data), fall back to initialValue
      console.warn(
        `Failed to parse localStorage value for key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // Reference to the BroadcastChannel for real-time communication between tabs
  // Using useRef to maintain the same channel instance across re-renders
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Set up cross-tab communication and storage event listeners
  useEffect(() => {
    // Create a BroadcastChannel for real-time communication between tabs
    // All tabs using the same channel name can communicate with each other
    const channel = new BroadcastChannel("cross-tab-state");
    channelRef.current = channel;

    // Listen for messages from other tabs
    // When another tab updates state, this tab receives the message and updates locally
    channel.onmessage = (event) => {
      // Only update if the message is for this specific state key
      if (event.data.key === key) {
        setState(event.data.value);
      }
    };

    // Listen for localStorage changes from other tabs
    // This is a fallback mechanism for when BroadcastChannel isn't available
    // or for older browsers that don't support it
    const onStorage = (e: StorageEvent) => {
      // Only update if the storage change is for this specific key
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Failed to parse storage event value for key "${key}":`,
            error
          );
        }
      }
    };

    // Add the storage event listener to the window
    // This event fires when localStorage is modified in other tabs
    window.addEventListener("storage", onStorage);

    // Cleanup function to remove event listeners and close the channel
    // This prevents memory leaks and ensures proper cleanup when the component unmounts
    return () => {
      channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [key]); // Only re-run effect if the key changes

  /**
   * Custom setter function that updates state locally and synchronizes across tabs.
   *
   * @param value - The new state value or a function that receives the previous state
   *                and returns the new state (similar to React's setState)
   *
   * @remarks
   * This function:
   * 1. Updates the local state using React's setState
   * 2. Persists the new state to localStorage
   * 3. Broadcasts the change to other tabs via BroadcastChannel
   * 4. Supports both direct values and functional updates
   */
  const setCrossTabState = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      // Calculate the new state value
      // If value is a function, call it with the previous state
      // If value is a direct value, use it as-is
      const newValue =
        typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

      // Persist the new state to localStorage for persistence across page reloads
      // This also triggers the storage event in other tabs as a fallback
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        // Handle localStorage errors (e.g., quota exceeded, private browsing mode)
        console.warn(
          `Failed to save state to localStorage for key "${key}":`,
          error
        );
      }

      // Broadcast the state change to other tabs via BroadcastChannel
      // This provides real-time synchronization without waiting for storage events
      try {
        channelRef.current?.postMessage({ key, value: newValue });
      } catch (error) {
        // Handle BroadcastChannel errors (e.g., channel closed, unsupported)
        console.warn(
          `Failed to broadcast state change for key "${key}":`,
          error
        );
      }

      // Return the new value to update the local state
      return newValue;
    });
  };

  // Return the state and custom setter function
  // The setter function handles both local state updates and cross-tab synchronization
  return [state, setCrossTabState] as const;
}
