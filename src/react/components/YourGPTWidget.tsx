/**
 * React Component for YourGPT Widget
 */

import React, { useEffect, useRef } from 'react';
import { YourGPT } from '../../core/YourGPT';
import { YourGPTConfig, YourGPTError } from '../../types';

interface YourGPTWidgetProps {
  config: YourGPTConfig;
  onError?: (error: YourGPTError) => void;
  onInitialized?: () => void;
  onMessageReceived?: (data: any) => void;
  onEscalatedToHuman?: (data: any) => void;
  onWidgetPopup?: (isOpen: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Widget component that handles initialization and basic event handling
 */
export function YourGPTWidget({
  config,
  onError,
  onInitialized,
  onMessageReceived,
  onEscalatedToHuman,
  onWidgetPopup,
  className,
  style
}: YourGPTWidgetProps) {
  const initializedRef = useRef(false);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (initializedRef.current) return;

    const initializeWidget = async () => {
      try {
        const sdk = await YourGPT.init(config);
        
        // Set up event listeners
        const unsubscribers: Array<() => void> = [];

        if (onInitialized) {
          unsubscribers.push(sdk.onInit(onInitialized));
        }

        if (onMessageReceived) {
          unsubscribers.push(sdk.onMessageReceived(onMessageReceived));
        }

        if (onEscalatedToHuman) {
          unsubscribers.push(sdk.onEscalatedToHuman(onEscalatedToHuman));
        }

        if (onWidgetPopup) {
          unsubscribers.push(sdk.onWidgetPopup(onWidgetPopup));
        }

        unsubscribersRef.current = unsubscribers;
        initializedRef.current = true;

      } catch (err) {
        const error = err instanceof YourGPTError ? err : new YourGPTError(String(err));
        if (onError) {
          onError(error);
        }
      }
    };

    initializeWidget();

    return () => {
      // Cleanup event listeners
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];
    };
  }, [config, onError, onInitialized, onMessageReceived, onEscalatedToHuman, onWidgetPopup]);

  // This component doesn't render anything visible
  // The widget is rendered by the YourGPT system in the root container
  return (
    <div 
      className={className}
      style={{ display: 'none', ...style }}
      data-yourgpt-widget="true"
    />
  );
}