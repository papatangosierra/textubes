import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type ZalgoNodeData = NodeData & {
  intensity?: number;
};

// Combining diacritical marks for zalgo text
const ZALGO_UP = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357',
  '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c',
  '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313',
  '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369',
  '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'
];

const ZALGO_DOWN = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324',
  '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330',
  '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348',
  '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u0323'
];

const ZALGO_MID = [
  '\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334',
  '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338',
  '\u0337', '\u0361', '\u0489'
];

function zalgoify(text: string, intensity: number): string {
  let result = '';

  for (const char of text) {
    result += char;

    // Add random combining marks based on intensity
    const numMarks = Math.floor(Math.random() * intensity) + 1;

    for (let i = 0; i < numMarks; i++) {
      // Randomly choose between up, down, or mid marks
      const rand = Math.random();
      let marks: string[];

      if (rand < 0.4) {
        marks = ZALGO_UP;
      } else if (rand < 0.8) {
        marks = ZALGO_DOWN;
      } else {
        marks = ZALGO_MID;
      }

      const mark = marks[Math.floor(Math.random() * marks.length)];
      result += mark;
    }
  }

  return result;
}

export default function ZalgoNode({ id, data, selected, type }: NodeProps<Node<ZalgoNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const intensity = data.intensity ?? 3;

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

    // Apply zalgo transformation (non-deterministic, so always update when inputs change)
    const outputValue = zalgoify(inputValue, intensity);
    updateNodeData(id, { value: outputValue });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, sourceIds.length, intensity]);

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="Zalgo"
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
          H̷̢̰̦̓̓e̶̡̱̔ ̴͕̐̌c̶͙̿o̶̺̓m̶̰̈́ȅ̴̠s̶̱̈́
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: data.isDarkMode ? '#e0e0e0' : '#000' }}>Intensity:</label>
          <input
            type="range"
            className="nodrag"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => updateNodeData(id, { intensity: parseInt(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', minWidth: '20px', color: data.isDarkMode ? '#e0e0e0' : '#000' }}>{intensity}</span>
        </div>
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
