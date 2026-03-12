import type { ThreeForgedPlugin } from '@threeforged/core';

export const threeforgedPlugin: ThreeForgedPlugin = {
  name: '@threeforged/instancing-optimizer',
  version: '0.1.0',
  description: 'Detect instancing opportunities in Three.js scenes',
  registerCLI(_program: unknown) {
    // CLI registration is handled by the built-in instancing command
    // This plugin export enables auto-discovery
  },
};
