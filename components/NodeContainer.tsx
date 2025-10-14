import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';

interface NodeContainerProps {
  id: string;
  selected?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function NodeContainer({ id, selected, children, style }: NodeContainerProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div style={{
      padding: '10px',
      border: selected ? '2px solid #555' : '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '150px',
      position: 'relative',
      ...style
    }}>
      <button
        className="nodrag"
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '16px',
          height: '16px',
          padding: 0,
          border: '1px solid #ccc',
          borderRadius: '3px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '10px',
          lineHeight: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
        title="Delete node"
      >
        ×
      </button>
      {children}
    </div>
  );
}
