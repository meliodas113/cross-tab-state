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
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  const channelRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const channel = new BroadcastChannel("cross-tab-state");
    channelRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data.key === key)
        setState(event.data.value);
    };
    const onStorage = (e) => {
      if (e.key === key && e.newValue)
        setState(JSON.parse(e.newValue));
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
      localStorage.setItem(key, JSON.stringify(newValue));
      (_a = channelRef.current) == null ? void 0 : _a.postMessage({ key, value: newValue });
      return newValue;
    });
  };
  return [state, setCrossTabState];
}

// src/useCrossTabReducer.ts
function useCrossTabReducer(key, reducer, initialState) {
  const [state, setState] = useCrossTabState(key, initialState);
  const dispatch = (action) => {
    const newState = reducer(state, action);
    setState(newState);
  };
  return [state, dispatch];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useCrossTabReducer,
  useCrossTabState
});
