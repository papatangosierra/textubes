import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect, useState } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type SplitMode = 'line' | 'delimiter' | 'character';

type SplitNodeData = NodeData & {
  mode?: SplitMode;
  delimiter?: string;
  parts?: string[];
};

export default function SplitNode({ id, data, selected, type }: NodeProps<Node<SplitNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);

  const mode: SplitMode = data.mode ?? 'line';
  const delimiter = data.delimiter ?? ',';
  const parts = data.parts ?? [];

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  useEffect(() => {
    if (sourceIds.length === 0) {
      // No connections, clear parts
      if (parts.length > 0) {
        updateNodeData(id, { parts: [] });
      }
      return;
    }

    // Get input from the first connected node
    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Perform the split based on mode
    let splitParts: string[] = [];

    if (inputValue) {
      switch (mode) {
        case 'line':
          splitParts = inputValue.split('\n');
          break;
        case 'delimiter':
          splitParts = inputValue.split(delimiter);
          break;
        case 'character':
          splitParts = inputValue.split('');
          break;
      }
    }

    // Compare arrays - only update if changed
    const partsChanged = JSON.stringify(parts) !== JSON.stringify(splitParts);

    if (partsChanged) {
      // Store parts array AND individual outputs for each handle
      const outputData: Record<string, any> = { parts: splitParts };
      splitParts.forEach((part, i) => {
        outputData[`output-${i}`] = part;
      });
      updateNodeData(id, outputData);
    }
  }, [nodesData, sourceIds.length, mode, delimiter, id, updateNodeData, parts]);

  // Handle positioning (in rem)
  const HANDLE_START = 6.5;
  const HANDLE_SPACING = 2;

  // Calculate minimum height based on number of parts
  const totalHandles = Math.max(1, parts.length);
  const minHeight = HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 1;

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
        title="Split"
        style={{ minWidth: '180px', minHeight: `${minHeight}rem` }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />

        <div className="node-description">
          Split text into parts
        </div>

        <label className="nodrag node-label">
          Mode:
          <select
            className="nodrag node-select"
            value={mode}
            onChange={(e) => updateNodeData(id, { mode: e.target.value as SplitMode })}
          >
            <option value="line">By Line</option>
            <option value="delimiter">By Delimiter</option>
            <option value="character">By Character</option>
          </select>
        </label>

        {mode === 'delimiter' && (
          <label className="nodrag node-label">
            Delimiter:
            <input
              type="text"
              className="nodrag node-input"
              value={delimiter}
              onChange={(e) => updateNodeData(id, { delimiter: e.target.value })}
              placeholder=","
            />
          </label>
        )}

        <div className="node-info">
          Parts: {parts.length}
        </div>

        {/* Render dynamic output handles */}
        {parts.map((part, i) => {
          const handleId = `output-${i}`;

          return (
            <HelpLabel
              key={handleId}
              type="source"
              position={Position.Right}
              id={handleId}
              style={{
                top: `${HANDLE_START + i * HANDLE_SPACING}rem`,
              }}
              helpActive={data.helpActive}
              helpLabel={i === 0 ? "Outputs" : ""}
              helpDescription={i === 0 ? helpInfo?.outputs?.[0]?.description : ""}
            />
          );
        })}
      </NodeContainer>
    </div>
  );
}
