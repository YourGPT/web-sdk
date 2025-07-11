/**
 * YourGPT React SDK
 * 
 * React-specific hooks and components for YourGPT integration
 */

// Hooks
export { useYourGPT } from './hooks/useYourGPT';
export { useYourGPTChatbot } from './hooks/useYourGPTChatbot';
export { useAIActions } from './hooks/useAIActions';

// Components
export { YourGPTProvider, useYourGPTContext } from './components/YourGPTProvider';
export { YourGPTWidget } from './components/YourGPTWidget';

// Re-export core SDK for convenience
export { YourGPT, YourGPTSDK } from '../core/YourGPT';

// Re-export types
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
} from '../types';

// Re-export error class
export { YourGPTError } from '../types';

// Version
export const VERSION = '1.0.0';