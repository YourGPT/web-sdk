/**
 * React Hook for AI Actions functionality
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import YourGPT, { YourGPTSDK } from '../../core/YourGPT';
import { AIActionsAPI, AIActionHandler } from '../../types';

/**
 * Hook for managing AI action handlers
 */
export function useAIActions(): AIActionsAPI {
  const [registeredActions, setRegisteredActions] = useState<string[]>([]);
  const handlersRef = useRef<Map<string, AIActionHandler>>(new Map());
  const sdkRef = useRef<YourGPTSDK | null>(null);

  // Get SDK instance
  useEffect(() => {
    const sdk = YourGPT.getInstance();
    sdkRef.current = sdk;
    
    // Update registered actions
    setRegisteredActions(sdk.getRegisteredAIActions());
  }, []);

  // Register an AI action
  const registerAction = useCallback((actionName: string, handler: AIActionHandler) => {
    if (!sdkRef.current) return;

    // Store locally
    handlersRef.current.set(actionName, handler);
    
    // Register with SDK
    sdkRef.current.registerAIAction(actionName, handler);
    
    // Update state
    setRegisteredActions(Array.from(handlersRef.current.keys()));
  }, []);

  // Unregister an AI action
  const unregisterAction = useCallback((actionName: string) => {
    if (!sdkRef.current) return;

    // Remove locally
    handlersRef.current.delete(actionName);
    
    // Unregister from SDK
    sdkRef.current.unregisterAIAction(actionName);
    
    // Update state
    setRegisteredActions(Array.from(handlersRef.current.keys()));
  }, []);

  // Get registered actions
  const getRegisteredActions = useCallback(() => {
    return Array.from(handlersRef.current.keys());
  }, []);

  // Batch register multiple actions
  const registerActions = useCallback((actions: Record<string, AIActionHandler>) => {
    Object.entries(actions).forEach(([name, handler]) => {
      registerAction(name, handler);
    });
  }, [registerAction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all registered handlers
      handlersRef.current.forEach((_, actionName) => {
        sdkRef.current?.unregisterAIAction(actionName);
      });
      handlersRef.current.clear();
    };
  }, []);

  return {
    registerAction,
    unregisterAction,
    registerActions,
    getRegisteredActions,
    registeredActions,
  };
}