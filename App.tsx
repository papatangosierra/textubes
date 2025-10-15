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

const initialNodes: Node<NodeData>[] = [
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
const initialEdges: Edge[] = [
  {
    id: "e-source1-result1",
    source: "source1",
    target: "result1",
  },
];

export default function App() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

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
          padding: "8px",
          borderRadius: "4px",
          boxShadow: isDarkMode
            ? "0 2px 4px rgba(0,0,0,0.4)"
            : "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
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
            padding: "6px 10px",
            border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
            borderRadius: "3px",
            cursor: "pointer",
            background: isDarkMode ? "#3a3a3a" : "white",
            color: isDarkMode ? "#e0e0e0" : "#000",
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
            padding: "6px 12px",
            border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
            borderRadius: "3px",
            cursor: "pointer",
            background: isDarkMode ? "#3a3a3a" : "white",
            color: isDarkMode ? "#e0e0e0" : "#000",
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
        fitView
        colorMode={isDarkMode ? "dark" : "light"}
      >
        <MiniMap nodeStrokeWidth={3} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
