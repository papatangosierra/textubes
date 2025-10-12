import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';

type ConcatenateNodeData = NodeData & {
  separator?: string;
};

export default function ConcatenateNode({ id, data }: NodeProps<Node<ConcatenateNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const allConnections = useNodeConnections({ handleType: 'target' });

  const separator = data.separator ?? '';

  // Group connections by handle ID and get their values
  const handleConnections = new Map<string, string>();

  allConnections.forEach(conn => {
    const handleId = conn.targetHandle || 'input-0';
    handleConnections.set(handleId, conn.source);
  });

  // Determine how many handles we need (at least 2, plus one extra if all are filled)
  const connectedHandleCount = handleConnections.size;
  const totalHandles = Math.max(2, connectedHandleCount + 1);

  // Get all source IDs in handle order
  const sourceIdsByHandle: string[] = [];
  for (let i = 0; i < totalHandles; i++) {
    const handleId = `input-${i}`;
    const sourceId = handleConnections.get(handleId);
    if (sourceId) {
      sourceIdsByHandle.push(sourceId);
    }
  }

  const nodesData = useNodesData(sourceIdsByHandle);

  // Extract all input values in handle order
  const inputValues = nodesData.map(node => ((node?.data as NodeData | undefined)?.value ?? ''));
  const inputsString = inputValues.join('|||'); // Serialize for dependency tracking

  useEffect(() => {
    if (sourceIdsByHandle.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Concatenate all inputs with separator
    const outputValue = inputValues.join(separator);

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputsString, separator, sourceIdsByHandle.length, id, updateNodeData, data.value]);

  const HANDLE_SPACING = 25;
  const HANDLE_START = 55;

  // Calculate minimum height based on number of handles
  const minHeight = HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 15;

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '180px',
      minHeight: `${minHeight}px`,
      position: 'relative'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Concatenate</div>

      <div style={{ marginBottom: '5px', fontSize: '11px', color: '#666' }}>
        Inputs: {connectedHandleCount}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Separator:
        </label>
        <input
          className="nodrag"
          type="text"
          value={separator}
          onChange={(e) => updateNodeData(id, { separator: e.target.value })}
          placeholder="(none)"
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '3px'
          }}
        />
      </div>

      {/* Render dynamic handles */}
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

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
