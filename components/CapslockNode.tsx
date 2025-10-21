import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

export default function CapslockNode({ id, data, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);

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

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          {/* Input labels on the left */}
          {helpInfo.inputs && helpInfo.inputs.map((input, idx) => (
            <div key={`input-${idx}`} className="help-label help-label-input" style={{ top: `${40 + idx * 30}px` }}>
              <div className="help-label-title">{input.label}</div>
              <div className="help-label-desc">{input.description}</div>
            </div>
          ))}

          {/* Output labels on the right */}
          {helpInfo.outputs && helpInfo.outputs.map((output, idx) => (
            <div key={`output-${idx}`} className="help-label help-label-output" style={{ top: `${40 + idx * 30}px` }}>
              <div className="help-label-title">{output.label}</div>
              <div className="help-label-desc">{output.description}</div>
            </div>
          ))}

          {/* Description at the bottom */}
          <div className="help-description">
            {helpInfo.description}
          </div>
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="CAPSLOCK"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <Handle type="target" position={Position.Left} />
        <div className="node-description">
          Converts text to uppercase
        </div>
        <Handle type="source" position={Position.Right} />
      </NodeContainer>
    </div>
  );
}
