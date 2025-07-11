# YourGPT SDK - Development & Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the SDK
```bash
npm run build
```

### 3. Test the SDK

#### Option A: Vanilla JavaScript Example
```bash
# Build and serve examples
npm run dev:examples

# Then open http://localhost:3000/examples/vanilla/index.html
```

#### Option B: React Example
```bash
# Build the SDK first
npm run build

# Go to React example directory
cd examples/react

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 Development Scripts

- `npm run build` - Build both core and React packages
- `npm run build:core` - Build only the core SDK
- `npm run build:react` - Build only the React package
- `npm run dev` - Build core SDK in watch mode
- `npm run dev:react` - Build React package in watch mode
- `npm run serve` - Serve the examples on port 3000
- `npm run dev:examples` - Build and serve examples
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 📁 Testing Examples

### Vanilla JavaScript
Located at `examples/vanilla/index.html`
- Uses the built SDK from `dist/index.mjs`
- Demonstrates all core SDK features
- Interactive controls for testing widget functionality

### React
Located at `examples/react/`
- Full React application with Vite
- Uses React hooks and components
- Demonstrates modern React integration patterns

## 🛠️ Before Using

1. **Replace Widget ID**: Update the `widgetId` in both example files:
   - `examples/vanilla/index.html` (line 127)
   - `examples/react/App.tsx` (line 6)

2. **Update Endpoint**: If needed, update the endpoint URL in both examples

## 📝 Example Features

Both examples demonstrate:
- ✅ Widget initialization and connection
- ✅ Widget controls (open, close, toggle, show, hide)
- ✅ Message sending
- ✅ Advanced features (games, bottom sheets)
- ✅ Data management (session, visitor, contact data)
- ✅ AI Actions registration and handling
- ✅ Event listening and logging
- ✅ Real-time status updates

## 🔍 Debugging

Enable debug mode by setting `debug: true` in the configuration:
```javascript
YourGPT.init({
  widgetId: 'your-widget-id',
  debug: true  // Enable debug logging
});
```

## 📦 Distribution

The SDK is built to:
- `dist/` - Core SDK (vanilla JS/TS)
- `react/dist/` - React package

Both packages support:
- CommonJS (`*.js`)
- ES Modules (`*.mjs`)
- TypeScript definitions (`*.d.ts`)

## 🧪 Testing New Features

1. Make changes to the source code in `src/`
2. Run `npm run build` to build the packages
3. Test with the examples to verify functionality
4. Run `npm run type-check` to verify TypeScript
5. Run `npm run lint` to check code quality