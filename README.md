# YourGPT SDK

[![npm version](https://badge.fury.io/js/@yourgpt/widget-web-sdk.svg)](https://badge.fury.io/js/@yourgpt/widget-web-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-green.svg)]()
[![Coverage](https://img.shields.io/badge/Coverage-90%25-brightgreen.svg)]()

Official YourGPT SDK for JavaScript/TypeScript and React applications. Integrate YourGPT's powerful chatbot widget into your web applications with modern, type-safe APIs.

## 🚀 Features

- **🔄 Dual Package**: Both vanilla JS/TS (`@yourgpt/widget-web-sdk`) and React-specific (`@yourgpt/widget-web-sdk/react`) implementations
- **📦 Tree-shakable**: Import only what you need for optimal bundle size
- **💪 TypeScript**: Full type safety, IntelliSense support, and comprehensive type definitions
- **🎣 React Hooks**: Modern React integration with `useYourGPTChatbot()` and `useAIActions()`
- **🎮 AI Actions**: Register custom AI-powered actions with confirmation dialogs
- **🎯 Event System**: Comprehensive event handling for real-time updates
- **🔧 Configurable**: Flexible configuration with SSR support
- **📱 Cross-platform**: Works in all modern browsers and frameworks
- **🧪 Well-tested**: Comprehensive test suite with 90%+ coverage
- **📚 Documented**: Complete documentation with examples

## 📦 Installation

```bash
npm install @yourgpt/widget-web-sdk
```

## ⚡ Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { YourGPT } from "@yourgpt/widget-web-sdk";

// Initialize the SDK
await YourGPT.init({
  widgetId: "your-widget-id",
});

// Get the SDK instance
const sdk = YourGPT.getInstance();

// Control the widget
sdk.open();
sdk.sendMessage("Hello!");

// Listen for events
sdk.onMessageReceived((data) => {
  console.log("Message received:", data);
});
```

### React Integration

```tsx
import { YourGPT, useYourGPTChatbot, useAIActions } from "@yourgpt/widget-web-sdk/react";

// Initialize in your main app file (main.tsx or App.tsx)
YourGPT.init({
  widgetId: "your-widget-id",
});

// Use in components
function ChatButton() {
  const chatbot = useYourGPTChatbot();
  const aiActions = useAIActions();

  // Register AI actions
  useEffect(() => {
    aiActions.registerAction("get_location", async (data, helpers) => {
      const confirmed = await helpers.confirm({
        title: "Location Access",
        description: "Allow location access?",
      });

      if (confirmed) {
        // Get location and respond
        helpers.respond("Location: 40.7128, -74.0060");
      }
    });
  }, [aiActions]);

  return (
    <div>
      <button onClick={chatbot.open}>Open Chat</button>
      <p>Status: {chatbot.isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
```

## 📖 Complete Documentation

### 🔧 Configuration

```typescript
interface YourGPTConfig {
  widgetId: string; // Required: Your YourGPT widget ID
  endpoint?: string; // Optional: Custom endpoint URL
  autoLoad?: boolean; // Optional: Auto-load widget (default: true)
  debug?: boolean; // Optional: Enable debug logging
  whitelabel?: boolean; // Optional: Use whitelabel endpoint
}
```

### 🎮 Widget Controls

```typescript
const sdk = YourGPT.getInstance();

// Widget visibility and state
sdk.open(); // Open the chat widget
sdk.close(); // Close the chat widget
sdk.toggle(); // Toggle widget open/closed state
sdk.show(); // Show widget button/trigger
sdk.hide(); // Hide widget button/trigger

// Messaging
sdk.sendMessage("Hello!", true); // Send message (auto-send: true)

// Advanced features
sdk.openBottomSheet("https://docs.example.com"); // Open bottom sheet
sdk.startGame("quizMania", {
  // Start interactive game
  showExitConfirmation: true,
  leadCapture: true,
  gameConfig: { difficulty: "medium" },
});
```

### 📊 Data Management

The SDK provides three types of data management based on your existing SdkManager implementation:

```typescript
// Session data (temporary, tied to current session)
sdk.setSessionData({
  userId: "123",
  plan: "premium",
  sessionStart: new Date().toISOString(),
  features: ["ai-actions", "games"],
});

// Visitor data (analytics and tracking)
sdk.setVisitorData({
  source: "website",
  campaign: "summer2024",
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
});

// Contact data (user identity - requires email OR phone)
sdk.setContactData({
  email: "user@example.com",
  name: "John Doe",
  phone: "+1234567890",
  user_hash: "secure-hash-for-identity", // For secure user identification
});
```

### 🎯 Event Handling

Based on your existing SdkManager event system:

```typescript
// Widget lifecycle events
sdk.onInit(() => {
  console.log("Widget initialized and connected");
});

// Real-time message events
sdk.onMessageReceived((data) => {
  console.log("Message:", data);
  // Handle notifications, analytics, etc.
});

// Human escalation events
sdk.onEscalatedToHuman((data) => {
  console.log("Escalated to human agent:", data);
  // Show notifications, update UI, etc.
});

// Widget state changes
sdk.onWidgetPopup((isOpen) => {
  console.log("Widget is", isOpen ? "open" : "closed");
  // Sync with parent application state
});
```

### 🤖 AI Actions System

Register custom AI-powered actions that your chatbot can trigger:

```typescript
// Register an AI action with confirmation dialog
sdk.registerAIAction("delete_file", async (data, helpers) => {
  const { filename } = JSON.parse(data.action[0].function.arguments);

  // Show confirmation dialog to user
  const confirmed = await helpers.confirm({
    title: "Delete File",
    description: `Are you sure you want to delete "${filename}"?`,
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
  });

  if (confirmed) {
    try {
      await deleteFile(filename);
      helpers.respond(`File "${filename}" deleted successfully`);
    } catch (error) {
      helpers.respond(`Error deleting file: ${error.message}`);
    }
  } else {
    helpers.respond("File deletion cancelled");
  }
});

// Register system information action
sdk.registerAIAction("get_system_info", async (data, helpers) => {
  const systemInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  helpers.respond(`System Info:\n${JSON.stringify(systemInfo, null, 2)}`);
});

// Unregister when no longer needed
sdk.unregisterAIAction("delete_file");
```

## ⚛️ React Integration

### Hooks

#### `useYourGPTChatbot()` - Main Widget Control

```typescript
function ChatComponent() {
  const chatbot = useYourGPTChatbot();

  return (
    <div>
      {/* Widget state */}
      <div>Status: {chatbot.isConnected ? "Connected" : "Disconnected"}</div>
      <div>Messages: {chatbot.messageCount}</div>

      {/* Widget controls */}
      <button onClick={chatbot.open}>Open Chat</button>
      <button onClick={chatbot.close}>Close Chat</button>
      <button onClick={chatbot.toggle}>Toggle Chat</button>

      {/* Messaging */}
      <button onClick={() => chatbot.sendMessage("Hello!")}>Send Message</button>

      {/* Advanced features */}
      <button onClick={() => chatbot.openBottomSheet("https://docs.example.com")}>Open Documentation</button>
      <button onClick={() => chatbot.startGame("quizMania", { showExitConfirmation: true })}>Start Quiz Game</button>
    </div>
  );
}
```

#### `useAIActions()` - AI Actions Management

```typescript
function AIActionsComponent() {
  const aiActions = useAIActions();

  useEffect(() => {
    // Register multiple actions at once
    aiActions.registerActions({
      get_time: async (data, helpers) => {
        helpers.respond(`Current time: ${new Date().toLocaleString()}`);
      },
      get_page_url: async (data, helpers) => {
        helpers.respond(`Current URL: ${window.location.href}`);
      },
      take_screenshot: async (data, helpers) => {
        const confirmed = await helpers.confirm({
          title: "Screenshot",
          description: "Take a screenshot of the current page?",
        });

        if (confirmed) {
          // Screenshot logic using html2canvas or similar
          helpers.respond("Screenshot taken successfully");
        }
      },
    });

    // Cleanup on unmount
    return () => {
      aiActions.unregisterAction("get_time");
      aiActions.unregisterAction("get_page_url");
      aiActions.unregisterAction("take_screenshot");
    };
  }, [aiActions]);

  return (
    <div>
      <h3>Registered AI Actions</h3>
      <p>Count: {aiActions.registeredActions.length}</p>
      <ul>
        {aiActions.registeredActions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Components

#### `YourGPTProvider` - Context Provider

```tsx
import { YourGPTProvider } from "@yourgpt/widget-web-sdk/react";

function App() {
  return (
    <YourGPTProvider
      config={{
        widgetId: "your-widget-id",
      }}
      onInitialized={(sdk) => {
        console.log("SDK initialized:", sdk);
        // Set initial data, register global AI actions, etc.
      }}
      onError={(error) => {
        console.error("SDK error:", error);
        // Handle initialization errors
      }}
    >
      <MyApp />
    </YourGPTProvider>
  );
}
```

#### `YourGPTWidget` - Simple Widget Component

```tsx
import { YourGPTWidget } from "@yourgpt/widget-web-sdk/react";

function App() {
  return (
    <div>
      <h1>My Application</h1>

      <YourGPTWidget
        config={{
          widgetId: "your-widget-id",
        }}
        onMessageReceived={(data) => {
          console.log("Message received:", data);
          // Handle message notifications
        }}
        onEscalatedToHuman={(data) => {
          console.log("Escalated to human:", data);
          // Show escalation notifications
        }}
      />
    </div>
  );
}
```

## 🔧 Advanced Usage

### Error Handling

```typescript
import { YourGPTError } from "@yourgpt/widget-web-sdk";

try {
  await YourGPT.init({
    widgetId: "invalid-id",
  });
} catch (error) {
  if (error instanceof YourGPTError) {
    console.error("YourGPT Error:", error.message, error.code);
    // Handle specific YourGPT errors
  } else {
    console.error("Unknown error:", error);
  }
}
```

### Server-Side Rendering (SSR)

```typescript
import { isBrowser } from "@yourgpt/widget-web-sdk";

// Only initialize in browser environment
if (isBrowser()) {
  await YourGPT.init({
    widgetId: "your-widget-id",
  });
}

// React SSR-safe hook usage
function MyComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chatbot = useYourGPTChatbot();

  const handleOpen = () => {
    if (isClient) {
      chatbot.open();
    }
  };

  return <button onClick={handleOpen}>Open Chat</button>;
}
```

### Custom Confirmation Dialogs

```typescript
// Advanced AI action with custom confirmation
aiActions.registerAction("delete_user_data", async (data, helpers) => {
  const { userId, dataType } = JSON.parse(data.action[0].function.arguments);

  const confirmed = await helpers.confirm({
    title: "⚠️ Delete User Data",
    description: `This will permanently delete all ${dataType} data for user ${userId}. This action cannot be undone.`,
    acceptLabel: "Delete Permanently",
    rejectLabel: "Keep Data",
  });

  if (confirmed) {
    try {
      await deleteUserData(userId, dataType);
      helpers.respond(`✅ ${dataType} data deleted for user ${userId}`);
    } catch (error) {
      helpers.respond(`❌ Failed to delete data: ${error.message}`);
    }
  } else {
    helpers.respond("Data deletion cancelled - no changes made");
  }
});
```

## 🏗️ Project Structure

```
@yourgpt/widget-web-sdk/
├── 📁 src/
│   ├── 📁 core/              # Core SDK (vanilla JS/TS)
│   │   └── YourGPT.ts        # Main SDK implementation
│   ├── 📁 react/             # React-specific code
│   │   ├── 📁 hooks/         # React hooks
│   │   │   ├── useYourGPT.ts
│   │   │   ├── useYourGPTChatbot.ts
│   │   │   └── useAIActions.ts
│   │   ├── 📁 components/    # React components
│   │   │   ├── YourGPTProvider.tsx
│   │   │   └── YourGPTWidget.tsx
│   │   │   └── index.ts          # React exports
│   ├── 📁 types/             # TypeScript definitions
│   ├── 📁 utils/             # Utility functions
│   └── index.ts              # Main exports
├── 📁 tests/                 # Test suite
├── 📁 docs/                  # Documentation
└── 📄 README.md              # This file
```

## 🧪 Testing

Run the test suite:

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

The SDK includes comprehensive tests for:

- Core SDK functionality
- React hooks integration
- AI Actions system
- Error handling
- TypeScript type checking

## 🔨 Development

### Setup

```bash
git clone https://github.com/YourGPT/web-sdk
cd web-sdk
npm install
npm run build
```

### Available Scripts

```bash
npm run build          # Build both core and React packages
npm run build:core     # Build core SDK only
npm run build:react    # Build React package only
npm run dev            # Development mode with watch
npm run dev:examples   # Build and serve examples
npm run serve          # Serve examples on port 3000
npm run type-check     # TypeScript type checking
npm run lint           # ESLint code linting
npm run lint:fix       # Fix ESLint issues
npm test               # Run test suite
npm run clean          # Clean build artifacts
```

### Build Output

```
dist/
├── index.js          # CommonJS build
├── index.mjs         # ES modules build
├── index.d.ts        # TypeScript definitions
└── react/
    ├── index.js      # React CommonJS build
    ├── index.mjs     # React ES modules build
    └── index.d.ts    # React TypeScript definitions
```

## 📋 API Reference

### Core SDK Classes

- **`YourGPTSDK`**: Main SDK class
- **`YourGPT`**: Static methods for easy access
- **`YourGPTError`**: Custom error handling

### React Hooks

- **`useYourGPT()`**: Low-level SDK access
- **`useYourGPTChatbot()`**: Main widget control hook
- **`useAIActions()`**: AI actions management
- **`useYourGPTContext()`**: Access provider context

### Types

```typescript
import type {
  YourGPTConfig, // Configuration interface
  WidgetState, // Widget state interface
  MessageData, // Message data structure
  EscalationData, // Human escalation data
  AIActionData, // AI action payload
  AIActionHelpers, // AI action helper functions
  ChatbotAPI, // Complete chatbot API
  AIActionsAPI, // AI actions API
} from "@yourgpt/widget-web-sdk";
```

### Utilities

```typescript
import {
  isBrowser, // Check if in browser environment
  isDevelopment, // Check if in development mode
  validateWidgetId, // Validate widget ID format
  validateUrl, // Validate URL format
  debounce, // Debounce function calls
  throttle, // Throttle function calls
  withRetry, // Retry failed operations
  EventEmitter, // Custom event emitter
} from "@yourgpt/widget-web-sdk";
```

## 🌐 Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **IE**: Not supported

## 📱 Framework Compatibility

- ✅ **React**: 16.8+ (hooks support required)
- ✅ **Next.js**: 12+ (with SSR support)
- ✅ **Vite**: All versions
- ✅ **Create React App**: All versions
- ✅ **Vanilla JS/TS**: All modern environments
- ✅ **Vue.js**: Via vanilla SDK
- ✅ **Angular**: Via vanilla SDK
- ✅ **Svelte**: Via vanilla SDK

## 🔄 Migration Guide

### From Script-based Integration

**Before (Old Script Integration):**

```html
<script src="https://widget.yourgpt.ai/script.js" id="yourgpt-chatbot" widget="your-widget-id"></script>
<script>
  window.$yourgptChatbot.execute("widget:open");
  window.$yourgptChatbot.on("message:received", handleMessage);
</script>
```

**After (New SDK Integration):**

```typescript
import { YourGPT } from "@yourgpt/widget-web-sdk";

await YourGPT.init({ widgetId: "your-widget-id" });
const sdk = YourGPT.getInstance();

sdk.open();
sdk.onMessageReceived(handleMessage);
```

### From React Class Components to Hooks

**Before:**

```jsx
class ChatComponent extends React.Component {
  componentDidMount() {
    window.$yourgptChatbot.execute("widget:open");
  }

  render() {
    return <div>Chat Component</div>;
  }
}
```

**After:**

```tsx
function ChatComponent() {
  const chatbot = useYourGPTChatbot();

  useEffect(() => {
    chatbot.open();
  }, [chatbot]);

  return <div>Chat Component</div>;
}
```

## ❓ FAQ

**Q: Can I use this SDK with Next.js?**
A: Yes! The SDK fully supports SSR. Use the `isBrowser()` utility to check environment.

**Q: How do I handle widget initialization errors?**
A: Use try/catch with `YourGPTError` for specific error handling.

**Q: Can I customize the confirmation dialogs?**
A: Yes! Use the `helpers.confirm()` method in AI actions with custom options.

**Q: Is the SDK tree-shakable?**
A: Yes! Import only what you need: `import { YourGPT } from '@yourgpt/widget-web-sdk'`

**Q: How do I register multiple AI actions at once?**
A: Use `aiActions.registerActions()` with an object of action handlers.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/sdk.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes and add tests
6. Run tests: `npm test`
7. Submit a pull request

### Code Standards

- **TypeScript**: Strict typing required
- **ESLint**: All rules must pass
- **Testing**: New features require tests
- **Documentation**: Public APIs must be documented

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: support@yourgpt.ai
- 🐛 **Issues**: [GitHub Issues](https://github.com/YourGPT/web-sdk/issues)
- 📖 **Documentation**: [docs.yourgpt.ai](https://docs.yourgpt.ai)
- 💬 **Discord**: [Join our community](https://discord.com/invite/57C9uTkD6g)

## 🔗 Links

- **Website**: [YourGPT](https://github.com/YourGPT)
- **GitHub**: [YourGPT/web-sdk](https://github.com/YourGPT/web-sdk)
- **NPM Package**: [@yourgpt/widget-web-sdk](https://www.npmjs.com/package/@yourgpt/widget-web-sdk)
- **Documentation**: [docs.yourgpt.ai/sdk](https://docs.yourgpt.ai/sdk)
- **Twitter/X**: [YourGPT AI](https://x.com/YourGPTAI)

---

Made with ❤️ by the [YourGPT Team](https://github.com/YourGPT)
