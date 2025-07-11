/**
 * Test setup file
 */

import { vi } from 'vitest';

// Mock window object for browser environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock document
Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock global YourGPT chatbot
global.window = {
  ...window,
  $yourgptChatbot: {
    q: [],
    execute: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    set: vi.fn(),
    push: vi.fn(),
  },
};