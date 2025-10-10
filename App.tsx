import { useState, useCallback } from "react";
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
import SourceNode from "./SourceNode";
import ResultNode from "./ResultNode";
import CapslockNode from "./CapslockNode";

export type NodeData = {
  value: string;
};

const nodeTypes = {
  source: SourceNode,
  result: ResultNode,
  capslock: CapslockNode,
} as const;

const initialNodes: Node<NodeData>[] = [
  {
    id: "source1",
    type: "source",
    position: { x: 50, y: 100 },
    data: { value: "" },
  },
  {
    id: "result1",
    type: "result",
    position: { x: 400, y: 100 },
    data: { value: "" },
  },
];
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const addNode = useCallback((nodeType: string) => {
    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { value: "" },
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

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "white",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
            border: "1px solid #ccc",
            borderRadius: "3px",
            cursor: "pointer",
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Add node...
          </option>
          <option value="source">Source</option>
          <option value="capslock">Capslock</option>
          <option value="result">Result</option>
        </select>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap nodeStrokeWidth={3} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
