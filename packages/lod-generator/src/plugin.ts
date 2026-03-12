import type { ThreeForgedPlugin } from '@threeforged/core';

export const threeforgedPlugin: ThreeForgedPlugin = {
  name: '@threeforged/lod-generator',
  version: '0.1.0',
  description: 'Generate levels of detail for Three.js meshes',
  registerCLI(_program: unknown) {
    // CLI registration is handled by the built-in lod command
    // This plugin export enables auto-discovery
  },
};
