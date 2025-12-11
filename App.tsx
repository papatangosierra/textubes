import { useState, useCallback, useEffect, useRef } from "react";
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
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getNodeTypes, getInitialNodeData } from "./nodeRegistry";
import NodePicker from "./components/NodePicker";
import { loadPresetFile, validatePresetData } from "./utils/presetUtils";
import { HELP_TEXT } from "./components/HelpNode";

export type NodeData = {
  value?: string;
  isDarkMode?: boolean;
  helpActive?: boolean;
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
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);

    // If we have an empty array (cleared canvas), use defaults
    if (Array.isArray(parsed) && parsed.length === 0) {
      return defaultValue;
    }

    return parsed;
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
  const [showHelp, setShowHelp] = useState(false);

  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const addNode = useCallback((nodeType: string) => {
    // Calculate viewport center for new node placement
    let position = { x: 100, y: 100 }; // fallback default

    if (reactFlowInstanceRef.current) {
      const viewport = reactFlowInstanceRef.current.getViewport();
      const offsetJitter = Math.floor(Math.random() * 25) - 25;
      position = {
        x: ((-viewport.x + window.innerWidth / 2) / viewport.zoom) + offsetJitter,
        y: ((-viewport.y + window.innerHeight / 2) / viewport.zoom) + offsetJitter,
      };
    }

    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { ...getInitialNodeData(nodeType), isDarkMode },
    };
    setNodes((nodes) => [...nodes, newNode]);
  }, [isDarkMode]);

  const exportFlow = useCallback(() => {
    const flowData = {
      version: 1,
      nodes,
      edges,
      darkMode: isDarkMode,
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `textubes-flow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, isDarkMode]);

  const importFlow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const flowData = JSON.parse(content);

        // Basic validation
        if (!flowData.nodes || !Array.isArray(flowData.nodes)) {
          alert('Invalid flow file: missing nodes array');
          return;
        }
        if (!flowData.edges || !Array.isArray(flowData.edges)) {
          alert('Invalid flow file: missing edges array');
          return;
        }

        // Update dark mode state for all nodes
        const nodesWithDarkMode = flowData.nodes.map((node: Node<NodeData>) => ({
          ...node,
          data: { ...node.data, isDarkMode: flowData.darkMode ?? isDarkMode },
        }));

        setNodes(nodesWithDarkMode);
        setEdges(flowData.edges);
        if (typeof flowData.darkMode === 'boolean') {
          setIsDarkMode(flowData.darkMode);
        }
      } catch (error) {
        console.error('Error importing flow:', error);
        alert('Error loading flow file. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be loaded again
    event.target.value = '';
  }, [isDarkMode]);

  const loadPreset = useCallback((presetId: string) => {
    try {
      // Load preset data from compiled registry
      const presetData = loadPresetFile(presetId);

      // Validate structure
      if (!validatePresetData(presetData)) {
        alert('Invalid preset file format');
        return;
      }

      // Check if React Flow instance is available
      if (!reactFlowInstanceRef.current) {
        alert('React Flow instance not available');
        return;
      }

      // Get current viewport to calculate offset
      const viewport = reactFlowInstanceRef.current.getViewport();

      // Calculate the center of the current view
      const viewportCenterX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
      const viewportCenterY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;

      // Calculate the bounding box of the preset nodes
      let minX = Infinity, minY = Infinity;
      presetData.nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
      });

      // Calculate offset to center preset at viewport center
      const offsetX = viewportCenterX - minX;
      const offsetY = viewportCenterY - minY;

      // Apply offset to all nodes (PRESERVE ORIGINAL IDs)
      const offsetNodes = presetData.nodes.map(node => ({
        ...node,
        position: {
          x: node.position.x + offsetX ,
          y: node.position.y + offsetY
        },
        // Apply current dark mode state to all nodes
        data: {
          ...node.data,
          isDarkMode: isDarkMode
        }
      }));

      // Clear canvas and load preset
      setNodes(offsetNodes);
      setEdges(presetData.edges);

    } catch (error) {
      console.error('Error loading preset:', error);
      alert(`Failed to load preset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isDarkMode]);

  const clearCanvas = useCallback(() => {
    if (confirm('Clear all nodes and connections? This cannot be undone.')) {
      setNodes([]);
      setEdges([]);
    }
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
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <NodePicker
        onAddNode={addNode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onExport={exportFlow}
        onImport={importFlow}
        onLoadPreset={loadPreset}
      />
      <button
        className="help-button"
        onClick={() => setShowHelp(true)}
        title="Help"
      >
        ❓
      </button>
      <button
        className="clear-canvas-button"
        onClick={clearCanvas}
        title="Clear canvas"
      >
        🗑️
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => reactFlowInstanceRef.current = instance}
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
      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-modal-close" onClick={() => setShowHelp(false)}>×</button>
            <h2>Welcome to Textubes!</h2>
            <div className="help-modal-content">
              {HELP_TEXT.split('\n\n').slice(1).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
