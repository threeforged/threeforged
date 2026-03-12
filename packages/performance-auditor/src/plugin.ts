import type { ThreeForgedPlugin } from '@threeforged/core';

export const threeforgedPlugin: ThreeForgedPlugin = {
  name: '@threeforged/performance-auditor',
  version: '0.1.0',
  description: 'Audit Three.js scene performance',
  registerCLI(_program: unknown) {
    // CLI registration is handled by the built-in audit command
    // This plugin export enables auto-discovery
  },
};
