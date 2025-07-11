/**
 * React Hook for YourGPT Chatbot functionality
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import YourGPT, { YourGPTSDK } from '../../core/YourGPT';
import { 
  ChatbotAPI, 
  WidgetState, 
  MessageData, 
  EscalationData, 
  SessionData, 
  VisitorData, 
  ContactData, 
  GameOptions,
  EventUnsubscriber
} from '../../types';

/**
 * Hook for controlling the chatbot widget
 */
export function useYourGPTChatbot(): ChatbotAPI {
  const [state, setState] = useState<WidgetState>({
    isOpen: false,
    isVisible: true,
    isConnected: false,
    isLoaded: false,
    messageCount: 0,
    connectionRetries: 0
  });

  const sdkRef = useRef<YourGPTSDK | null>(null);
  const unsubscribersRef = useRef<EventUnsubscriber[]>([]);

  // Get SDK instance
  useEffect(() => {
    const sdk = YourGPT.getInstance();
    sdkRef.current = sdk;
    
    // Update state
    setState(sdk.getState());

    // Listen for state changes
    const unsubscribe = sdk.on('stateChange', (newState: WidgetState) => {
      setState(newState);
    });

    unsubscribersRef.current.push(unsubscribe);

    return () => {
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, []);

  // Widget control functions
  const widgetControls = useMemo(() => ({
    open: () => sdkRef.current?.open(),
    close: () => sdkRef.current?.close(),
    toggle: () => sdkRef.current?.toggle(),
    show: () => sdkRef.current?.show(),
    hide: () => sdkRef.current?.hide(),
  }), []);

  // Messaging functions
  const messaging = useMemo(() => ({
    sendMessage: (text: string, autoSend: boolean = true) => {
      sdkRef.current?.sendMessage(text, autoSend);
    },
  }), []);

  // Advanced features
  const advanced = useMemo(() => ({
    openBottomSheet: (url: string) => {
      sdkRef.current?.openBottomSheet(url);
    },
    startGame: (gameId: string, options: GameOptions = {}) => {
      sdkRef.current?.startGame(gameId, options);
    },
  }), []);

  // Data management
  const dataManagement = useMemo(() => ({
    setSessionData: (data: SessionData) => {
      sdkRef.current?.setSessionData(data);
    },
    setVisitorData: (data: VisitorData) => {
      sdkRef.current?.setVisitorData(data);
    },
    setContactData: (data: ContactData) => {
      sdkRef.current?.setContactData(data);
    },
  }), []);

  // Event listeners
  const eventListeners = useMemo(() => ({
    onInit: (callback: () => void) => {
      const unsubscribe = sdkRef.current?.onInit(callback);
      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }
      return unsubscribe || (() => {});
    },
    onMessageReceived: (callback: (data: MessageData) => void) => {
      const unsubscribe = sdkRef.current?.onMessageReceived(callback);
      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }
      return unsubscribe || (() => {});
    },
    onEscalatedToHuman: (callback: (data: EscalationData) => void) => {
      const unsubscribe = sdkRef.current?.onEscalatedToHuman(callback);
      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }
      return unsubscribe || (() => {});
    },
    onWidgetPopup: (callback: (isOpen: boolean) => void) => {
      const unsubscribe = sdkRef.current?.onWidgetPopup(callback);
      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }
      return unsubscribe || (() => {});
    },
  }), []);

  return {
    // State
    ...state,
    // Functions
    ...widgetControls,
    ...messaging,
    ...advanced,
    ...dataManagement,
    ...eventListeners,
  };
}