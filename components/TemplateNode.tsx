import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

type TemplateNodeData = NodeData & {
  template?: string;
};

export default function TemplateNode({ id, data, selected, type }: NodeProps<Node<TemplateNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const allConnections = useNodeConnections({ handleType: 'target' });

  // Get the template input connection (special handle 'template')
  const templateConnection = useNodeConnections({ handleType: 'target', handleId: 'template' });
  const templateSourceId = templateConnection.length > 0 ? templateConnection[0].source : undefined;
  const templateNodeData = useNodesData(templateSourceId ? [templateSourceId] : []);
  const template = templateSourceId
    ? ((templateNodeData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  // Parse template for %%TOKEN%% patterns
  const regex = /%%([^%]+)%%/g;
  const matches = [...template.matchAll(regex)];

  // Build list of unique tokens and their handle IDs
  const tokens: Array<{ token: string; handleId: string }> = [];
  const seenTokens = new Set<string>();

  matches.forEach((match) => {
    const token = match[1];
    if (!seenTokens.has(token)) {
      seenTokens.add(token);
      tokens.push({
        token,
        handleId: `token-${token}`
      });
    }
  });

  // Get connections by handle ID (excluding the template handle)
  const handleConnections = new Map<string, string>();
  allConnections.forEach(conn => {
    const handleId = conn.targetHandle;
    if (handleId && handleId !== 'template') {
      handleConnections.set(handleId, conn.source);
    }
  });

  // Get source IDs for all connected handles
  const sourceIds = tokens
    .map(t => handleConnections.get(t.handleId))
    .filter((id): id is string => id !== undefined);

  const nodesData = useNodesData(sourceIds);

  // Build map of token -> replacement value
  const tokenValues = new Map<string, string>();
  tokens.forEach((t, i) => {
    const sourceId = handleConnections.get(t.handleId);
    if (sourceId) {
      const nodeIndex = sourceIds.indexOf(sourceId);
      if (nodeIndex >= 0) {
        const nodeValue = (nodesData[nodeIndex]?.data as NodeData | undefined)?.value ?? '';
        tokenValues.set(t.token, nodeValue);
      }
    }
  });

  // Serialize token values for dependency tracking
  const tokenValuesString = Array.from(tokenValues.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|||');

  useEffect(() => {
    // If no template input, output empty
    if (!templateSourceId) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Replace all %%TOKEN%% with their values
    let output = template;

    // Sort matches by position (descending) to avoid offset issues
    const sortedMatches = [...matches].sort((a, b) => (b.index ?? 0) - (a.index ?? 0));

    sortedMatches.forEach((match) => {
      const token = match[1];
      const replacement = tokenValues.get(token) ?? `%%${token}%%`;
      const startPos = match.index ?? 0;
      const endPos = startPos + match[0].length;

      output = output.slice(0, startPos) + replacement + output.slice(endPos);
    });

    if (data.value !== output) {
      updateNodeData(id, { value: output });
    }
  }, [template, tokenValuesString, templateSourceId, id, updateNodeData, data.value]);

  const HANDLE_SPACING = 25;
  const HANDLE_START = 75;

  // Calculate minimum height based on number of handles (including template handle)
  const totalHandles = tokens.length + 1; // +1 for template handle
  const minHeight = HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 15;

  return (
    <NodeContainer
      id={id}
      selected={selected}
      title="Template"
      style={{ minWidth: '250px', minHeight: `${minHeight}px` }}
      isDarkMode={data.isDarkMode}
      category={getNodeCategory(type)}
    >
      <Handle type="source" position={Position.Right} />

      <div className="node-description">
        Replace %%TOKEN%% with inputs
      </div>

      {tokens.length > 0 && (
        <div className="node-info" style={{ fontSize: '11px', marginTop: '5px' }}>
          {tokens.length} token{tokens.length !== 1 ? 's' : ''}: {tokens.map(t => t.token).join(', ')}
        </div>
      )}

      {/* Template input handle (always first) */}
      <Handle
        type="target"
        position={Position.Left}
        id="template"
        style={{
          top: `${HANDLE_START}px`,
          background: templateSourceId ? '#555' : '#999',
        }}
      />

      {/* Render dynamic handles for each unique token (offset by 1 for template handle) */}
      {tokens.map((t, i) => {
        const isConnected = handleConnections.has(t.handleId);

        return (
          <Handle
            key={t.handleId}
            type="target"
            position={Position.Left}
            id={t.handleId}
            style={{
              top: `${HANDLE_START + (i + 1) * HANDLE_SPACING}px`,
              background: isConnected ? '#555' : '#999',
            }}
          />
        );
      })}
    </NodeContainer>
  );
}
