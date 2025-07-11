/**
 * React Hook for YourGPT SDK
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import YourGPT, { YourGPTSDK } from '../../core/YourGPT';
import { YourGPTConfig, WidgetState, YourGPTError } from '../../types';

interface UseYourGPTOptions {
  config?: YourGPTConfig;
  autoInit?: boolean;
}

interface UseYourGPTReturn {
  sdk: YourGPTSDK | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: YourGPTError | null;
  state: WidgetState;
  init: (config: YourGPTConfig) => Promise<void>;
  destroy: () => void;
}

/**
 * Main hook for YourGPT SDK
 */
export function useYourGPT(options: UseYourGPTOptions = {}): UseYourGPTReturn {
  const { config, autoInit = true } = options;
  
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
    connectionRetries: 0
  });

  const sdkRef = useRef<YourGPTSDK | null>(null);

  const init = useCallback(async (initConfig: YourGPTConfig) => {
    if (isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sdkInstance = await YourGPT.init(initConfig);
      
      // Listen for state changes
      const unsubscribe = sdkInstance.on('stateChange', (newState: WidgetState) => {
        setState(newState);
      });

      sdkRef.current = sdkInstance;
      setSdk(sdkInstance);
      setIsInitialized(true);
      setState(sdkInstance.getState());

      // Store unsubscribe function for cleanup
      (sdkInstance as any)._unsubscribeStateChange = unsubscribe;

    } catch (err) {
      const sdkError = err instanceof YourGPTError ? err : new YourGPTError(String(err));
      setError(sdkError);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const destroy = useCallback(() => {
    if (sdkRef.current) {
      // Cleanup state change listener
      if ((sdkRef.current as any)._unsubscribeStateChange) {
        (sdkRef.current as any)._unsubscribeStateChange();
      }
      
      sdkRef.current.destroy();
      sdkRef.current = null;
      setSdk(null);
      setIsInitialized(false);
      setState({
        isOpen: false,
        isVisible: true,
        isConnected: false,
        isLoaded: false,
        messageCount: 0,
        connectionRetries: 0
      });
    }
  }, []);

  // Auto-initialize if config is provided
  useEffect(() => {
    if (config && autoInit && !isInitialized && !isLoading) {
      init(config);
    }
  }, [config, autoInit, isInitialized, isLoading, init]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sdkRef.current) {
        // Cleanup state change listener
        if ((sdkRef.current as any)._unsubscribeStateChange) {
          (sdkRef.current as any)._unsubscribeStateChange();
        }
      }
    };
  }, []);

  return {
    sdk,
    isInitialized,
    isLoading,
    error,
    state,
    init,
    destroy
  };
}