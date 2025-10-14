import { useState } from 'react';
import { Handle, Position, useNodesData, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

export default function ResultNode({ data, id, selected }: NodeProps<Node<NodeData>>) {
  const [wrap, setWrap] = useState(true);
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  // Get input from the first connected node
  const firstNode = sourceIds.length > 0 ? nodesData[0] : null;
  const inputData = firstNode?.data as NodeData | undefined;
  const displayValue = inputData?.value ?? '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayValue);
  };

  return (
    <NodeContainer id={id} selected={selected} title="Result" style={{ minWidth: '200px' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ marginBottom: '5px', display: 'flex', gap: '5px' }}>
        <button
          className="nodrag"
          onClick={() => setWrap(!wrap)}
          style={{
            padding: '2px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: 'white'
          }}
        >
          {wrap ? 'Raw' : 'Wrap'}
        </button>
        <button
          className="nodrag"
          onClick={copyToClipboard}
          disabled={!displayValue}
          style={{
            padding: '2px 8px',
            fontSize: '11px',
            cursor: displayValue ? 'pointer' : 'not-allowed',
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: 'white',
            opacity: displayValue ? 1 : 0.5
          }}
        >
          Copy
        </button>
      </div>
      <textarea
        readOnly
        value={displayValue || 'No input connected'}
        className="nodrag"
        style={{
          width: '100%',
          minHeight: '100px',
          fontFamily: 'monospace',
          fontSize: '12px',
          padding: '5px',
          border: '1px solid #eee',
          borderRadius: '3px',
          background: '#f9f9f9',
          whiteSpace: wrap ? 'pre-wrap' : 'pre',
          overflow: 'auto',
          color: displayValue ? 'inherit' : '#999'
        }}
      />
    </NodeContainer>
  );
}
