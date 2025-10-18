import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NODE_REGISTRY, getNodeTypes, getInitialNodeData } from "./nodeRegistry";

export type NodeData = {
  value: string;
  isDarkMode?: boolean;
};

const nodeTypes = getNodeTypes();

const STORAGE_KEY_NODES = 'textubes-nodes';
const STORAGE_KEY_EDGES = 'textubes-edges';
const STORAGE_KEY_DARK_MODE = 'textubes-dark-mode';

const defaultNodes: Node<NodeData>[] = [
  {
    id: "source1",
    type: "source",
    position: { x: 50, y: 100 },
    data: { value: "I am seated in a room surrounded by heads and bodies." },
  },
  {
    id: "result1",
    type: "result",
    position: { x: 400, y: 100 },
    data: { value: "" },
  },
];
const defaultEdges: Edge[] = [
  {
    id: "e-source1-result1",
    source: "source1",
    target: "result1",
  },
];

// Load from localStorage or use defaults
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export default function App() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(() =>
    loadFromStorage(STORAGE_KEY_NODES, defaultNodes)
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    loadFromStorage(STORAGE_KEY_EDGES, defaultEdges)
  );
  const [isDarkMode, setIsDarkMode] = useState(() =>
    loadFromStorage(STORAGE_KEY_DARK_MODE, false)
  );

  const addNode = useCallback((nodeType: string) => {
    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: getInitialNodeData(nodeType),
    };
    setNodes((nodes) => [...nodes, newNode]);
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((edgesSnapshot) => {
        // Remove any existing edges connected to the same target handle
        // Note: handles without explicit IDs will have null/undefined as their handle ID
        const filteredEdges = edgesSnapshot.filter((edge) => {
          const sameTarget = edge.target === params.target;
          // Compare handles, treating null/undefined as equivalent
          const edgeHandle = edge.targetHandle ?? null;
          const paramsHandle = params.targetHandle ?? null;
          const sameTargetHandle = edgeHandle === paramsHandle;

          // Keep edges that don't match both target AND handle
          return !(sameTarget && sameTargetHandle);
        });

        // Add the new edge
        return addEdge(params, filteredEdges);
      });
    },
    []
  );

  // Save to localStorage whenever nodes, edges, or dark mode changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
    } catch (error) {
      console.error('Error saving nodes to localStorage:', error);
    }
  }, [nodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
    } catch (error) {
      console.error('Error saving edges to localStorage:', error);
    }
  }, [edges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode to localStorage:', error);
    }
  }, [isDarkMode]);

  // Update all nodes' dark mode state whenever it changes
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: { ...node.data, isDarkMode },
      }))
    );
  }, [isDarkMode]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: isDarkMode ? "#1a1a1a" : "#ffffff",
    }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: isDarkMode ? "#2a2a2a" : "white",
          padding: "clamp(8px, 2vw, 12px)",
          borderRadius: "4px",
          boxShadow: isDarkMode
            ? "0 2px 4px rgba(0,0,0,0.4)"
            : "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          onChange={(e) => {
            const target = e.target as HTMLSelectElement;
            if (target.value) {
              addNode(target.value);
              target.value = "";
            }
          }}
          style={{
            padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 14px)",
            border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
            borderRadius: "3px",
            cursor: "pointer",
            background: isDarkMode ? "#3a3a3a" : "white",
            color: isDarkMode ? "#e0e0e0" : "#000",
            fontSize: "clamp(14px, 3vw, 16px)",
            minHeight: "44px",
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Add node...
          </option>
          {Object.entries(NODE_REGISTRY).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)",
            border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
            borderRadius: "3px",
            cursor: "pointer",
            background: isDarkMode ? "#3a3a3a" : "white",
            color: isDarkMode ? "#e0e0e0" : "#000",
            fontSize: "clamp(16px, 3vw, 18px)",
            minHeight: "44px",
            minWidth: "44px",
          }}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={(_, params) => {
          // When starting a connection, remove any existing edges on the target handle
          if (params.handleType === 'source') {
            // User is dragging from a source handle - we'll handle this in onConnect
            return;
          }
        }}
        fitView
        colorMode={isDarkMode ? "dark" : "light"}
      >
        <MiniMap nodeStrokeWidth={3} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
