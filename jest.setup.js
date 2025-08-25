import '@testing-library/jest-dom';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Polyfills for JSDOM missing methods required by Radix UI components
beforeAll(async () => {
  // Only apply polyfills in JSDOM environment (for UI component tests)
  if (typeof Element !== 'undefined') {
    // Pointer capture methods used by Radix UI dropdown/select components
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => {};
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => {};
    }
  
    // Scroll methods used by form components
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
  }
  
  // IntersectionObserver used by Radix UI for viewport detection
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };
  
  // ResizeObserver used by Radix UI for responsive behavior
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };

  // Mock requestAnimationFrame and cancelAnimationFrame
  global.requestAnimationFrame = (callback) => {
    return setTimeout(() => callback(Date.now()), 0);
  };
  global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };

  // Mock matchMedia for responsive queries
  global.matchMedia = global.matchMedia || function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
  };

  // Mock HTMLElement.prototype.animate for Radix UI animations (only in JSDOM)
  if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.animate) {
    HTMLElement.prototype.animate = () => ({
      cancel: () => {},
      finish: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      play: () => {},
      pause: () => {},
      reverse: () => {},
      updatePlaybackRate: () => {},
      persist: () => {},
      commitStyles: () => {},
      currentTime: 0,
      effect: null,
      finished: Promise.resolve(),
      id: '',
      pending: false,
      playState: 'idle',
      playbackRate: 1,
      ready: Promise.resolve(),
      replaceState: 'active',
      startTime: null,
      timeline: null,
      oncancel: null,
      onfinish: null,
      onremove: null,
    });
  }
});
