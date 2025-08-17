"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  useCrossTabReducer: () => useCrossTabReducer,
  useCrossTabState: () => useCrossTabState
});
module.exports = __toCommonJS(src_exports);

// src/useCrossTabState.ts
var import_react = require("react");
function useCrossTabState(key, initialValue) {
  const [state, setState] = (0, import_react.useState)(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (error) {
      console.warn(
        `Failed to parse localStorage value for key "${key}":`,
        error
      );
      return initialValue;
    }
  });
  const channelRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const channel = new BroadcastChannel("cross-tab-state");
    channelRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data.key === key) {
        setState(event.data.value);
      }
    };
    const onStorage = (e) => {
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
    window.addEventListener("storage", onStorage);
    return () => {
      channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);
  const setCrossTabState = (value) => {
    setState((prev) => {
      var _a;
      const newValue = typeof value === "function" ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(
          `Failed to save state to localStorage for key "${key}":`,
          error
        );
      }
      try {
        (_a = channelRef.current) == null ? void 0 : _a.postMessage({ key, value: newValue });
      } catch (error) {
        console.warn(
          `Failed to broadcast state change for key "${key}":`,
          error
        );
      }
      return newValue;
    });
  };
  return [state, setCrossTabState];
}

// src/useCrossTabReducer.ts
var import_react2 = require("react");
function useCrossTabReducer(reducer, initialState, key) {
  const [state, setState] = (0, import_react2.useState)(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialState;
    } catch (error) {
      console.warn(
        `Failed to parse localStorage value for key "${key}":`,
        error
      );
      return initialState;
    }
  });
  const dispatch = (0, import_react2.useCallback)(
    (action) => {
      setState((prev) => {
        const newState = reducer(prev, action);
        try {
          localStorage.setItem(key, JSON.stringify(newState));
        } catch (error) {
          console.warn(
            `Failed to save state to localStorage for key "${key}":`,
            error
          );
        }
        return newState;
      });
    },
    [key, reducer]
    // Dependencies for useCallback - only recreate if key or reducer changes
  );
  (0, import_react2.useEffect)(() => {
    const handler = (e) => {
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
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);
  return [state, dispatch];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useCrossTabReducer,
  useCrossTabState
});
