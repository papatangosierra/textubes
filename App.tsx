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
import SourceNode from "./components/SourceNode";
import ResultNode from "./components/ResultNode";
import CapslockNode from "./components/CapslockNode";
import ReplaceNode from "./components/ReplaceNode";
import RandomNode from "./components/RandomNode";

export type NodeData = {
  value: string;
};

const nodeTypes = {
  source: SourceNode,
  result: ResultNode,
  capslock: CapslockNode,
  replace: ReplaceNode,
  random: RandomNode,
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
    // Pre-generate random value for random nodes to avoid update on mount
    let initialData: any = { value: "" };
    if (nodeType === "random") {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      const length = 10;
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      initialData = { value: randomString, length };
    }

    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: initialData,
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
          <option value="random">Random</option>
          <option value="capslock">Capslock</option>
          <option value="replace">Replace</option>
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
