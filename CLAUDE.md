
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

### 1. SourceNode
- User input via textarea
- Updates its own data on change using `updateNodeData()`
- Has one source handle (output on right)

### 2. ResultNode
- Displays input from connected nodes
- Read-only display
- Has one target handle (input on left)

### 3. CapslockNode
- Transformation node that converts text to uppercase
- Reads from connected input via `useNodesData()`
- Computes transformation in `useEffect`
- Updates own data via `updateNodeData()`
- Has both target (left) and source (right) handles

## Adding New Transformation Nodes

To add a new transformation:

1. Create a new node component (e.g., `LowercaseNode.tsx`)
2. Follow the pattern in `CapslockNode.tsx`:
   - Use `useNodeConnections({ handleType: 'target' })` for inputs
   - Use `useNodesData(sourceIds)` to read input data
   - Compute transformation in `useEffect`
   - Call `updateNodeData(id, { value: output })` with result
3. Register in `App.tsx` nodeTypes
4. Add to the "Add node..." dropdown menu

## TypeScript Setup

- `tsconfig.json` configured with DOM libraries for browser APIs
- All nodes use `NodeProps<Node<NodeData>>` typing
- React Flow hooks are fully typed
