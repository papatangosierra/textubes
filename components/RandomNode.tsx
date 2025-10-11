import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';

type RandomNodeData = NodeData & {
  length?: number;
};

export default function RandomNode({ id, data }: NodeProps<Node<RandomNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const length = data.length ?? 10;
  const lastLengthRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('[RandomNode] useEffect triggered', { id, length, lastLength: lastLengthRef.current });

    // Skip on initial mount (value already generated in App.tsx)
    if (lastLengthRef.current === null) {
      console.log('[RandomNode] Initial mount, setting lastLength');
      lastLengthRef.current = length;
      return;
    }

    // Only generate if length has changed
    if (lastLengthRef.current === length) {
      console.log('[RandomNode] Length unchanged, skipping');
      return;
    }
    lastLengthRef.current = length;

    // Generate random string of specified length
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('[RandomNode] Generated new random string', { id, length, randomString });
    updateNodeData(id, { value: randomString });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '150px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Random</div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Length:
        </label>
        <input
          type="number"
          value={length}
          onChange={(e) => updateNodeData(id, { length: parseInt(e.target.value) || 0 })}
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

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
