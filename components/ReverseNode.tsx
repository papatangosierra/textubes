import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';

export default function ReverseNode({ id, data }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  // Extract input value
  const inputValue = sourceIds.length > 0
    ? ((nodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Reverse the string
    const outputValue = inputValue.split('').reverse().join('');

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '150px'
    }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Reverse</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
