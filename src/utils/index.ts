/**
 * YourGPT SDK Utilities
 */

import { YourGPTError } from '../types';

/**
 * Check if we're in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if we're in a development environment
 */
export const isDevelopment = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
};

/**
 * Create a debug logger that only logs in development
 */
export const createDebugLogger = (namespace: string) => {
  return {
    log: (message: string, ...args: any[]) => {
      if (isDevelopment()) {
        console.log(`[YourGPT SDK:${namespace}] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (isDevelopment()) {
        console.warn(`[YourGPT SDK:${namespace}] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (isDevelopment()) {
        console.error(`[YourGPT SDK:${namespace}] ${message}`, ...args);
      }
    }
  };
};

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const start = Date.now();
  
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new YourGPTError(`Timeout after ${timeout}ms waiting for condition`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

/**
 * Retry a function with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Deep merge objects
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Validate widget ID format
 */
export const validateWidgetId = (widgetId: string): boolean => {
  // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(widgetId);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  if (!isBrowser()) return html;
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      func(...args);
    }
  };
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element: Element): boolean => {
  if (!isBrowser()) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Load external script
 */
export const loadScript = (src: string, async: boolean = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new YourGPTError('Cannot load script in non-browser environment'));
      return;
    }
    
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.type = 'module';
    
    script.onload = () => resolve();
    script.onerror = () => reject(new YourGPTError(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
};

/**
 * Load external CSS
 */
export const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new YourGPTError('Cannot load CSS in non-browser environment'));
      return;
    }
    
    // Check if CSS already exists
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new YourGPTError(`Failed to load CSS: ${href}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Event emitter utility
 */
export class EventEmitter<T extends Record<string, any>> {
  private events: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};
  
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event]!.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
  
  off<K extends keyof T>(event: K, callback?: (data: T[K]) => void): void {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event]!.filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
  }
  
  emit<K extends keyof T>(event: K, data: T[K]): void {
    if (!this.events[event]) return;
    
    this.events[event]!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${String(event)}:`, error);
      }
    });
  }
  
  removeAllListeners(): void {
    this.events = {};
  }
}