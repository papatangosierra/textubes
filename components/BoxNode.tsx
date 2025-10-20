import React, { useEffect, useRef } from "react";
import { Handle, Position, useNodeConnections, useNodesData, useReactFlow, type NodeProps, type Node } from "@xyflow/react";
import type { NodeData } from "../App";
import NodeContainer from "./NodeContainer";
import { getNodeCategory } from "../nodeRegistry";

const BOX_STYLES = {
  simple: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
  },
  rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
  },
  bold: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃',
  },
};

type BoxStyle = keyof typeof BOX_STYLES;

type BoxNodeData = NodeData & {
  style?: BoxStyle;
};

function createBox(text: string, style: BoxStyle): string {
  if (!text) return '';

  const lines = text.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  const box = BOX_STYLES[style];
  const result: string[] = [];

  // Top border
  result.push(box.topLeft + box.horizontal.repeat(maxLength) + box.topRight);

  // Content lines
  lines.forEach(line => {
    const padding = ' '.repeat(maxLength - line.length);
    result.push(box.vertical + line + padding + box.vertical);
  });

  // Bottom border
  result.push(box.bottomLeft + box.horizontal.repeat(maxLength) + box.bottomRight);

  return result.join('\n');
}

export default function BoxNode({ id, data, selected, type }: NodeProps<Node<BoxNodeData>>) {
  const { updateNodeData } = useReactFlow();

  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map(conn => conn.source);
  const nodesData = useNodesData(sourceIds);

  const currentStyle = data.style || 'simple';

  // Track the last input and style to know when to regenerate
  const lastInputRef = useRef<string>('');
  const lastStyleRef = useRef<BoxStyle>(currentStyle);

  useEffect(() => {
    if (sourceIds.length === 0) {
      // No connections, set empty value only if not already empty
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
        lastInputRef.current = '';
      }
      return;
    }

    // Get input from the first connected node
    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Only regenerate if input or style actually changed
    if (inputValue === lastInputRef.current && currentStyle === lastStyleRef.current) {
      return;
    }

    lastInputRef.current = inputValue;
    lastStyleRef.current = currentStyle;

    // Compute the transformation
    const outputValue = createBox(inputValue, currentStyle);
    updateNodeData(id, { value: outputValue, style: currentStyle });
  }, [nodesData, sourceIds.length, currentStyle, id, updateNodeData]);

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value as BoxStyle;

    // Get current input value
    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    lastStyleRef.current = newStyle;

    const outputValue = createBox(inputValue, newStyle);
    updateNodeData(id, { value: outputValue, style: newStyle });
  };

  return (
    <NodeContainer id={id} selected={selected} title="Box" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />

      <div className="node-description">
        Outputs text enclosed in box-drawing characters
      </div>
      <div className="node-field-with-spacing">
        <select
          className="nodrag node-input"
          value={currentStyle}
          onChange={handleStyleChange}
        >
          <option value="simple">Simple (┌┐)</option>
          <option value="double">Double (╔╗)</option>
          <option value="rounded">Rounded (╭╮)</option>
          <option value="bold">Bold (┏┓)</option>
        </select>
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
