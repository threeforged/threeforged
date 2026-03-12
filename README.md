# ThreeForged

Modular CLI toolkit for optimizing Three.js assets and scenes. Analyze 3D files, detect performance issues, and get actionable recommendations — all from the command line.

## Quick Start

```bash
# Install the CLI globally
npm install -g @threeforged/cli

# Install the asset analyzer plugin in your project
npm install --save-dev @threeforged/asset-analyzer

# Analyze your 3D assets
threeforged analyze ./models/
```

Or use without installing globally:

```bash
npx @threeforged/cli analyze ./models/
```

## Packages

| Package | Description | Status |
|---|---|---|
| [@threeforged/cli](https://www.npmjs.com/package/@threeforged/cli) | Command-line interface with plugin auto-discovery | Published |
| [@threeforged/asset-analyzer](https://www.npmjs.com/package/@threeforged/asset-analyzer) | Analyze GLB, GLTF, and OBJ files for performance issues | Published |
| [@threeforged/core](https://www.npmjs.com/package/@threeforged/core) | Shared types, loaders, and utilities (internal) | Published |
| @threeforged/performance-auditor | Runtime scene performance auditing | Coming soon |
| @threeforged/lod-generator | Automatic level-of-detail generation | Coming soon |
| @threeforged/instancing-optimizer | Instanced rendering optimization | Coming soon |
| @threeforged/static-optimizer | Static geometry merging and batching | Coming soon |

## How It Works

1. Install `@threeforged/cli` globally (or use via `npx`)
2. Install any plugins you need in your project as dev dependencies
3. The CLI automatically discovers installed `@threeforged/*` plugins
4. Run commands provided by those plugins

## Asset Analyzer

Scans your 3D asset files and produces a detailed report:

```bash
# Analyze a single file
threeforged analyze model.glb

# Analyze a directory
threeforged analyze ./models/

# JSON output for CI/CD pipelines
threeforged analyze ./models/ --json

# Save report to file
threeforged analyze ./models/ -o report.txt
```

### What It Checks

| Rule | Severity | Description |
|---|---|---|
| `high-poly` | warn/error | Meshes exceeding polygon thresholds (50k warn, 100k error) |
| `duplicate-materials` | warn | Identical materials that could be merged |
| `large-textures` | warn | Textures exceeding 4096x4096 |
| `texture-memory` | error | Total GPU texture memory exceeding 64 MB |
| `unindexed-geometry` | warn | Meshes without index buffers |
| `duplicate-meshes` | info | Repeated geometry that could use instancing |

### Report Output

The analyzer produces a summary with:

- **Metrics** — total meshes, triangles, vertices, materials, textures, draw calls, animations, GPU memory
- **Files table** — per-file breakdown of all metrics
- **Warnings** — actionable issues found in your assets

### Programmatic API

```typescript
import { analyzeAssets } from '@threeforged/asset-analyzer';

const report = await analyzeAssets('./models/');
console.log(report.metrics.totalTriangles);
console.log(report.warnings);
```

## Configuration

Create a `threeforged.config.js` in your project root to customize thresholds:

```javascript
export default {
  polyCountThresholds: { medium: 30000, large: 80000 },
  maxTextureSize: 2048,
  maxTextureMB: 32,
};
```

## Supported Formats

- **GLB** — Binary glTF (recommended)
- **GLTF** — JSON-based glTF with external resources
- **OBJ** — Wavefront OBJ

## Requirements

- Node.js >= 18

## License

MIT
