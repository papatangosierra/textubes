import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

type TrimPadNodeData = NodeData & {
  mode?: 'trim' | 'padStart' | 'padEnd';
  padLength?: number;
  padChar?: string;
};

export default function TrimPadNode({ id, data, selected, type }: NodeProps<Node<TrimPadNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  const mode = data.mode ?? 'trim';
  const padLength = data.padLength ?? 10;
  const padChar = data.padChar ?? ' ';

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

    let outputValue = inputValue;

    if (mode === 'trim') {
      outputValue = inputValue.trim();
    } else if (mode === 'padStart') {
      outputValue = inputValue.padStart(padLength, padChar.charAt(0) || ' ');
    } else if (mode === 'padEnd') {
      outputValue = inputValue.padEnd(padLength, padChar.charAt(0) || ' ');
    }

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, mode, padLength, padChar, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Trim/Pad" style={{ minWidth: '180px' }} isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Trim whitespace or add padding
      </div>
      <div className="node-field">
        <label className="node-label">
          Mode:
        </label>
        <select
          className="nodrag node-input"
          value={mode}
          onChange={(e) => updateNodeData(id, { mode: e.target.value as any })}
        >
          <option value="trim">Trim whitespace</option>
          <option value="padStart">Pad start</option>
          <option value="padEnd">Pad end</option>
        </select>
      </div>

      {mode !== 'trim' && (
        <>
          <div className="node-field">
            <label className="node-label">
              Length:
            </label>
            <input
              className="nodrag node-input"
              type="number"
              value={padLength}
              onChange={(e) => updateNodeData(id, { padLength: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="node-field">
            <label className="node-label">
              Pad character:
            </label>
            <input
              className="nodrag node-input"
              type="text"
              value={padChar}
              onChange={(e) => updateNodeData(id, { padChar: e.target.value })}
              placeholder=" "
              maxLength={1}
            />
          </div>
        </>
      )}

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
