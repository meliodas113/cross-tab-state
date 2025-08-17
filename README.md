# cross-tab-state

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React hooks for syncing `useState` or `useReducer` across multiple browser tabs. Keep your application state synchronized across all open tabs with minimal setup and maximum performance.

## ✨ Features

- **🔄 Cross-tab synchronization** - State changes in one tab automatically sync to all other tabs
- **💾 Persistent storage** - State is automatically saved to localStorage
- **🚀 Performance optimized** - Uses BroadcastChannel API with localStorage fallback
- **⚡ Real-time updates** - Instant synchronization across tabs
- **🛡️ TypeScript support** - Full type safety with generics
- **📱 React 17+ compatible** - Works with modern React versions
- **🎯 Zero dependencies** - Lightweight and focused

## 📦 Installation

```bash
npm install cross-tab-state
```

```bash
yarn add cross-tab-state
```

```bash
pnpm add cross-tab-state
```

## 🚀 Quick Start

### Basic Counter Example

```tsx
import React from "react";
import { useCrossTabState } from "cross-tab-state";

function Counter() {
  const [count, setCount] = useCrossTabState("counter", 0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

Open multiple tabs with this component - the count will stay synchronized across all of them!

## 📚 API Reference

### `useCrossTabState<T>(key: string, initialValue: T)`

A hook that provides cross-tab synchronized state, similar to `useState` but with automatic synchronization.

**Parameters:**

- `key` (string): Unique identifier for the state across tabs
- `initialValue` (T): Initial value for the state

**Returns:**

- `[state, setState]`: Tuple containing current state and setter function

**Example:**

```tsx
const [user, setUser] = useCrossTabState("user", { name: "John", age: 25 });

// Update state (automatically syncs across tabs)
setUser({ name: "Jane", age: 30 });

// Use functional updates
setUser((prev) => ({ ...prev, age: prev.age + 1 }));
```

### `useCrossTabReducer<State, Action>(reducer, initialState, key)`

A hook that provides cross-tab synchronized state with reducer pattern, similar to `useReducer` but with automatic synchronization.

**Parameters:**

- `reducer` (function): Reducer function `(state, action) => newState`
- `initialState` (State): Initial state value
- `key` (string): Unique identifier for the state across tabs

**Returns:**

- `[state, dispatch]`: Tuple containing current state and dispatch function

**Example:**

```tsx
const todoReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, action.payload];
    case "REMOVE_TODO":
      return state.filter((todo) => todo.id !== action.payload);
    default:
      return state;
  }
};

const [todos, dispatch] = useCrossTabReducer(todoReducer, [], "todos");

// Dispatch actions (automatically syncs across tabs)
dispatch({ type: "ADD_TODO", payload: { id: 1, text: "New todo" } });
```

## 🔧 Advanced Usage

### Complex State Objects

```tsx
interface AppState {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
  userPreferences: {
    fontSize: number;
    autoSave: boolean;
  };
}

const [appState, setAppState] = useCrossTabState<AppState>("app-settings", {
  theme: "light",
  language: "en",
  notifications: true,
  userPreferences: {
    fontSize: 14,
    autoSave: true,
  },
});

// Update nested properties
setAppState((prev) => ({
  ...prev,
  userPreferences: {
    ...prev.userPreferences,
    fontSize: 16,
  },
}));
```

### Form State Synchronization

```tsx
function MultiTabForm() {
  const [formData, setFormData] = useCrossTabState("form-data", {
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={formData.message}
        onChange={(e) => handleChange("message", e.target.value)}
        placeholder="Message"
      />
    </form>
  );
}
```

### Shopping Cart Synchronization

```tsx
function ShoppingCart() {
  const [cart, setCart] = useCrossTabReducer(cartReducer, [], "shopping-cart");

  const addItem = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (itemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  return (
    <div>
      <h3>Shopping Cart ({cart.length} items)</h3>
      {cart.map((item) => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## 🔍 How It Works

The hooks use a combination of technologies to ensure reliable cross-tab synchronization:

1. **BroadcastChannel API**: For real-time communication between tabs
2. **localStorage**: For persistent storage and fallback synchronization
3. **Storage Events**: To detect changes from other tabs
4. **React Hooks**: For seamless integration with React components

### Synchronization Flow

1. When state changes in one tab:

   - State is updated locally
   - New state is saved to localStorage
   - Message is broadcast to other tabs via BroadcastChannel

2. When other tabs receive updates:
   - Storage event listener detects localStorage changes
   - BroadcastChannel receives real-time messages
   - State is automatically updated across all tabs

## ⚠️ Browser Compatibility

- **Modern browsers**: Full support with BroadcastChannel API
- **Older browsers**: Falls back to localStorage-only synchronization
- **Mobile browsers**: Full support on modern mobile browsers

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🏗️ Development

Build the package:

```bash
npm run build
```

Development mode with watch:

```bash
npm run dev
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 Changelog

### v0.1.0

- Initial release
- `useCrossTabState` hook for basic state synchronization
- `useCrossTabReducer` hook for reducer-based state management
- Full TypeScript support
- Comprehensive test coverage

## 💡 Use Cases

- **Multi-tab applications**: Keep forms, settings, and app state in sync
- **E-commerce**: Synchronize shopping carts across tabs
- **Collaborative tools**: Real-time updates across multiple browser instances
- **Dashboard applications**: Consistent state across monitoring tabs
- **Form builders**: Multi-tab form editing with live synchronization

## 🚨 Important Notes

- **Unique keys**: Ensure each piece of state has a unique key to avoid conflicts
- **Serializable data**: Only store data that can be serialized to JSON
- **Performance**: Large state objects may impact performance - consider splitting into smaller pieces
- **Storage limits**: Be mindful of localStorage size limits (usually 5-10MB)

---

**Made with ❤️ for the React community**
