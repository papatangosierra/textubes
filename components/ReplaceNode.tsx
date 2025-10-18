import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

type ReplaceNodeData = NodeData & {
  searchText?: string;
  replaceText?: string;
};

export default function ReplaceNode({ id, data, selected }: NodeProps<Node<ReplaceNodeData>>) {
  const { updateNodeData } = useReactFlow();

  // Get connections for each input handle
  const textConnections = useNodeConnections({ handleType: 'target', handleId: 'text' });
  const searchConnections = useNodeConnections({ handleType: 'target', handleId: 'search' });
  const replaceConnections = useNodeConnections({ handleType: 'target', handleId: 'replace' });

  // Get node data for connected nodes
  const textSourceIds = textConnections.map((c) => c.source);
  const searchSourceIds = searchConnections.map((c) => c.source);
  const replaceSourceIds = replaceConnections.map((c) => c.source);

  const textNodesData = useNodesData(textSourceIds);
  const searchNodesData = useNodesData(searchSourceIds);
  const replaceNodesData = useNodesData(replaceSourceIds);

  // Get input values from connected nodes or fall back to text fields
  const connectedInputValue = textSourceIds.length > 0
    ? ((textNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  const connectedSearchText = searchSourceIds.length > 0
    ? ((searchNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  const connectedReplaceText = replaceSourceIds.length > 0
    ? ((replaceNodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  useEffect(() => {
    const inputValue = connectedInputValue;
    const searchText = connectedSearchText || (data.searchText ?? '');
    const replaceText = connectedReplaceText || (data.replaceText ?? '');

    // Compute the transformation: replace all occurrences
    const outputValue = searchText ? inputValue.replaceAll(searchText, replaceText) : inputValue;

    // Only update if the value has actually changed
    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [connectedInputValue, connectedSearchText, connectedReplaceText, data.searchText, data.replaceText, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Replace" style={{ minWidth: '200px' }} isDarkMode={data.isDarkMode}>
      <Handle type="target" position={Position.Left} id="text" style={{ top: '5.25rem' }} />
      <Handle type="target" position={Position.Left} id="search" style={{ top: '7.5rem' }} />
      <Handle type="target" position={Position.Left} id="replace" style={{ top: '10.5rem' }} />
      <Handle type="source" position={Position.Right} />
      <div className="node-description">
        Find and replace text
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: data.isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Text input
        </label>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: data.isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Search for:
        </label>
        <input
          className="nodrag"
          type="text"
          value={data.searchText ?? ''}
          onChange={(e) => updateNodeData(id, { searchText: e.target.value })}
          placeholder="text to find"
          disabled={searchSourceIds.length > 0}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: searchSourceIds.length > 0
              ? (data.isDarkMode ? '#2a2a2a' : '#f5f5f5')
              : (data.isDarkMode ? '#3a3a3a' : 'white'),
            color: data.isDarkMode ? '#e0e0e0' : '#000'
          }}
        />
      </div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: data.isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Replace with:
        </label>
        <input
          className="nodrag"
          type="text"
          value={data.replaceText ?? ''}
          onChange={(e) => updateNodeData(id, { replaceText: e.target.value })}
          placeholder="replacement text"
          disabled={replaceSourceIds.length > 0}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: replaceSourceIds.length > 0
              ? (data.isDarkMode ? '#2a2a2a' : '#f5f5f5')
              : (data.isDarkMode ? '#3a3a3a' : 'white'),
            color: data.isDarkMode ? '#e0e0e0' : '#000'
          }}
        />
      </div>
    </NodeContainer>
  );
}
