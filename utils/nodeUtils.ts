import type { NodeConnection } from '@xyflow/react';
import type { NodeData } from '../App';

/**
 * Gets the value from a source node, handling multi-output nodes like Split.
 * If connected to a specific output handle (e.g., "output-2"), returns that specific value.
 * Otherwise returns the node's main value field.
 */
export function getSourceValue(
  nodeData: { data?: NodeData } | undefined,
  connection: NodeConnection | undefined
): string {
  if (!nodeData?.data) return '';

  const data = nodeData.data as any;

  // If there's a sourceHandle specified and that property exists, use it
  if (connection?.sourceHandle && data[connection.sourceHandle] !== undefined) {
    return String(data[connection.sourceHandle]);
  }

  // Otherwise fall back to the standard value field
  return data.value ?? '';
}
