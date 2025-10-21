import { useState } from 'react';
import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

const HANDLE_START = 4.45;

export default function ResultNode({ data, id, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [wrap, setWrap] = useState(true);
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);

  // Get input from the first connected node
  const firstNode = sourceIds.length > 0 ? nodesData[0] : null;
  const inputData = firstNode?.data as NodeData | undefined;
  const displayValue = inputData?.value ?? '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayValue);
  };

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="Result"
        style={{ minWidth: '300px' }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          style={{ top: `${HANDLE_START}rem` }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
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
    </div>
  );
}
