import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type RepeatNodeData = NodeData & {
  count?: number;
  separator?: string;
};

const HANDLE_START = 4.45;

export default function RepeatNode({ id, data, selected, type }: NodeProps<Node<RepeatNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);

  const count = data.count ?? 3;
  const separator = data.separator ?? '';

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

    // Repeat the string with separator
    const outputValue = Array(Math.max(0, count)).fill(inputValue).join(separator);

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, count, separator, sourceIds.length, id, updateNodeData, data.value]);

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
        title="Repeat"
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
          Repeats text multiple times
        </div>
        <div className="node-field">
          <label className="node-label">
            Count:
          </label>
          <input
            className="nodrag node-input"
            type="number"
            value={count}
            onChange={(e) => updateNodeData(id, { count: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>

        <div className="node-field">
          <label className="node-label">
            Separator:
          </label>
          <input
            className="nodrag node-input"
            type="text"
            value={separator}
            onChange={(e) => updateNodeData(id, { separator: e.target.value })}
            placeholder="(none)"
          />
        </div>

        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />
      </NodeContainer>
    </div>
  );
}
