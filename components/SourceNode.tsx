import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

export default function SourceNode({ data, id, selected }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { value: e.target.value });
  };

  return (
    <NodeContainer id={id} selected={selected} title="Text" style={{ minWidth: '200px' }} isDarkMode={data.isDarkMode}>
      <div className="node-description">
        Enter text manually
      </div>
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
          border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
          borderRadius: '3px',
          background: data.isDarkMode ? '#3a3a3a' : 'white',
          color: data.isDarkMode ? '#e0e0e0' : '#000'
        }}
      />
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
