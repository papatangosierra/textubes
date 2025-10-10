import { Handle, Position } from '@xyflow/react';

export default function SourceNode({ data, id }) {
  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Source</div>
      <textarea
        value={data.text || ''}
        onChange={(e) => data.onChange?.(id, e.target.value)}
        placeholder="Enter text here..."
        style={{
          width: '100%',
          minHeight: '100px',
          fontFamily: 'monospace',
          fontSize: '12px',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '3px'
        }}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
