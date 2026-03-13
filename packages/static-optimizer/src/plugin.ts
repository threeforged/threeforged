import type { ThreeForgedPlugin } from '@threeforged/core';

export const threeforgedPlugin: ThreeForgedPlugin = {
  name: '@threeforged/static-optimizer',
  version: '0.1.0',
  description: 'Detect static mesh merge opportunities in Three.js scenes',
  registerCLI(_program: unknown) {
    // CLI registration is handled by the built-in static command
    // This plugin export enables auto-discovery
  },
};
