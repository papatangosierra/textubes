import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';

interface NodeContainerProps {
  id: string;
  selected?: boolean;
  title: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function NodeContainer({ id, selected, title, children, style }: NodeContainerProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div style={{
      border: selected ? '2px solid #555' : '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '150px',
      ...style
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: '3px 3px 0 0',
        borderBottom: '1px solid #eee',
        background: '#f9f9f9'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{title}</div>
        <button
          className="nodrag"
          onClick={handleDelete}
          style={{
            width: '16px',
            height: '16px',
            padding: 0,
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            lineHeight: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            flexShrink: 0
          }}
          title="Delete node"
        >
          ×
        </button>
      </div>
      <div style={{ padding: '10px' }}>
        {children}
      </div>
    </div>
  );
}
