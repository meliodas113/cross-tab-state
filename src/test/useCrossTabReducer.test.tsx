import { renderHook, act, waitFor } from "@testing-library/react";
import { useCrossTabReducer } from "../useCrossTabReducer";

type State = { count: number };
type Action = { type: "increment" | "decrement" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
};

describe("useCrossTabReducer", () => {
  let channels: any[] = [];

  beforeEach(() => {
    channels = [];
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        name: string;
        onmessage: ((event: MessageEvent) => void) | null = null;
        constructor(name: string) {
          this.name = name;
          channels.push(this);
        }
        postMessage = vi.fn((msg) => {
          channels.forEach((ch) => {
            if (ch !== this && ch.onmessage) {
              ch.onmessage({ data: msg } as MessageEvent);
            }
          });
        });
        close = vi.fn();
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize state", () => {
    const { result } = renderHook(() =>
      useCrossTabReducer(reducer, { count: 0 }, "counter")
    );
    expect(result.current[0].count).toBe(0);
  });

  it("should update state locally", () => {
    const { result } = renderHook(() =>
      useCrossTabReducer(reducer, { count: 0 }, "counter")
    );
    act(() => {
      result.current[1]({ type: "increment" });
    });
    expect(result.current[0].count).toBe(1);
  });

  it("should sync state across tabs", async () => {
    const hook1 = renderHook(() =>
      useCrossTabReducer(reducer, { count: 0 }, "counter")
    );
    const hook2 = renderHook(() =>
      useCrossTabReducer(reducer, { count: 0 }, "counter")
    );

    act(() => {
      hook1.result.current[1]({ type: "increment" });
    });

    await waitFor(() => {
      expect(hook2.result.current[0].count).toBe(1);
    });
  });
});
