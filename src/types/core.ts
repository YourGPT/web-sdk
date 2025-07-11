/**
 * Core Types for YourGPT SDK
 */

// Core SDK Configuration
export interface YourGPTConfig {
  widgetId: string;
  endpoint?: string;
  autoLoad?: boolean;
  debug?: boolean;
  whitelabel?: boolean;
}

// Widget State
export interface WidgetState {
  isOpen: boolean;
  isVisible: boolean;
  isConnected: boolean;
  isLoaded: boolean;
  lastMessageId?: string;
  messageCount: number;
  connectionRetries: number;
}

// Event Types
export type EventHandler<T = any> = (data: T) => void;
export type EventUnsubscriber = () => void;

// Error Types
export class YourGPTError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "YourGPTError";
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
