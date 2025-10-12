import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';

type TrimPadNodeData = NodeData & {
  mode?: 'trim' | 'padStart' | 'padEnd';
  padLength?: number;
  padChar?: string;
};

export default function TrimPadNode({ id, data }: NodeProps<Node<TrimPadNodeData>>) {
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
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '180px'
    }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Trim/Pad</div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Mode:
        </label>
        <select
          className="nodrag"
          value={mode}
          onChange={(e) => updateNodeData(id, { mode: e.target.value as any })}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px'
          }}
        >
          <option value="trim">Trim whitespace</option>
          <option value="padStart">Pad start</option>
          <option value="padEnd">Pad end</option>
        </select>
      </div>

      {mode !== 'trim' && (
        <>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
              Length:
            </label>
            <input
              className="nodrag"
              type="number"
              value={padLength}
              onChange={(e) => updateNodeData(id, { padLength: parseInt(e.target.value) || 0 })}
              min="0"
              style={{
                width: '100%',
                padding: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: '1px solid #ccc',
                borderRadius: '3px'
              }}
            />
          </div>

          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
              Pad character:
            </label>
            <input
              className="nodrag"
              type="text"
              value={padChar}
              onChange={(e) => updateNodeData(id, { padChar: e.target.value })}
              placeholder=" "
              maxLength={1}
              style={{
                width: '100%',
                padding: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: '1px solid #ccc',
                borderRadius: '3px'
              }}
            />
          </div>
        </>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
