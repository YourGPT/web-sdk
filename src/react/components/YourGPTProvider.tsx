/**
 * React Provider for YourGPT SDK
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import YourGPT, { YourGPTSDK } from "../../core/YourGPT";
import { YourGPTConfig, YourGPTError, WidgetState } from "../../types";
declare global {
  interface Window {
    YGC_WIDGET?: {
      renderEmbedded: (container: HTMLElement) => void;
    };
  }
}

interface YourGPTContextValue {
  sdk: YourGPTSDK | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: YourGPTError | null;
  state: WidgetState;
}

const YourGPTContext = createContext<YourGPTContextValue | null>(null);

interface YourGPTProviderProps {
  children: ReactNode;
  config: YourGPTConfig;
  onError?: (error: YourGPTError) => void;
  onInitialized?: (sdk: YourGPTSDK) => void;
}

/**
 * Provider component for YourGPT SDK
 */
export function YourGPTProvider({ children, config, onError, onInitialized }: YourGPTProviderProps) {
  const [isBrowser, setIsBrowser] = useState(false);
  const [sdk, setSdk] = useState<YourGPTSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<YourGPTError | null>(null);
  const [state, setState] = useState<WidgetState>({
    isOpen: false,
    isVisible: true,
    isConnected: false,
    isLoaded: false,
    messageCount: 0,
    connectionRetries: 0,
  });

  // Set browser state
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    // Don't initialize during SSR
    if (!isBrowser) return;

    const initializeSDK = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sdkInstance = await YourGPT.init(config);

        // Listen for state changes
        const unsubscribe = sdkInstance.on("stateChange", (newState: WidgetState) => {
          setState(newState);
        });

        setSdk(sdkInstance);
        setIsInitialized(true);
        setState(sdkInstance.getState());

        // Store unsubscribe function for cleanup
        (sdkInstance as any)._unsubscribeStateChange = unsubscribe;

        if (onInitialized) {
          onInitialized(sdkInstance);
        }
      } catch (err) {
        const sdkError = err instanceof YourGPTError ? err : new YourGPTError(String(err));
        setError(sdkError);

        if (onError) {
          onError(sdkError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();

    return () => {
      if (sdk) {
        // Cleanup state change listener
        if ((sdk as any)._unsubscribeStateChange) {
          (sdk as any)._unsubscribeStateChange();
        }
      }
    };
  }, [config, onError, onInitialized, isBrowser]);

  const value: YourGPTContextValue = {
    sdk,
    isInitialized,
    isLoading,
    error,
    state,
  };

  return <YourGPTContext.Provider value={value}>{children}</YourGPTContext.Provider>;
}

/**
 * Hook to use YourGPT context
 */
export function useYourGPT(): YourGPTContextValue {
  const context = useContext(YourGPTContext);

  if (!context) {
    throw new YourGPTError("useYourGPT must be used within a YourGPTProvider");
  }

  return context;
}
