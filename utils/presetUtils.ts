import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../App';

// Import preset files directly - they'll be compiled into the build
import quickUnicodeConverter from '../presets/quick-unicode-converter.json';
import infiniteJest from '../presets/infinite-jest.json';
import wippSignBunny from '../presets/wipp-sign-bunny.json';

export type PresetMetadata = {
  id: string;
  displayName: string;
  description?: string;
};

export type PresetData = {
  version?: number;
  name?: string;
  description?: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  darkMode?: boolean;
};

// Registry of all presets compiled into the build
const PRESET_REGISTRY: Record<string, PresetData> = {
  'quick-unicode-converter': quickUnicodeConverter as PresetData,
  'infinite-jest': infiniteJest as PresetData,
  'wipp-sign-bunny': wippSignBunny as PresetData,
};

/**
 * Returns list of available presets with metadata.
 */
export function getAvailablePresets(): PresetMetadata[] {
  return [
    {
      id: 'quick-unicode-converter',
      displayName: 'Quick Unicode Converter',
      description: 'Simple unicode text styling demo'
    },
    {
      id: 'infinite-jest',
      displayName: 'Infinite Jest',
      description: 'Template-based text transformation'
    },
    {
      id: 'wipp-sign-bunny',
      displayName: 'WIPP Sign Bunny',
      description: 'ASCII art generation pipeline'
    }
  ];
}

/**
 * Loads preset data synchronously from the compiled registry.
 */
export function loadPresetFile(presetId: string): PresetData {
  const preset = PRESET_REGISTRY[presetId];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`);
  }
  return preset;
}

/**
 * Validates preset data structure.
 * Supports both format types (with/without version field).
 */
export function validatePresetData(data: any): data is PresetData {
  // Check for required fields
  if (!data.nodes || !Array.isArray(data.nodes)) {
    return false;
  }
  if (!data.edges || !Array.isArray(data.edges)) {
    return false;
  }
  return true;
}
