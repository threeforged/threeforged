# ThreeForged

Modular CLI toolkit for optimizing Three.js assets and scenes. Analyze 3D files, audit performance, detect instancing opportunities, and generate simplified LOD meshes — all from the command line.

## Quick Start

```bash
# Install the CLI and all plugins globally
npm install -g @threeforged/cli @threeforged/asset-analyzer @threeforged/performance-auditor @threeforged/instancing-optimizer @threeforged/lod-generator

# Analyze your 3D assets
threeforged analyze ./models/

# Audit performance against budgets
threeforged audit ./models/

# Find instancing opportunities
threeforged instancing ./models/

# Check simplification potential
threeforged lod ./models/
```

Or use without installing globally:

```bash
npx @threeforged/cli analyze ./models/
```

## Packages

| Package | Description | Status |
|---|---|---|
| [@threeforged/cli](packages/cli/) | Command-line interface with plugin auto-discovery | Published |
| [@threeforged/core](packages/core/) | Shared types, loaders, and utilities (internal) | Published |
| [@threeforged/asset-analyzer](packages/asset-analyzer/) | Analyze GLB, GLTF, and OBJ files for performance issues | Published |
| [@threeforged/performance-auditor](packages/performance-auditor/) | Audit scenes against draw call, VRAM, and triangle budgets | Published |
| [@threeforged/instancing-optimizer](packages/instancing-optimizer/) | Detect duplicate geometry and estimate instancing savings | Published |
| [@threeforged/lod-generator](packages/lod-generator/) | Simplify meshes for level-of-detail rendering | Published |
| @threeforged/static-optimizer | Static geometry merging and batching | Coming soon |

## How It Works

1. Install `@threeforged/cli` globally (or use via `npx`)
2. Install any plugins you need
3. The CLI automatically discovers installed `@threeforged/*` plugins
4. Run commands provided by those plugins

## Commands

### `threeforged analyze <path>`

Scans 3D asset files and produces a detailed report on geometry, materials, textures, and common issues.

```bash
threeforged analyze ./models/              # Analyze a directory
threeforged analyze model.glb              # Analyze a single file
threeforged analyze ./models/ --json       # JSON output for CI/CD
threeforged analyze ./models/ -o report.txt  # Save to file
```

**What it checks:** high polygon counts, duplicate materials, oversized textures, GPU memory usage, unindexed geometry, duplicate meshes.

### `threeforged audit <path>`

Audits assets against performance budgets for draw calls, VRAM, triangle counts, material usage, and geometry complexity. Produces a weighted performance score.

```bash
threeforged audit ./models/                # Desktop profile (default)
threeforged audit ./models/ --profile mobile  # Mobile profile (stricter)
threeforged audit ./models/ --json         # JSON output
```

**What it checks:** draw call budget, triangle budget, VRAM usage, material count, geometry complexity, instancing opportunities, overall performance score.

### `threeforged instancing <path>`

Detects duplicate geometry across your assets and estimates draw call savings from instanced rendering.

```bash
threeforged instancing ./models/           # Detect instancing opportunities
threeforged instancing ./models/ --json    # JSON output
```

**What it checks:** geometry hash grouping, material compatibility, animation exclusion, cross-file duplicate detection, draw call savings estimation.

### `threeforged lod <path>`

Simplifies meshes using meshoptimizer for level-of-detail rendering. Supports single-file simplification and multi-level LOD generation.

```bash
threeforged lod ./models/                          # Analyze simplification potential
threeforged lod ./models/ --target 0.3 --write     # Simplify to 30% of original
threeforged lod tree.glb --levels 3 --ratio 0.5 --write  # Generate 3 LOD levels
```

**Safe by default:** analyze-only mode unless `--write` is passed. Never modifies original files. See the [LOD Generator README](packages/lod-generator/README.md) for Three.js integration patterns.

## Programmatic API

Each plugin exports its core function for use in scripts and CI pipelines:

```typescript
import { analyzeAssets } from '@threeforged/asset-analyzer';
import { auditPerformance } from '@threeforged/performance-auditor';
import { analyzeInstancing } from '@threeforged/instancing-optimizer';
import { generateLOD } from '@threeforged/lod-generator';

const analysis = await analyzeAssets('./models/');
const audit = await auditPerformance('./models/');
const instancing = await analyzeInstancing('./models/');
const lod = await generateLOD('./models/', { target: 0.3 });
```

## Configuration

Create a `threeforged.config.js` in your project root to customize thresholds:

```javascript
export default {
  // Asset analyzer
  polyCountThresholds: { medium: 30000, large: 80000 },
  maxTextureSize: 2048,
  maxTextureMB: 32,

  // LOD generator
  lodGenerator: {
    levels: 3,
    ratio: 0.5,
    error: 0.01,
  },
};
```

## Supported Formats

- **GLB** — Binary glTF (recommended)
- **GLTF** — JSON-based glTF with external resources
- **OBJ** — Wavefront OBJ (analyze/audit only, not supported for LOD generation)

## Requirements

- Node.js >= 18

## License

MIT
