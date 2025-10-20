import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

export default function SourceNode({ data, id, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { value: e.target.value });
  };

  return (
    <NodeContainer id={id} selected={selected} title="Text" style={{ minWidth: '200px' }} isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <div className="node-description">
        Enter text manually
      </div>
      <textarea
        className="nodrag node-textarea"
        value={data.value || ''}
        onChange={handleChange}
        placeholder="Enter text here..."
      />
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
