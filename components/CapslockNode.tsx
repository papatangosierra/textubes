import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

export default function CapslockNode({ id, data, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  useEffect(() => {
    if (sourceIds.length === 0) {
      // No connections, set empty value only if not already empty
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Get input from the first connected node
    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Compute the transformation
    const outputValue = inputValue.toUpperCase();

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [nodesData, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="CAPSLOCK" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Converts text to uppercase
      </div>
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
