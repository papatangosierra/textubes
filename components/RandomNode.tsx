import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

type RandomNodeData = NodeData & {
  length?: number;
};

export default function RandomNode({ id, data, selected, type }: NodeProps<Node<RandomNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const length = data.length ?? 10;
  const lastLengthRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip on initial mount (value already generated in App.tsx)
    if (lastLengthRef.current === null) {
      lastLengthRef.current = length;
      return;
    }

    // Only generate if length has changed
    if (lastLengthRef.current === length) {
      return;
    }
    lastLengthRef.current = length;

    // Generate random string of specified length
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateNodeData(id, { value: randomString });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  return (
    <NodeContainer id={id} selected={selected} title="Random" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <div className="node-description">
        Generates random alphanumeric text
      </div>
      <div>
        <label style={{ fontSize: '11px', color: data.isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Length:
        </label>
        <input
          className="nodrag"
          type="number"
          value={length}
          onChange={(e) => updateNodeData(id, { length: parseInt(e.target.value) || 0 })}
          min="0"
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '.5rem',
            background: data.isDarkMode ? '#3a3a3a' : 'white',
            color: data.isDarkMode ? '#e0e0e0' : '#000'
          }}
        />
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
