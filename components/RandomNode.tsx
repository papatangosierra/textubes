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
      <div className="node-field">
        <label className="node-label">
          Length:
        </label>
        <input
          className="nodrag node-input"
          type="number"
          value={length}
          onChange={(e) => updateNodeData(id, { length: parseInt(e.target.value) || 0 })}
          min="0"
        />
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
