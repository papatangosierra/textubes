import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';
import { getSourceValue } from '../utils/nodeUtils';

type CaseMode = 'upper' | 'lower' | 'sentence' | 'capitalized' | 'alternating';

type CaseNodeData = NodeData & {
  mode?: CaseMode;
};

function transformCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'sentence':
      // Capitalize only the first character
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'capitalized':
      // Capitalize the first letter of each word
      return text.replace(/\b\w/g, char => char.toUpperCase());
    case 'alternating':
      return text.split('').map((char, i) =>
        i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      ).join('');
    default:
      return text;
  }
}

export default function CapslockNode({ id, data, selected, type }: NodeProps<Node<CaseNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const mode: CaseMode = data.mode ?? 'upper';

  useEffect(() => {
    if (sourceIds.length === 0) {
      // No connections, set empty value only if not already empty
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Get input from the first connected node (handles multi-output nodes like Split)
    const firstConnection = connections[0];
    const firstNode = nodesData[0];
    const inputValue = getSourceValue(firstNode, firstConnection);

    // Compute the transformation
    const outputValue = transformCase(inputValue, mode);

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [nodesData, sourceIds.length, id, updateNodeData, data.value, mode]);

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          {/* Description at the bottom */}
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="Change Case"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
        <div className="node-description">
          Transform text case
        </div>
        <select
          className="nodrag node-select"
          value={mode}
          onChange={(e) => updateNodeData(id, { mode: e.target.value as CaseMode })}
        >
          <option value="upper">UPPERCASE</option>
          <option value="lower">lowercase</option>
          <option value="sentence">Sentence case</option>
          <option value="capitalized">Title Case</option>
          <option value="alternating">aLtErNaTiNg</option>
        </select>
        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />
      </NodeContainer>
    </div>
  );
}
