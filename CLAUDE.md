
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

## Node Types

All node components are in `components/` directory.

### 1. SourceNode
- **Type**: Input node
- User input via textarea
- Updates its own data on change using `updateNodeData()`
- Has one source handle (output on right)
- No `useEffect` needed - updates directly on user input

### 2. ResultNode
- **Type**: Display/output node
- Displays input from connected nodes
- Read-only display, computes inline during render
- Has one target handle (input on left)
- No `useEffect` needed - just reads and displays

### 3. CapslockNode
- **Type**: Single-input transformation node
- Converts text to uppercase
- Reads from connected input via `useNodesData()`
- Computes transformation in `useEffect`
- Updates own data via `updateNodeData()`
- Has both target (left) and source (right) handles

### 4. ReplaceNode
- **Type**: Multi-input transformation node
- Replaces text using search/replace strings
- Has three target handles (text input, search, replace) with IDs
- Each input can come from a connected node OR a text field
- Text fields are disabled when nodes are connected
- Handles positioned absolutely to sit on node border

### 5. RandomNode
- **Type**: Generator node (no inputs)
- Generates random alphanumeric strings
- Has numeric input field for length
- Only has source handle (output on right)
- Uses `useRef` to track when to regenerate (see critical pattern below)

## Critical Pattern: Avoiding Infinite Update Loops

**IMPORTANT**: React Flow nodes that use `useEffect` with `updateNodeData` can easily create infinite loops if not careful.

### The Problem

When you call `updateNodeData()`, it triggers a re-render. If your `useEffect` dependencies aren't carefully managed, this creates a loop:

1. Effect runs → calls `updateNodeData()`
2. Node data updates → component re-renders
3. Dependencies change → effect runs again
4. **INFINITE LOOP** → "ResizeObserver loop completed with undelivered notifications"

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

Use a `useRef` to track when to actually update, and **exclude `updateNodeData` from dependencies**:

```typescript
const lastLengthRef = useRef<number | null>(null);

useEffect(() => {
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

**Why this works**: The ref prevents redundant generations, and excluding `updateNodeData` from deps prevents the loop even if `updateNodeData` isn't stable.

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

✅ **DO**: Extract values and compare outputs for transforms
✅ **DO**: Use refs for generators and minimal dependencies
✅ **DO**: Test by adding a node - if you see ResizeObserver errors, you have a loop

## Adding New Nodes

To add a new node:

1. Create component in `components/` directory
2. Choose the right pattern based on node type:
   - **Input nodes**: Update on user interaction, no `useEffect`
   - **Display nodes**: Compute inline during render, no `useEffect`
   - **Transformation nodes**: Use Pattern 1 (compare before update)
   - **Generator nodes**: Use Pattern 2 (ref + minimal deps)
3. Register in `App.tsx` nodeTypes
4. Add to the "Add node..." dropdown menu

### Multi-Handle Nodes

For nodes with multiple input handles (like ReplaceNode):

```typescript
// Use handleId to differentiate connections
const textConnections = useNodeConnections({ handleType: 'target', handleId: 'text' });
const searchConnections = useNodeConnections({ handleType: 'target', handleId: 'search' });

// Position handles absolutely at top of component
<Handle type="target" position={Position.Left} id="text" style={{ top: '30px' }} />
<Handle type="target" position={Position.Left} id="search" style={{ top: '75px' }} />
```

## TypeScript Setup

- `tsconfig.json` configured with DOM libraries for browser APIs
- All nodes use `NodeProps<Node<NodeData>>` typing
- React Flow hooks are fully typed
