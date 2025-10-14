import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

export default function SourceNode({ data, id, selected }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { value: e.target.value });
  };

  return (
    <NodeContainer id={id} selected={selected} style={{ minWidth: '200px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Source</div>
      <textarea
        className="nodrag"
        value={data.value || ''}
        onChange={handleChange}
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
    </NodeContainer>
  );
}
