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
import { getNodeTypes, getInitialNodeData } from "./nodeRegistry";
import NodePicker from "./components/NodePicker";

export type NodeData = {
  value: string;
  isDarkMode?: boolean;
};

const nodeTypes = getNodeTypes();

const STORAGE_KEY_NODES = "textubes-nodes";
const STORAGE_KEY_EDGES = "textubes-edges";
const STORAGE_KEY_DARK_MODE = "textubes-dark-mode";

const defaultNodes: Node<NodeData>[] = [
  {
    id: "source1",
    type: "source",
    position: { x: 50, y: 100 },
    data: {
      value:
        "(Drag the resize control at the bottom right of this text area to make the box bigger!)\n\n",
    },
  },
  {
    id: "concatenate1",
    type: "concatenate",
    position: { x: 350, y: 150 },
    data: { value: "" },
  },
  {
    id: "help1",
    type: "help",
    position: { x:50, y: 350 },
    data: getInitialNodeData("help"),
  },
  {
    id: "result1",
    type: "result",
    position: { x: 600, y: 100 },
    data: { value: "" },
  },
];
const defaultEdges: Edge[] = [
  {
    id: "e-help1-concatenate1",
    source: "help1",
    target: "concatenate1",
        targetHandle: "input-1",
  },
  {
    id: "e-source1-concatenate1",
    source: "source1",
    target: "concatenate1",
  },
    {
    id: "e-concatenate1-result1",
    source: "concatenate1",
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
  const onConnect = useCallback((params: Connection) => {
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
  }, []);

  // Save to localStorage whenever nodes, edges, or dark mode changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
    } catch (error) {
      console.error("Error saving nodes to localStorage:", error);
    }
  }, [nodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
    } catch (error) {
      console.error("Error saving edges to localStorage:", error);
    }
  }, [edges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Error saving dark mode to localStorage:", error);
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: isDarkMode ? "#1a1a1a" : "#ffffff",
      }}
    >
      <NodePicker
        onAddNode={addNode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={(_, params) => {
          // When starting a connection, remove any existing edges on the target handle
          if (params.handleType === "source") {
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
