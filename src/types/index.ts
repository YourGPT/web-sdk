/**
 * YourGPT SDK Types
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

// Message Types
export interface MessageData {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'bot' | 'agent';
  metadata?: Record<string, any>;
}

// Escalation Types
export interface EscalationData {
  mode: string;
  modeKey: string;
  timestamp: string;
  reason?: string;
  agentId?: string;
}

// Game Configuration
export interface GameOptions {
  showExitConfirmation?: boolean;
  leadCapture?: boolean;
  gameConfig?: Record<string, any>;
}

// Data Management Types
export interface SessionData {
  [key: string]: any;
}

export interface VisitorData {
  [key: string]: any;
}

export interface ContactData {
  email?: string;
  phone?: string;
  name?: string;
  user_hash?: string;
  [key: string]: any;
}

// AI Actions Types
export interface AIActionData {
  action: Array<{
    function: {
      arguments: string;
      name: string;
    };
    id: string;
  }>;
  session_data: {
    session_uid: number;
    [key: string]: any;
  };
  session_uid: number;
  message_id: any;
}

export interface AIActionHelpers {
  respond: (message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export interface ConfirmOptions {
  title: string;
  description: string;
  acceptLabel?: string;
  rejectLabel?: string;
}

export type AIActionHandler = (data: AIActionData, helpers: AIActionHelpers) => Promise<void> | void;

// Widget Control Types
export interface WidgetControls {
  open: () => void;
  close: () => void;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

// Messaging Types
export interface MessagingControls {
  sendMessage: (text: string, autoSend?: boolean) => void;
}

// Advanced Features
export interface AdvancedFeatures {
  openBottomSheet: (url: string) => void;
  startGame: (gameId: string, options?: GameOptions) => void;
}

// Data Management
export interface DataManagement {
  setSessionData: (data: SessionData) => void;
  setVisitorData: (data: VisitorData) => void;
  setContactData: (data: ContactData) => void;
}

// Event Listeners
export interface EventListeners {
  onInit: (callback: EventHandler<void>) => EventUnsubscriber;
  onMessageReceived: (callback: EventHandler<MessageData>) => EventUnsubscriber;
  onEscalatedToHuman: (callback: EventHandler<EscalationData>) => EventUnsubscriber;
  onWidgetPopup: (callback: EventHandler<boolean>) => EventUnsubscriber;
}

// Complete Chatbot API
export interface ChatbotAPI extends 
  WidgetState,
  WidgetControls,
  MessagingControls,
  AdvancedFeatures,
  DataManagement,
  EventListeners {}

// AI Actions API
export interface AIActionsAPI {
  registerAction: (actionName: string, handler: AIActionHandler) => void;
  unregisterAction: (actionName: string) => void;
  registerActions: (actions: Record<string, AIActionHandler>) => void;
  getRegisteredActions: () => string[];
  registeredActions: string[];
}

// Global Window Interface
declare global {
  interface Window {
    $yourgptChatbot?: {
      q?: any[];
      execute?: (action: string, ...args: any[]) => void;
      on?: (event: string, callback: Function) => void;
      off?: (event: string, callback?: Function) => void;
      set?: (key: string, value: any) => void;
      push?: (action: any[]) => void;
      WIDGET_ENDPOINT?: string;
    };
    YOURGPT_WIDGET_UID?: string;
  }
}

// Error Types
export class YourGPTError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'YourGPTError';
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;