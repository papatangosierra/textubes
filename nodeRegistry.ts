import SourceNode from "./components/SourceNode";
import ResultNode from "./components/ResultNode";
import CapslockNode from "./components/CapslockNode";
import ReplaceNode from "./components/ReplaceNode";
import RandomNode from "./components/RandomNode";
import UnicodeStyleNode from "./components/UnicodeStyleNode";
import type { NodeData } from "./App";

export type NodeConfig = {
  component: React.ComponentType<any>;
  label: string;
  /** Function to generate initial data for the node */
  initialData?: () => Record<string, any>;
};

export const NODE_REGISTRY: Record<string, NodeConfig> = {
  source: {
    component: SourceNode,
    label: "Source",
  },
  random: {
    component: RandomNode,
    label: "Random",
    initialData: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      const length = 10;
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return { value: randomString, length };
    },
  },
  capslock: {
    component: CapslockNode,
    label: "Capslock",
  },
  unicode: {
    component: UnicodeStyleNode,
    label: "Unicode Style",
  },
  replace: {
    component: ReplaceNode,
    label: "Replace",
  },
  result: {
    component: ResultNode,
    label: "Result",
  },
};

/** Get React Flow nodeTypes object from registry */
export function getNodeTypes() {
  return Object.fromEntries(
    Object.entries(NODE_REGISTRY).map(([key, config]) => [key, config.component])
  );
}

/** Get initial data for a node type */
export function getInitialNodeData(nodeType: string): NodeData {
  const config = NODE_REGISTRY[nodeType];
  if (config?.initialData) {
    return config.initialData() as NodeData;
  }
  return { value: "" };
}
