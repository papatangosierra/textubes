import { Handle, Position } from '@xyflow/react';

export default function ResultNode({ data }) {
  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '200px'
    }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Result</div>
      <div style={{
        width: '100%',
        minHeight: '100px',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '5px',
        border: '1px solid #eee',
        borderRadius: '3px',
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {data.text || <span style={{ color: '#999' }}>No input connected</span>}
      </div>
    </div>
  );
}
