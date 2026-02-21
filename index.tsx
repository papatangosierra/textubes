import React from "react";
import { createRoot } from "react-dom/client";
import Router from "./components/Router";

// Prevent ResizeObserver loop errors from React Flow.
// When many nodes mount simultaneously, ResizeObserver callbacks trigger
// layout changes that create more observations, exceeding the browser's
// loop limit. Deferring callbacks to the next animation frame breaks the
// synchronous loop so the browser never fires the error.
// See: https://github.com/xyflow/xyflow/issues/3076
const _OrigResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends _OrigResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => callback(entries, observer));
    });
  }
};

const root = createRoot(document.body);
root.render(<Router />);
