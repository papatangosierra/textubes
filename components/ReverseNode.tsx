import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

export default function ReverseNode({ id, data, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  // Extract input value
  const inputValue = sourceIds.length > 0
    ? ((nodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Reverse the string
    const outputValue = inputValue.split('').reverse().join('');

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Reverse" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Reverses character order
      </div>
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
