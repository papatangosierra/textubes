import type { Edge } from '@xyflow/react';

/**
 * Recursively finds all upstream node IDs that flow into the given node
 */
export function findUpstreamNodes(nodeId: string, edges: Edge[]): string[] {
  const upstreamIds = new Set<string>();
  const visited = new Set<string>();

  function traverse(currentNodeId: string) {
    if (visited.has(currentNodeId)) return;
    visited.add(currentNodeId);

    // Find all edges that target this node
    const incomingEdges = edges.filter(edge => edge.target === currentNodeId);

    for (const edge of incomingEdges) {
      upstreamIds.add(edge.source);
      traverse(edge.source);
    }
  }

  traverse(nodeId);
  return Array.from(upstreamIds);
}

/**
 * Checks if a node type is a generator/random node
 */
export function isGeneratorNode(nodeType?: string): boolean {
  if (!nodeType) return false;

  const generatorTypes = [
    'random',
    'randomnoun',
    'randomadjective',
    'randomselection',
  ];

  return generatorTypes.includes(nodeType);
}
