import { useState } from 'react';
import { Handle, Position, useNodesData, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

export default function ResultNode({ data, id, selected, type }: NodeProps<Node<NodeData>>) {
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
    <NodeContainer id={id} selected={selected} title="Result" style={{ minWidth: '300px' }} isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Display and copy final output
      </div>
      <div className="node-button-group">
        <label className="nodrag node-checkbox-label">
          <input
            type="checkbox"
            checked={wrap}
            onChange={(e) => setWrap(e.target.checked)}
            className="nodrag"
          />
          Soft Wrap
        </label>
        <button
          className="nodrag node-button"
          onClick={copyToClipboard}
          disabled={!displayValue}
        >
          Copy to Clipboard
        </button>
      </div>
      <textarea
        readOnly
        value={displayValue || 'No input connected'}
        className={`nodrag result-textarea ${wrap ? 'wrap' : 'no-wrap'} ${!displayValue ? 'no-value' : ''}`}
      />
    </NodeContainer>
  );
}
