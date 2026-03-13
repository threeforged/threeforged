import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  target: 'node18',
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [
    '@threeforged/core',
    '@threeforged/asset-analyzer',
    '@threeforged/performance-auditor',
    '@threeforged/lod-generator',
    '@threeforged/instancing-optimizer',
    '@threeforged/static-optimizer',
    '@gltf-transform/core',
    '@gltf-transform/functions',
    'sharp',
    'meshoptimizer',
  ],
});
