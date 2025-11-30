import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type AlignmentMode = 'left' | 'full' | 'right' | 'center';

type WrapTextNodeData = NodeData & {
  length?: number;
  alignment?: AlignmentMode;
};

function applyAlignment(line: string, maxLength: number, alignment: AlignmentMode, isLastLine: boolean): string {
  const trimmedLine = line.trimEnd();

  if (alignment === 'left' || trimmedLine.length >= maxLength) {
    return trimmedLine;
  }

  if (alignment === 'full' && !isLastLine) {
    // Justify by distributing spaces between words
    const words = trimmedLine.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= 1) return trimmedLine;

    const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
    const totalSpaces = maxLength - totalWordLength;
    const gaps = words.length - 1;
    const spacesPerGap = Math.floor(totalSpaces / gaps);
    const extraSpaces = totalSpaces % gaps;

    let result = '';
    for (let i = 0; i < words.length; i++) {
      result += words[i];
      if (i < words.length - 1) {
        const spaces = spacesPerGap + (i < extraSpaces ? 1 : 0);
        result += ' '.repeat(spaces);
      }
    }
    return result;
  }

  if (alignment === 'right') {
    const padding = maxLength - trimmedLine.length;
    return ' '.repeat(padding) + trimmedLine;
  }

  if (alignment === 'center') {
    const padding = maxLength - trimmedLine.length;
    const leftPadding = Math.floor(padding / 2);
    return ' '.repeat(leftPadding) + trimmedLine;
  }

  return trimmedLine;
}

function wrapText(text: string, maxLength: number, alignment: AlignmentMode): string {
  if (maxLength <= 0) return text;

  // Split by existing newlines to preserve paragraphs
  const paragraphs = text.split('\n');

  return paragraphs.map(paragraph => {
    if (paragraph.length <= maxLength) {
      return applyAlignment(paragraph, maxLength, alignment, true);
    }

    const words = paragraph.split(/(\s+)/); // Keep whitespace in the split
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + word;

      if (testLine.length <= maxLength) {
        currentLine = testLine;
      } else {
        // Current line is full, push it and start a new line
        if (currentLine.length > 0) {
          lines.push(currentLine.trimEnd());
          currentLine = word.trimStart();
        } else {
          // Single word longer than maxLength, just push it
          lines.push(word);
          currentLine = '';
        }
      }
    }

    // Push the last line if there's anything left
    if (currentLine.length > 0) {
      lines.push(currentLine.trimEnd());
    }

    // Apply alignment to all lines (last line is treated specially for full justification)
    const alignedLines = lines.map((line, index) =>
      applyAlignment(line, maxLength, alignment, index === lines.length - 1)
    );

    return alignedLines.join('\n');
  }).join('\n');
}

export default function WrapTextNode({ id, data, selected, type }: NodeProps<Node<WrapTextNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const length = data.length ?? 80;
  const alignment: AlignmentMode = data.alignment ?? 'left';

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
    const outputValue = wrapText(inputValue, length, alignment);

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [nodesData, sourceIds.length, id, updateNodeData, data.value, length, alignment]);

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
        title="Wrap Text"
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
          Wrap and align text
        </div>
        <label className="nodrag node-label">
          Length:
          <input
            type="number"
            className="nodrag node-input"
            value={length}
            onChange={(e) => updateNodeData(id, { length: parseInt(e.target.value) || 80 })}
            min={1}
          />
        </label>
        <label className="nodrag node-label">
          Alignment:<br/>
          <select
            className="nodrag node-select"
            value={alignment}
            onChange={(e) => updateNodeData(id, { alignment: e.target.value as AlignmentMode })}
          >
            <option value="left">Left</option>
            <option value="full">Full (Justified)</option>
            <option value="right">Right</option>
            <option value="center">Center</option>
          </select>
        </label>
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
