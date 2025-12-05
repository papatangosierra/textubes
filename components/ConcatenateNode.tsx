import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type ConcatenateNodeData = NodeData & {
  separator?: string;
};

export default function ConcatenateNode({ id, data, selected, type }: NodeProps<Node<ConcatenateNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const helpInfo = getNodeHelp(type);
  const allConnections = useNodeConnections({ handleType: 'target' });

  const separator = data.separator ?? '';

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

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

  // in rem!!
  const HANDLE_START = 3.5;
  const HANDLE_SPACING = 2;

  // Calculate minimum height based on number of handles (in rem)
  const minHeight = HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 1;

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
        title="Join"
        style={{ minWidth: '180px', minHeight: `${minHeight}rem` }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <div className="node-description">
          Joins multiple inputs together
        </div>
        <div className="node-info">
          Inputs: {connectedHandleCount}
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

        {/* Render dynamic handles */}
        {Array.from({ length: totalHandles }).map((_, i) => {
          const handleId = `input-${i}`;
          const isConnected = handleConnections.has(handleId);

          return (
            <HelpLabel
              key={handleId}
              type="target"
              position={Position.Left}
              id={handleId}
              style={{
                top: `${HANDLE_START + i * HANDLE_SPACING}rem`,
                background: isConnected ? '#555' : '#999',
              }}
              helpActive={data.helpActive}
              helpLabel={i === 0 ? "Inputs" : ""}
              helpDescription={i === 0 ? helpInfo?.inputs?.[0]?.description : ""}
            />
          );
        })}

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
