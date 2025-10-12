
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

---

# Textubes Project

A visual text transformation pipeline using React Flow. Users can create nodes, connect them, and watch text flow through transformations.

## Architecture

- **Framework**: React 19 with TypeScript
- **Flow Library**: @xyflow/react (React Flow v12)
- **Dev Server**: Bun's built-in HTML dev server (`bun run dev`)
- **Build**: Bun's bundler (`bun run build`)

## Data Flow Pattern

Following [React Flow's computing flows documentation](https://reactflow.dev/learn/advanced-use/computing-flows):

- Each node manages its own data via `updateNodeData()`
- Nodes use `useNodeConnections({ handleType: 'target' })` to get incoming connections
- Nodes use `useNodesData(sourceIds)` to read data from connected source nodes
- Data propagates automatically through the graph via React's reactivity

### Node Data Structure

```typescript
export type NodeData = {
  value: string;
};
```

All nodes store their computed output in `data.value`.

## Node Registry System

All nodes are registered in `nodeRegistry.ts`, which provides a centralized configuration for node types. To add a new node:

1. Create the component in `components/` directory
2. Import and add to `NODE_REGISTRY` in `nodeRegistry.ts` with:
   - `component`: The React component
   - `label`: Display name in the dropdown
   - `initialData`: Optional function to pre-generate initial data (required for generator nodes)

Example:
```typescript
mynewnode: {
  component: MyNewNode,
  label: "My New Node",
  initialData: () => ({ value: "initial value" }), // optional
}
```

The registry automatically:
- Populates the "Add node..." dropdown
- Handles node type registration with React Flow
- Generates initial data when nodes are created

## Node Types

All node components are in `components/` directory.

### Input/Generator Nodes
- **SourceNode** - Manual text input via textarea
- **RandomNode** - Generates random alphanumeric strings (configurable length)
- **CopypastaNode** - Dropdown selector for pre-written text samples (Lorem Ipsum, Bee Movie, etc.)

### Transformation Nodes
- **CapslockNode** - Converts text to uppercase
- **ReplaceNode** - Find/replace with three inputs (text, search, replace) - each can be connected or manually entered
- **UnicodeStyleNode** - Applies Unicode text styles (bold, italic, circled, double-struck, etc.)
- **ReverseNode** - Reverses string character order
- **TrimPadNode** - Three modes: trim whitespace, pad start, or pad end
- **RepeatNode** - Repeats input text N times
- **ConcatenateNode** - Joins multiple inputs with optional separator
  - **Dynamic handles**: Starts with 2 input handles, automatically adds more as they're connected
  - Order matters: top-to-bottom determines concatenation order
  - Connected handles are darker for visual feedback

### Output Nodes
- **ResultNode** - Display-only output node

## Critical Pattern: Avoiding Infinite Update Loops

**IMPORTANT**: React Flow nodes that use `useEffect` with `updateNodeData` can easily create loops and ResizeObserver errors if not careful.

### The Problem

Calling `updateNodeData()` during component mount or with unstable dependencies causes "ResizeObserver loop completed with undelivered notifications" errors:

1. **Root cause**: Calling `updateNodeData()` during the initial render cycle causes React Flow to resize/recalculate layout during mount, triggering the ResizeObserver error
2. **Secondary issue**: If your `useEffect` dependencies aren't carefully managed, this creates infinite loops:
   - Effect runs → calls `updateNodeData()`
   - Node data updates → component re-renders
   - Dependencies change → effect runs again
   - **INFINITE LOOP** → ResizeObserver error

**Key insight**: Avoid calling `updateNodeData()` on initial mount. Pre-generate values when creating nodes in `App.tsx`.

### Solution Patterns

#### Pattern 1: For Deterministic Transformations (CapslockNode, ReplaceNode)

Compare the computed output with current value before updating:

```typescript
useEffect(() => {
  const outputValue = computeTransformation(inputValue);

  // Only update if value actually changed
  if (data.value !== outputValue) {
    updateNodeData(id, { value: outputValue });
  }
}, [nodesData, ...otherDeps, data.value]);
```

**Key**: Extract string values from `nodesData` arrays and depend on those strings, not the arrays themselves (arrays are new references every render).

```typescript
// Extract values for use in dependencies
const inputValue = nodesData[0]?.data?.value ?? '';

useEffect(() => {
  // ... computation
}, [inputValue, data.value]); // Depend on strings, not nodesData array
```

#### Pattern 2: For Non-Deterministic Generators (RandomNode)

**CRITICAL**: Generator nodes must **pre-generate their initial value** in `App.tsx` when the node is created. The component should **skip `updateNodeData` on mount** and only update when control parameters change.

In `App.tsx` `addNode()`:

```typescript
const addNode = useCallback((nodeType: string) => {
  let initialData: any = { value: "" };

  // Pre-generate value for generator nodes
  if (nodeType === "random") {
    const randomString = generateRandomString(10);
    initialData = { value: randomString, length: 10 };
  }

  const newNode: Node<NodeData> = {
    id: `${nodeType}-${Date.now()}`,
    type: nodeType,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    data: initialData,
  };
  setNodes((nodes) => [...nodes, newNode]);
}, []);
```

In the node component:

```typescript
const lastLengthRef = useRef<number | null>(null);

useEffect(() => {
  // Skip on initial mount (value already pre-generated)
  if (lastLengthRef.current === null) {
    lastLengthRef.current = length;
    return;
  }

  // Only generate if the control parameter changed
  if (lastLengthRef.current === length) {
    return;
  }
  lastLengthRef.current = length;

  // Generate new random value
  const randomValue = generateRandom(length);
  updateNodeData(id, { value: randomValue });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [length]); // Only depend on control params, NOT updateNodeData or id
```

**Why this works**:
- Pre-generating the value prevents any `updateNodeData` call during mount, which avoids the ResizeObserver error
- The ref ensures updates only happen when control parameters change
- Excluding `updateNodeData` from deps prevents loops even if `updateNodeData` isn't stable

### Common Mistakes

❌ **DON'T**: Depend on `nodesData` arrays directly
```typescript
useEffect(() => {
  // ...
}, [nodesData]); // Array is new reference every render!
```

❌ **DON'T**: Update without comparing for deterministic transforms
```typescript
useEffect(() => {
  updateNodeData(id, { value: transform(input) }); // No comparison!
}, [input, data.value]);
```

❌ **DON'T**: Include `updateNodeData` or `id` in deps for generator nodes
```typescript
useEffect(() => {
  updateNodeData(id, { value: random() });
}, [length, id, updateNodeData]); // These cause infinite loops!
```

❌ **DON'T**: Call `updateNodeData` during initial mount for generator nodes
```typescript
useEffect(() => {
  // This will cause ResizeObserver error on mount!
  updateNodeData(id, { value: generateRandom() });
}, [length]);
```

✅ **DO**: Extract values and compare outputs for transforms
✅ **DO**: Pre-generate initial values in nodeRegistry.ts for generator nodes
✅ **DO**: Use refs to skip mount and only update on parameter changes
✅ **DO**: Test by adding a node - if you see ResizeObserver errors, you have a loop

## Interactive Elements in Nodes

All interactive elements (inputs, textareas, selects) inside nodes must have `className="nodrag"` to prevent React Flow's drag behavior from interfering with user interaction.

```typescript
<input className="nodrag" ... />
<textarea className="nodrag" ... />
<select className="nodrag" ... />
```

Without this, clicking/dragging in form fields will drag the entire node instead of allowing text selection/input.

## Multi-Handle Nodes

### Static Multiple Handles (ReplaceNode)

For nodes with a fixed number of input handles:

```typescript
// Use handleId to differentiate connections
const textConnections = useNodeConnections({ handleType: 'target', handleId: 'text' });
const searchConnections = useNodeConnections({ handleType: 'target', handleId: 'search' });

// Position handles absolutely
<Handle type="target" position={Position.Left} id="text" style={{ top: '30px' }} />
<Handle type="target" position={Position.Left} id="search" style={{ top: '75px' }} />
```

### Dynamic Multiple Handles (ConcatenateNode)

For nodes that grow to accommodate unlimited inputs:

```typescript
// Track connections by handle ID
const allConnections = useNodeConnections({ handleType: 'target' });
const handleConnections = new Map<string, string>();
allConnections.forEach(conn => {
  const handleId = conn.targetHandle || 'input-0';
  handleConnections.set(handleId, conn.source);
});

// Always have one empty handle available
const totalHandles = Math.max(2, handleConnections.size + 1);

// Dynamically render handles with proper spacing
{Array.from({ length: totalHandles }).map((_, i) => {
  const handleId = `input-${i}`;
  const isConnected = handleConnections.has(handleId);
  return (
    <Handle
      key={handleId}
      type="target"
      position={Position.Left}
      id={handleId}
      style={{
        top: `${HANDLE_START + i * HANDLE_SPACING}px`,
        background: isConnected ? '#555' : '#999',
      }}
    />
  );
})}

// Calculate node height based on handles
const minHeight = HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 15;
```

Key points:
- Start with at least 2 handles
- When all handles are connected, automatically add a new empty one
- Node height grows dynamically via `minHeight` to accommodate new handles
- Visual feedback: connected handles are darker
- Handle order (top to bottom) determines concatenation order

## TypeScript Setup

- `tsconfig.json` configured with DOM libraries for browser APIs
- All nodes use `NodeProps<Node<NodeData>>` typing
- React Flow hooks are fully typed
