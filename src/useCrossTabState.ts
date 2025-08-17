import { useState, useEffect, useRef } from "react";

export function useCrossTabState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("cross-tab-state");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.key === key) setState(event.data.value);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) setState(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);

    return () => {
      channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const setCrossTabState = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue =
        typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

      localStorage.setItem(key, JSON.stringify(newValue));
      channelRef.current?.postMessage({ key, value: newValue });

      return newValue;
    });
  };

  return [state, setCrossTabState] as const;
}
