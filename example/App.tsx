import React from "react";
import { useCrossTabState } from "../src";

export default function App() {
  const [count, setCount] = useCrossTabState("counter", 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Cross-Tab Counter</h1>
      <p>Count across all tabs: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount((c) => c - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
