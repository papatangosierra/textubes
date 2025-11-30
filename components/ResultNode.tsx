import { useState, useMemo } from 'react';
import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections, useNodes, useEdges } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';
import { findUpstreamNodes, isGeneratorNode } from '../utils/graphUtils';

const HANDLE_START = 4.45;

export default function ResultNode({ data, id, selected, type }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [wrap, setWrap] = useState(true);
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);

  // Get all nodes and edges for graph traversal
  const nodes = useNodes();
  const edges = useEdges();

  // Get input from the first connected node
  const firstNode = sourceIds.length > 0 ? nodesData[0] : null;
  const inputData = firstNode?.data as NodeData | undefined;
  const displayValue = inputData?.value ?? '';

  // Check if there are any generator nodes upstream
  const hasUpstreamGenerators = useMemo(() => {
    const upstreamNodeIds = findUpstreamNodes(id, edges);
    return upstreamNodeIds.some(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      return isGeneratorNode(node?.type);
    });
  }, [nodes, edges, id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayValue);
  };

  const regenerateUpstream = () => {
    const timestamp = Date.now();
    const upstreamNodeIds = findUpstreamNodes(id, edges);

    // Update all generator nodes with regenerate timestamp
    upstreamNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (isGeneratorNode(node?.type)) {
        updateNodeData(nodeId, { regenerateTimestamp: timestamp });
      }
    });
  };

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
        title="Result"
        style={{ minWidth: '300px' }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          style={{ top: `${HANDLE_START}rem` }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
        <div className="node-description">
          Display and copy final output
        </div>
        <div className="node-button-group">
          <label className="nodrag node-checkbox-label">
            <input
              type="checkbox"
              checked={wrap}
              onChange={(e) => setWrap(e.target.checked)}
              className="nodrag"
            />
            Soft Wrap
          </label>
          {hasUpstreamGenerators && (
            <button
              className="nodrag node-button"
              onClick={regenerateUpstream}
            >
              Regenerate
            </button>
          )}
          <button
            className="nodrag node-button"
            onClick={copyToClipboard}
            disabled={!displayValue}
          >
            Copy to Clipboard
          </button>
        </div>
        <textarea
          readOnly
          value={displayValue || 'No input connected'}
          className={`nodrag result-textarea ${wrap ? 'wrap' : 'no-wrap'} ${!displayValue ? 'no-value' : ''}`}
        />
      </NodeContainer>
    </div>
  );
}
