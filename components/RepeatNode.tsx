import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

type RepeatNodeData = NodeData & {
  count?: number;
};

export default function RepeatNode({ id, data, selected, type }: NodeProps<Node<RepeatNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  const count = data.count ?? 3;

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

    // Repeat the string
    const outputValue = inputValue.repeat(Math.max(0, count));

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, count, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Repeat" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Repeats text multiple times
      </div>
      <div className="node-field">
        <label className="node-label">
          Count:
        </label>
        <input
          className="nodrag node-input"
          type="number"
          value={count}
          onChange={(e) => updateNodeData(id, { count: parseInt(e.target.value) || 0 })}
          min="0"
        />
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
