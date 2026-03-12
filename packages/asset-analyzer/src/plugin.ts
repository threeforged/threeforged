import type { ThreeForgedPlugin } from '@threeforged/core';

export const threeforgedPlugin: ThreeForgedPlugin = {
  name: '@threeforged/asset-analyzer',
  version: '0.1.0',
  description: 'Analyze 3D assets for performance issues',
  registerCLI(_program: unknown) {
    // CLI registration is handled by the built-in analyze command
    // This plugin export enables auto-discovery
  },
};
