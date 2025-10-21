import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type ReplaceNodeData = NodeData & {
  searchText?: string;
  replaceText?: string;
};

export default function ReplaceNode({ id, data, selected, type }: NodeProps<Node<ReplaceNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const helpInfo = getNodeHelp(type);

  // Get connections for each input handle
  const textConnections = useNodeConnections({ handleType: 'target', handleId: 'text' });
  const searchConnections = useNodeConnections({ handleType: 'target', handleId: 'search' });
  const replaceConnections = useNodeConnections({ handleType: 'target', handleId: 'replace' });

  // Get node data for connected nodes
  const textSourceIds = textConnections.map((c) => c.source);
  const searchSourceIds = searchConnections.map((c) => c.source);
  const replaceSourceIds = replaceConnections.map((c) => c.source);

  const textNodesData = useNodesData(textSourceIds);
  const searchNodesData = useNodesData(searchSourceIds);
  const replaceNodesData = useNodesData(replaceSourceIds);

  // Get input values from connected nodes or fall back to text fields
  const connectedInputValue = textSourceIds.length > 0
    ? ((textNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  const connectedSearchText = searchSourceIds.length > 0
    ? ((searchNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  const connectedReplaceText = replaceSourceIds.length > 0
    ? ((replaceNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  useEffect(() => {
    const inputValue = connectedInputValue;
    const searchText = connectedSearchText || (data.searchText ?? '');
    const replaceText = connectedReplaceText || (data.replaceText ?? '');

    // Compute the transformation: replace all occurrences
    const outputValue = searchText ? inputValue.replaceAll(searchText, replaceText) : inputValue;

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [connectedInputValue, connectedSearchText, connectedReplaceText, data.searchText, data.replaceText, id, updateNodeData, data.value]);

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          {/* Description at the bottom */}
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="Replace"
        style={{ minWidth: '200px' }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          id="text"
          style={{ top: '4.45rem' }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
        <HelpLabel
          type="target"
          position={Position.Left}
          id="search"
          style={{ top: '6.85rem' }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[1]?.label}
          helpDescription={helpInfo?.inputs?.[1]?.description}
        />
        <HelpLabel
          type="target"
          position={Position.Left}
          id="replace"
          style={{ top: '9.75rem' }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[2]?.label}
          helpDescription={helpInfo?.inputs?.[2]?.description}
        />
        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />
        <div className="node-description">
          Find and replace text
        </div>
        <div className="node-field-with-spacing">
          <label className="node-label">
            Text input
          </label>
        </div>

        <div className="node-field-with-spacing">
          <label className="node-label">
            Search for:
          </label>
          <input
            className="nodrag node-input"
            type="text"
            value={data.searchText ?? ''}
            onChange={(e) => updateNodeData(id, { searchText: e.target.value })}
            placeholder="text to find"
            disabled={searchSourceIds.length > 0}
          />
        </div>

        <div className="node-field">
          <label className="node-label">
            Replace with:
          </label>
          <input
            className="nodrag node-input"
            type="text"
            value={data.replaceText ?? ''}
            onChange={(e) => updateNodeData(id, { replaceText: e.target.value })}
            placeholder="replacement text"
            disabled={replaceSourceIds.length > 0}
          />
        </div>
      </NodeContainer>
    </div>
  );
}
