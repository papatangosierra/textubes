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
    <NodeContainer id={id} selected={selected} title="Result" style={{ minWidth: '200px' }} isDarkMode={data.isDarkMode}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Display and copy final output
      </div>
      <div style={{ marginBottom: '5px', display: 'flex', gap: '5px' }}>
        <button
          className="nodrag"
          onClick={() => setWrap(!wrap)}
          style={{
            padding: '2px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: data.isDarkMode ? '#3a3a3a' : 'white',
            color: data.isDarkMode ? '#e0e0e0' : '#000'
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
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: data.isDarkMode ? '#3a3a3a' : 'white',
            color: data.isDarkMode ? '#e0e0e0' : '#000',
            opacity: displayValue ? 1 : 0.5
          }}
        >
          Copy to Clipboard
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
          border: data.isDarkMode ? '1px solid #555' : '1px solid #eee',
          borderRadius: '3px',
          background: data.isDarkMode ? '#333' : '#f9f9f9',
          whiteSpace: wrap ? 'pre-wrap' : 'pre',
          overflow: 'auto',
          color: displayValue ? (data.isDarkMode ? '#e0e0e0' : 'inherit') : '#999'
        }}
      />
    </NodeContainer>
  );
}
