import { renderHook, act, waitFor } from "@testing-library/react";
import { useCrossTabState } from "../useCrossTabState";

describe("useCrossTabState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should update state in the same tab", () => {
    const { result } = renderHook(() => useCrossTabState("counter", 0));

    act(() => {
      const [, setCount] = result.current;
      setCount(1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should sync state across tabs", async () => {
    const tab1 = renderHook(() => useCrossTabState("counter", 0));
    const tab2 = renderHook(() => useCrossTabState("counter", 0));

    act(() => {
      const [, setCount] = tab1.result.current;
      setCount(1);

      // Simulate the "storage" event that browsers send to other tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "counter",
          newValue: "1",
        })
      );
    });

    await waitFor(() => {
      expect(tab2.result.current[0]).toBe(1);
    });
  });

  it("should work with functional updates", async () => {
    const tab1 = renderHook(() => useCrossTabState("counter", 0));
    const tab2 = renderHook(() => useCrossTabState("counter", 0));

    act(() => {
      const [, setCount] = tab1.result.current;
      setCount((prev: number) => prev + 1);

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "counter",
          newValue: "1",
        })
      );
    });

    await waitFor(() => {
      expect(tab2.result.current[0]).toBe(1);
    });
  });
});
