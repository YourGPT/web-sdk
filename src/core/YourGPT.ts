/**
 * YourGPT Core SDK
 */

import { YourGPTConfig, YourGPTError, WidgetState, EventHandler, EventUnsubscriber } from "../types/core";

import { ChatbotAPI, AIActionsAPI, MessageData, EscalationData, SessionData, VisitorData, ContactData, GameOptions, AIActionHandler } from "../types";

import { isBrowser, createDebugLogger, validateWidgetId, validateUrl, loadScript, loadCSS, waitFor, EventEmitter } from "../utils";

interface YourGPTEvents {
  stateChange: WidgetState;
  init: void;
  messageReceived: MessageData;
  escalatedToHuman: EscalationData;
  widgetPopup: boolean;
}

/**
 * Main YourGPT SDK class
 */
class YourGPTSDK extends EventEmitter<YourGPTEvents> {
  private static instance: YourGPTSDK | null = null;
  private config: YourGPTConfig | null = null;
  private isInitialized = false;
  private logger = createDebugLogger("Core");
  private state: WidgetState = {
    isOpen: false,
    isVisible: true,
    isConnected: false,
    isLoaded: false,
    messageCount: 0,
    connectionRetries: 0,
  };
  private aiActionHandlers = new Map<string, AIActionHandler>();

  private constructor() {
    super();
    this.setupGlobalAPI();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): YourGPTSDK {
    if (!YourGPTSDK.instance) {
      YourGPTSDK.instance = new YourGPTSDK();
    }
    return YourGPTSDK.instance;
  }

  /**
   * Initialize the SDK
   */
  public async init(config: YourGPTConfig): Promise<YourGPTSDK> {
    if (this.isInitialized) {
      this.logger.warn("SDK already initialized");
      return this;
    }

    // Validate configuration
    this.validateConfig(config);

    this.config = config;
    this.logger.log("Initializing SDK with config:", config);

    // Set up global variables
    this.setupGlobalVariables();

    // Load widget if auto-load is enabled
    if (config.autoLoad !== false) {
      await this.loadWidget();
    }

    this.isInitialized = true;
    this.logger.log("SDK initialized successfully");

    return this;
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: YourGPTConfig): void {
    if (!config.widgetId) {
      throw new YourGPTError("Widget ID is required", "MISSING_WIDGET_ID");
    }

    if (!validateWidgetId(config.widgetId)) {
      throw new YourGPTError("Invalid widget ID format", "INVALID_WIDGET_ID");
    }

    if (config.endpoint && !validateUrl(config.endpoint)) {
      throw new YourGPTError("Invalid endpoint URL", "INVALID_ENDPOINT");
    }
  }

  /**
   * Set up global variables
   */
  private setupGlobalVariables(): void {
    if (!isBrowser()) return;

    window.YOURGPT_WIDGET_UID = this.config!.widgetId;

    if (!window.$yourgptChatbot) {
      window.$yourgptChatbot = {};
    }

    window.$yourgptChatbot.WIDGET_ENDPOINT = this.getEndpoint();
  }

  /**
   * Get endpoint URL
   */
  private getEndpoint(): string {
    if (this.config?.endpoint) {
      return this.config.endpoint;
    }

    // Default endpoints
    return this.config?.whitelabel ? "https://widget.d4ai.chat" : "https://widget.yourgpt.ai";
  }

  /**
   * Load widget assets
   */
  private async loadWidget(): Promise<void> {
    if (!isBrowser()) {
      throw new YourGPTError("Cannot load widget in non-browser environment", "NOT_BROWSER");
    }

    const endpoint = this.getEndpoint();

    try {
      // Create root container
      this.createRootContainer();

      // Load CSS
      await loadCSS(`${endpoint}/chatbot.css`);

      // Load JavaScript
      await loadScript(`${endpoint}/chatbot.js`);

      // Wait for widget to be ready
      await waitFor(() => this.isWidgetReady(), 10000);

      this.updateState({ isLoaded: true });
      this.logger.log("Widget loaded successfully");
    } catch (error) {
      this.logger.error("Failed to load widget:", error);
      throw new YourGPTError("Failed to load widget", "WIDGET_LOAD_FAILED");
    }
  }

  /**
   * Create root container for widget
   */
  private createRootContainer(): void {
    if (document.getElementById("yourgpt_root")) {
      return; // Already exists
    }

    const root = document.createElement("div");
    root.id = "yourgpt_root";
    root.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    document.body.appendChild(root);
  }

  /**
   * Check if widget is ready
   */
  private isWidgetReady(): boolean {
    return Boolean(window.$yourgptChatbot?.execute && window.$yourgptChatbot?.on && window.$yourgptChatbot?.set);
  }

  /**
   * Set up global API for backwards compatibility
   */
  private setupGlobalAPI(): void {
    if (!isBrowser()) return;

    // Initialize command queue
    if (!window.$yourgptChatbot) {
      window.$yourgptChatbot = {
        q: [],
        execute: (action: string, ...args: any[]) => {
          window.$yourgptChatbot!.q!.push(["execute", action, ...args]);
        },
        on: (event: string, callback: Function) => {
          window.$yourgptChatbot!.q!.push(["on", event, callback]);
        },
        off: (event: string, callback?: Function) => {
          window.$yourgptChatbot!.q!.push(["off", event, callback]);
        },
        set: (key: string, value: any) => {
          window.$yourgptChatbot!.q!.push(["set", key, value]);
        },
      };
    }
  }

  /**
   * Update widget state
   */
  private updateState(updates: Partial<WidgetState>): void {
    this.state = { ...this.state, ...updates };
    this.emit("stateChange", this.state);
  }

  /**
   * Execute widget command
   */
  private executeCommand(command: string, ...args: any[]): void {
    if (!this.isWidgetReady()) {
      this.logger.warn("Widget not ready, queueing command:", command);
      window.$yourgptChatbot?.q?.push(["execute", command, ...args]);
      return;
    }

    window.$yourgptChatbot!.execute!(command, ...args);
  }

  /**
   * Register event listener
   */
  private registerEventListener(event: string, callback: Function): void {
    if (!this.isWidgetReady()) {
      this.logger.warn("Widget not ready, queueing event listener:", event);
      window.$yourgptChatbot?.q?.push(["on", event, callback]);
      return;
    }

    window.$yourgptChatbot!.on!(event, callback);
  }

  /**
   * Set widget data
   */
  private setWidgetData(key: string, value: any): void {
    if (!this.isWidgetReady()) {
      this.logger.warn("Widget not ready, queueing data:", key);
      window.$yourgptChatbot?.q?.push(["set", key, value]);
      return;
    }

    window.$yourgptChatbot!.set!(key, value);
  }

  /**
   * Get current configuration
   */
  public getConfig(): YourGPTConfig | null {
    return this.config;
  }

  /**
   * Get current state
   */
  public getState(): WidgetState {
    return { ...this.state };
  }

  /**
   * Check if SDK is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Widget Controls
   */
  public open(): void {
    this.executeCommand("widget:open");
    this.updateState({ isOpen: true });
  }

  public close(): void {
    this.executeCommand("widget:close");
    this.updateState({ isOpen: false });
  }

  public toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public show(): void {
    this.executeCommand("widget:show");
    this.updateState({ isVisible: true });
  }

  public hide(): void {
    this.executeCommand("widget:hide");
    this.updateState({ isVisible: false });
  }

  /**
   * Messaging
   */
  public sendMessage(text: string, autoSend: boolean = true): void {
    this.executeCommand("message:send", { text, send: autoSend });
  }

  /**
   * Advanced Features
   */
  public openBottomSheet(url: string): void {
    this.executeCommand("bottomSheet:open", { url });
  }

  public startGame(gameId: string, options: GameOptions = {}): void {
    this.executeCommand("game:start", { id: gameId, ...options });
  }

  /**
   * Data Management
   */
  public setSessionData(data: SessionData): void {
    this.setWidgetData("session:data", data);
  }

  public setVisitorData(data: VisitorData): void {
    this.setWidgetData("visitor:data", data);
  }

  public setContactData(data: ContactData): void {
    this.setWidgetData("contact:data", data);
  }

  /**
   * Event Listeners
   */
  public onInit(callback: EventHandler<void>): EventUnsubscriber {
    const wrappedCallback = () => {
      this.updateState({ isConnected: true });
      callback();
    };

    this.registerEventListener("init", wrappedCallback);
    return () => window.$yourgptChatbot?.off?.("init", wrappedCallback);
  }

  public onMessageReceived(callback: EventHandler<MessageData>): EventUnsubscriber {
    const wrappedCallback = (data: MessageData) => {
      this.updateState({ messageCount: this.state.messageCount + 1 });
      callback(data);
    };

    this.registerEventListener("message:received", wrappedCallback);
    return () => window.$yourgptChatbot?.off?.("message:received", wrappedCallback);
  }

  public onEscalatedToHuman(callback: EventHandler<EscalationData>): EventUnsubscriber {
    this.registerEventListener("escalatedToHuman", callback);
    return () => window.$yourgptChatbot?.off?.("escalatedToHuman", callback);
  }

  public onWidgetPopup(callback: EventHandler<boolean>): EventUnsubscriber {
    const wrappedCallback = (isOpen: boolean) => {
      this.updateState({ isOpen });
      callback(isOpen);
    };

    this.registerEventListener("widget:popup", wrappedCallback);
    return () => window.$yourgptChatbot?.off?.("widget:popup", wrappedCallback);
  }

  /**
   * AI Actions
   */
  public registerAIAction(actionName: string, handler: AIActionHandler): void {
    this.aiActionHandlers.set(actionName, handler);
    this.registerEventListener(`ai:action:${actionName}`, handler);
  }

  public unregisterAIAction(actionName: string): void {
    this.aiActionHandlers.delete(actionName);
    window.$yourgptChatbot?.off?.(`ai:action:${actionName}`);
  }

  public getRegisteredAIActions(): string[] {
    return Array.from(this.aiActionHandlers.keys());
  }

  /**
   * Create complete chatbot API
   */
  public createChatbotAPI(): ChatbotAPI {
    return {
      // State
      ...this.getState(),

      // Widget Controls
      open: this.open.bind(this),
      close: this.close.bind(this),
      toggle: this.toggle.bind(this),
      show: this.show.bind(this),
      hide: this.hide.bind(this),

      // Messaging
      sendMessage: this.sendMessage.bind(this),

      // Advanced Features
      openBottomSheet: this.openBottomSheet.bind(this),
      startGame: this.startGame.bind(this),

      // Data Management
      setSessionData: this.setSessionData.bind(this),
      setVisitorData: this.setVisitorData.bind(this),
      setContactData: this.setContactData.bind(this),

      // Event Listeners
      onInit: this.onInit.bind(this),
      onMessageReceived: this.onMessageReceived.bind(this),
      onEscalatedToHuman: this.onEscalatedToHuman.bind(this),
      onWidgetPopup: this.onWidgetPopup.bind(this),
    };
  }

  /**
   * Create AI Actions API
   */
  public createAIActionsAPI(): AIActionsAPI {
    return {
      registerAction: this.registerAIAction.bind(this),
      unregisterAction: this.unregisterAIAction.bind(this),
      registerActions: (actions: Record<string, AIActionHandler>) => {
        Object.entries(actions).forEach(([name, handler]) => {
          this.registerAIAction(name, handler);
        });
      },
      getRegisteredActions: this.getRegisteredAIActions.bind(this),
      get registeredActions() {
        return this.getRegisteredActions();
      },
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.removeAllListeners();
    this.aiActionHandlers.clear();
    this.isInitialized = false;
    this.config = null;
    YourGPTSDK.instance = null;
  }
}

/**
 * Static methods for easier usage
 */
const YourGPT = {
  /**
   * Initialize the SDK
   */
  init: (config: YourGPTConfig) => {
    const sdk = YourGPTSDK.getInstance();
    return sdk.init(config);
  },

  /**
   * Get the SDK instance
   */
  getInstance: () => {
    return YourGPTSDK.getInstance();
  },
};

export { YourGPTSDK };
export default YourGPT;
