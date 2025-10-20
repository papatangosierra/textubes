import SourceNode from "./components/SourceNode";
import ResultNode from "./components/ResultNode";
import CapslockNode from "./components/CapslockNode";
import ReplaceNode from "./components/ReplaceNode";
import RandomNode from "./components/RandomNode";
import RandomNounNode from "./components/RandomNounNode";
import UnicodeStyleNode from "./components/UnicodeStyleNode";
import ConcatenateNode from "./components/ConcatenateNode";
import ReverseNode from "./components/ReverseNode";
import TrimPadNode from "./components/TrimPadNode";
import RepeatNode from "./components/RepeatNode";
import CopypastaNode from "./components/CopypastaNode";
import RandomSelectionNode from "./components/RandomSelectionNode";
import BoxNode from "./components/BoxNode";
import HelpNode from "./components/HelpNode";
import { HELP_TEXT } from "./components/HelpNode";
import type { NodeData } from "./App";

export type NodeConfig = {
  component: React.ComponentType<any>;
  label: string;
  /** Function to generate initial data for the node */
  initialData?: () => Record<string, any>;
  /** Category for organizing nodes in the picker */
  category: 'source' | 'transformer' | 'destination';
};

export const NODE_REGISTRY: Record<string, NodeConfig> = {
  source: {
    component: SourceNode,
    label: "Text",
    category: 'source',
  },
  copypasta: {
    component: CopypastaNode,
    label: "Copypasta",
    category: 'source',
    initialData: () => {
      const defaultPasta = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
      return { value: defaultPasta, selected: 'lorem' };
    },
  },
  random: {
    component: RandomNode,
    label: "Random Alphanumeric Text",
    category: 'source',
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
  randomnoun: {
    component: RandomNounNode,
    label: "Random Noun",
    category: 'source',
    // Value will be generated after word list loads
    initialData: () => ({ value: "" }),
  },
  help: {
    component: HelpNode,
    label: "Help",
    category: 'source',
    initialData: () => ({
      value: HELP_TEXT
    }),
  },
  capslock: {
    component: CapslockNode,
    label: "Capslock",
    category: 'transformer',
  },
  unicode: {
    component: UnicodeStyleNode,
    label: "Unicode Abuse",
    category: 'transformer',
  },
  replace: {
    component: ReplaceNode,
    label: "Replace",
    category: 'transformer',
  },
  concatenate: {
    component: ConcatenateNode,
    label: "Concatenate",
    category: 'transformer',
  },
  randomselection: {
    component: RandomSelectionNode,
    label: "Random Selection",
    category: 'transformer',
    initialData: () => ({ value: "", mode: "word" }),
  },
  reverse: {
    component: ReverseNode,
    label: "Reverse",
    category: 'transformer',
  },
  trimpad: {
    component: TrimPadNode,
    label: "Trim/Pad",
    category: 'transformer',
  },
  repeat: {
    component: RepeatNode,
    label: "Repeat",
    category: 'transformer',
  },
  box: {
    component: BoxNode,
    label: "Box",
    category: 'transformer',
  },
  result: {
    component: ResultNode,
    label: "Result",
    category: 'destination',
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

/** Get category for a node type */
export function getNodeCategory(nodeType: string): 'source' | 'transformer' | 'destination' | undefined {
  return NODE_REGISTRY[nodeType]?.category;
}
