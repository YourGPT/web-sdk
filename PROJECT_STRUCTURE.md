# YourGPT SDK - Project Structure

## Overview

This is a complete, production-ready SDK package for YourGPT integration with both vanilla JavaScript/TypeScript and React applications.

## Directory Structure

```
yourgpt-sdk/
├── 📁 src/                          # Source code
│   ├── 📁 core/                     # Core SDK (vanilla JS/TS)
│   │   └── YourGPT.ts               # Main SDK class
│   ├── 📁 react/                    # React-specific code
│   │   ├── 📁 hooks/                # React hooks
│   │   │   ├── useYourGPT.ts        # Main SDK hook
│   │   │   ├── useYourGPTChatbot.ts # Chatbot control hook
│   │   │   └── useAIActions.ts      # AI actions hook
│   │   ├── 📁 components/           # React components
│   │   │   ├── YourGPTProvider.tsx  # Context provider
│   │   │   └── YourGPTWidget.tsx    # Widget component
│   │   └── index.ts                 # React package exports
│   ├── 📁 types/                    # TypeScript definitions
│   │   └── index.ts                 # All type definitions
│   ├── 📁 utils/                    # Utility functions
│   │   └── index.ts                 # Helper functions
│   └── index.ts                     # Main package exports
├── 📁 tests/                        # Test files
│   ├── 📁 core/                     # Core SDK tests
│   │   └── YourGPT.test.ts          # SDK unit tests
│   └── setup.ts                     # Test setup configuration
├── 📁 examples/                     # Usage examples
│   ├── 📁 vanilla/                  # Vanilla JS example
│   │   └── index.html               # Complete HTML example
│   └── 📁 react/                    # React example
│       └── App.tsx                  # Complete React example
├── 📁 scripts/                      # Build and setup scripts
│   └── setup.sh                     # Project setup script
├── 📁 docs/                         # Documentation
├── 📁 react/                        # React package configuration
│   └── package.json                 # React package.json
├── 📄 package.json                  # Main package configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tsconfig.test.json            # Test TypeScript configuration
├── 📄 tsup.config.ts                # Build configuration
├── 📄 vite.config.ts                # Vite configuration
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 README.md                     # Main documentation
├── 📄 CHANGELOG.md                  # Version history
└── 📄 LICENSE                       # MIT license
```

## Package Architecture

### Dual Export Strategy

The SDK is structured as a single package with dual exports:

1. **Core SDK** (`@yourgpt/sdk`)
   - Vanilla JavaScript/TypeScript implementation
   - No framework dependencies
   - Works in any JavaScript environment

2. **React Package** (`@yourgpt/sdk/react`)
   - React-specific hooks and components
   - Built on top of the core SDK
   - Full React integration

### Build Outputs

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

## Key Features

### 🚀 Core SDK Features

- **Widget Control**: Open, close, toggle, show, hide
- **Messaging**: Send messages with auto-send option
- **Advanced Features**: Bottom sheets, games integration
- **Data Management**: Session, visitor, and contact data
- **Event System**: Comprehensive event handling
- **AI Actions**: Register custom AI-powered actions
- **Error Handling**: Custom error types and handling
- **TypeScript**: Full type safety
- **Browser Support**: All modern browsers

### 📱 React Integration

- **Hooks-based**: Modern React patterns
- **Context Provider**: App-wide SDK access
- **Component Integration**: Simple widget component
- **State Management**: Automatic state synchronization
- **Event Handling**: React-friendly event system
- **Cleanup**: Automatic cleanup on unmount

### 🔧 Developer Experience

- **TypeScript**: Full IntelliSense support
- **Tree-shakable**: Import only what you need
- **ESLint**: Code quality enforcement
- **Testing**: Comprehensive test suite
- **Examples**: Complete usage examples
- **Documentation**: Extensive documentation

## Usage Patterns

### Vanilla JavaScript

```javascript
import { YourGPT } from '@yourgpt/sdk';

// Initialize
await YourGPT.init({ widgetId: 'your-id' });

// Use
const sdk = YourGPT.getInstance();
sdk.open();
```

### React Hooks

```tsx
import { useYourGPTChatbot } from '@yourgpt/sdk/react';

function MyComponent() {
  const chatbot = useYourGPTChatbot();
  return <button onClick={chatbot.open}>Open Chat</button>;
}
```

### React Provider

```tsx
import { YourGPTProvider } from '@yourgpt/sdk/react';

function App() {
  return (
    <YourGPTProvider config={{ widgetId: 'your-id' }}>
      <MyApp />
    </YourGPTProvider>
  );
}
```

## Build System

### Technologies Used

- **TypeScript**: Type-safe development
- **tsup**: Fast TypeScript bundler
- **Vite**: Testing and development
- **ESLint**: Code linting
- **Vitest**: Unit testing
- **JSDoc**: Documentation generation

### Build Commands

```bash
npm run build          # Build both packages
npm run build:core     # Build core SDK only
npm run build:react    # Build React package only
npm run dev            # Development mode
npm run test           # Run tests
npm run lint           # Run linting
npm run type-check     # TypeScript check
```

## Testing Strategy

### Test Coverage

- **Unit Tests**: Core SDK functionality
- **Integration Tests**: React hooks integration
- **Type Tests**: TypeScript type checking
- **Mock Tests**: Browser environment mocking

### Test Files

- `tests/core/YourGPT.test.ts`: Core SDK tests
- `tests/setup.ts`: Test environment setup
- Mock implementations for browser APIs

## Deployment

### NPM Package

- **Package Name**: `@yourgpt/sdk`
- **Registry**: npm public registry
- **Access**: Public package
- **Versioning**: Semantic versioning

### Distribution

```bash
npm run build          # Build for production
npm run prepublishOnly # Pre-publish checks
npm publish --access public
```

## Configuration

### TypeScript Configuration

- **Target**: ES2020
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Declaration**: Generated
- **Source Maps**: Enabled

### ESLint Configuration

- **Parser**: TypeScript parser
- **Rules**: React + TypeScript rules
- **Extends**: Recommended configurations
- **Plugins**: React hooks plugin

## Documentation

### Available Documentation

- **README.md**: Main documentation
- **API Reference**: Complete API documentation
- **Examples**: Working code examples
- **TypeScript**: Inline type documentation
- **Changelog**: Version history

### Documentation Generation

All types are fully documented with JSDoc comments for IntelliSense support.

## Contributing

### Development Setup

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Run `npm test`

### Code Standards

- **TypeScript**: Strict typing required
- **ESLint**: All rules must pass
- **Testing**: New features require tests
- **Documentation**: Public APIs must be documented

## License

MIT License - see LICENSE file for details.