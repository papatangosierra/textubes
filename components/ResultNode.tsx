import { Handle, Position, useNodesData, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import type { NodeData } from './App';

export default function ResultNode({ data }: NodeProps<Node<NodeData>>) {
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  // Get input from the first connected node
  const firstNode = sourceIds.length > 0 ? nodesData[0] : null;
  const inputData = firstNode?.data as NodeData | undefined;
  const displayValue = inputData?.value ?? '';

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '200px'
    }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Result</div>
      <div style={{
        width: '100%',
        minHeight: '100px',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '5px',
        border: '1px solid #eee',
        borderRadius: '3px',
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {displayValue || <span style={{ color: '#999' }}>No input connected</span>}
      </div>
    </div>
  );
}
