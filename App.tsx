import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SourceNode from "./SourceNode";
import ResultNode from "./ResultNode";

const nodeTypes = {
  source: SourceNode,
  result: ResultNode,
};

const initialNodes = [
  {
    id: "source1",
    type: "source",
    position: { x: 50, y: 100 },
    data: { text: "" },
  },
  {
    id: "result1",
    type: "result",
    position: { x: 400, y: 100 },
    data: { text: "" },
  },
];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const handleTextChange = useCallback((nodeId, newText) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, text: newText } }
          : node
      )
    );
  }, []);

  // Update result nodes when edges or source text changes
  useEffect(() => {
    setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => {
        if (node.type === "result") {
          // Find edges that target this result node
          const incomingEdge = edges.find((edge) => edge.target === node.id);
          if (incomingEdge) {
            // Find the source node
            const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
            if (sourceNode) {
              return {
                ...node,
                data: { ...node.data, text: sourceNode.data.text },
              };
            }
          } else {
            // No incoming edge, clear the text
            return { ...node, data: { ...node.data, text: "" } };
          }
        }
        return node;
      });
      return updatedNodes;
    });
  }, [edges]);

  // Pass onChange handler to source nodes
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: node.type === "source" ? handleTextChange : undefined,
    },
  }));

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodesWithHandlers}
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
