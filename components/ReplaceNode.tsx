import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';

type ReplaceNodeData = NodeData & {
  searchText?: string;
  replaceText?: string;
};

export default function ReplaceNode({ id, data }: NodeProps<Node<ReplaceNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  const searchText = data.searchText ?? '';
  const replaceText = data.replaceText ?? '';

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Get input from the first connected node
    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Compute the transformation: replace all occurrences
    const outputValue = searchText ? inputValue.replaceAll(searchText, replaceText) : inputValue;

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [nodesData, sourceIds.length, id, updateNodeData, data.value, searchText, replaceText]);

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '200px'
    }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Replace</div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Search for:
        </label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => updateNodeData(id, { searchText: e.target.value })}
          placeholder="text to find"
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

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Replace with:
        </label>
        <input
          type="text"
          value={replaceText}
          onChange={(e) => updateNodeData(id, { replaceText: e.target.value })}
          placeholder="replacement text"
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

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
