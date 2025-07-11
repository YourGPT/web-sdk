/**
 * YourGPT SDK - Main Entry Point
 * 
 * This is the core SDK that works with vanilla JavaScript/TypeScript
 * For React-specific functionality, use @yourgpt/sdk/react
 */

// Core SDK
export { YourGPT, YourGPTSDK } from './core/YourGPT';

// Types
export type {
  YourGPTConfig,
  WidgetState,
  MessageData,
  EscalationData,
  SessionData,
  VisitorData,
  ContactData,
  GameOptions,
  AIActionData,
  AIActionHelpers,
  AIActionHandler,
  ConfirmOptions,
  ChatbotAPI,
  AIActionsAPI,
  EventHandler,
  EventUnsubscriber,
  WidgetControls,
  MessagingControls,
  AdvancedFeatures,
  DataManagement,
  EventListeners
} from './types';

// Error class
export { YourGPTError } from './types';

// Utilities
export {
  isBrowser,
  isDevelopment,
  createDebugLogger,
  waitFor,
  withRetry,
  deepMerge,
  generateId,
  validateWidgetId,
  validateUrl,
  sanitizeHtml,
  debounce,
  throttle,
  isInViewport,
  loadScript,
  loadCSS,
  EventEmitter
} from './utils';

// Version
export const VERSION = '1.0.0';

// Default export for convenience
export default YourGPT;