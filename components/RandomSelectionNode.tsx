import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

type RandomSelectionNodeData = NodeData & {
  mode?: 'character' | 'word' | 'line';
};

export default function RandomSelectionNode({ id, data, selected }: NodeProps<Node<RandomSelectionNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const mode = data.mode ?? 'word';
  const lastInputRef = useRef<string>('');
  const lastModeRef = useRef<string>(mode);

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Only regenerate if input or mode changed
    if (lastInputRef.current === inputValue && lastModeRef.current === mode) {
      return;
    }
    lastInputRef.current = inputValue;
    lastModeRef.current = mode;

    if (!inputValue) {
      updateNodeData(id, { value: '' });
      return;
    }

    let outputValue = '';

    if (mode === 'character') {
      const randomIndex = Math.floor(Math.random() * inputValue.length);
      outputValue = inputValue[randomIndex];
    } else if (mode === 'word') {
      const words = inputValue.split(/\s+/).filter(w => w.length > 0);
      if (words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        outputValue = words[randomIndex];
      }
    } else if (mode === 'line') {
      const lines = inputValue.split('\n').filter(l => l.length > 0);
      if (lines.length > 0) {
        const randomIndex = Math.floor(Math.random() * lines.length);
        outputValue = lines[randomIndex];
      }
    }

    updateNodeData(id, { value: outputValue });
  }, [nodesData, sourceIds.length, mode, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Random Selection">
      <Handle type="target" position={Position.Left} />
      <div>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Select:
        </label>
        <select
          className="nodrag"
          value={mode}
          onChange={(e) => updateNodeData(id, { mode: e.target.value as 'character' | 'word' | 'line' })}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px'
          }}
        >
          <option value="character">Random Character</option>
          <option value="word">Random Word</option>
          <option value="line">Random Line</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
