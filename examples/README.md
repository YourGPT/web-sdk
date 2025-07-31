# YourGPT SDK Examples

This directory contains example projects demonstrating different integration methods for the YourGPT SDK. These examples showcase how to use the SDK in various JavaScript/TypeScript environments and frameworks.

## Available Examples

### 1. [copilot-todo-list-next-js](./copilot-todo-list-next-js)

A comprehensive Todo List application built with Next.js that demonstrates advanced YourGPT SDK integration.

**Features:**
- List and Kanban board views
- Theme switching
- AI actions for task management
- React hooks integration

**Key Files:**
- `src/components/app.tsx` - Main YourGPT SDK integration
- `src/components/todo-app.tsx` - Todo list implementation

### 2. [next-playground](./next-playground)

A basic Next.js application demonstrating the integration of YourGPT SDK in a Next.js environment.

**Features:**
- Simple integration example
- Shows basic usage patterns
- Demonstrates SSR compatibility

### 3. [react](./react)

A simple Vite-based React application showing how to use YourGPT SDK with React.

**Features:**
- React hooks usage
- Component-based integration
- Modern bundler setup

### 4. [vanilla](./vanilla)

A pure HTML/JavaScript example that demonstrates using the YourGPT SDK without any framework.

**Features:**
- No build step required
- Direct SDK implementation
- Event handling examples
- AI action registration

## Getting Started

### Quick Start

1. Choose an example project that matches your tech stack
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open the project in your browser (typically http://localhost:3000 or http://localhost:5173)

### Setting Up YourGPT SDK

In all examples, you'll need to:

1. Replace the placeholder widget ID with your actual YourGPT widget ID
2. Configure the endpoint URL if you're not using the default
3. Customize AI actions based on your needs

## Common Integration Patterns

### Basic SDK Initialization

```typescript
import { YourGPT } from "@yourgpt/widget-web-sdk";

// Initialize the SDK
await YourGPT.init({
  widgetId: "your-widget-id",
});

// Get the SDK instance
const sdk = YourGPT.getInstance();
```

### React Integration

```tsx
import { YourGPTProvider } from "@yourgpt/widget-web-sdk/react";

function App() {
  return (
    <YourGPTProvider
      config={{
        widgetId: "your-widget-id",
        endpoint: "https://widget.yourgpt.ai",
      }}
    >
      <YourApp />
    </YourGPTProvider>
  );
}
```

### Using AI Actions

```typescript
// Register an AI action
sdk.registerAIAction("get_current_time", async (data, helpers) => {
  const now = new Date();
  helpers.respond(`Current time: ${now.toLocaleString()}`);
});
```

## Learning Resources

For more information about YourGPT SDK, check:

- [Main SDK Documentation](../README.md)
- [SDK Documentation Guide](../SDK_DOCUMENTATION.md)
- [Development Guide](../DEVELOPMENT.md)

## Questions and Support

If you have questions or need help with the examples:

- Review the [FAQ section](../README.md#-faq) in the main README
- Check the [Project Structure](../PROJECT_STRUCTURE.md) document
- Contact us at support@yourgpt.ai
