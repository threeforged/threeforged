# @threeforged/static-optimizer

Analyze and merge static meshes in Three.js scenes. Groups non-animated meshes by material compatibility, estimates draw call savings, and optionally merges them into optimized output files using gltf-transform.

## Installation

1. Install the CLI: `npm install -g @threeforged/cli`
2. Install this plugin: `npm install @threeforged/static-optimizer`
3. Run: `threeforged static ./scene.glb`

## CLI Usage

```bash
# Analyze mode (default — no files written)
threeforged static <path>                          # Detect static merge candidates
threeforged static <path> --json                   # JSON output
threeforged static <path> -o report.txt            # Save to file

# Write mode — merge static meshes into new files
threeforged static <path> --write                  # Merge and output *_merged.glb
threeforged static <path> --write --force          # Overwrite existing output files
threeforged static <path> --write --output-dir out # Write merged files to out/
```

**Safe by default:** analyze-only mode unless `--write` is passed. Never modifies original files. Output files use a `_merged` suffix (e.g. `scene.glb` → `scene_merged.glb`).

## Programmatic Usage

```javascript
import { detectStaticMergeCandidates } from '@threeforged/static-optimizer';

// Analyze only
const report = await detectStaticMergeCandidates('./scene.glb');
console.log(report.groups);       // Merge candidate groups
console.log(report.metrics);      // Scene metrics + savings estimates
console.log(report.warnings);     // Actionable warnings

// Merge static meshes and write output files
const writeReport = await detectStaticMergeCandidates('./scene.glb', {
  write: true,
  force: false,
  outputDir: './optimized',
});
console.log(writeReport.fileResults); // Per-file before/after metrics
```

## Merge Pipeline

When `--write` is enabled, the optimizer runs a three-stage gltf-transform pipeline on each GLB/GLTF file:

1. **dedup** — Collapse identical materials into shared references
2. **flatten** — Bake world transforms into vertex positions (skips animated nodes)
3. **join** — Merge primitives sharing the same material into single draw calls

Animated nodes are automatically detected and excluded from merging.

## What It Detects

| Rule | Description |
|---|---|
| Material Grouping | Groups meshes sharing identical material properties (shader type, textures, base color, metallic/roughness) |
| Animation Exclusion | Warns when meshes may be animated — animated meshes cannot be statically batched |
| Attribute Compatibility | Flags groups mixing indexed and non-indexed geometry |
| Savings Estimation | Estimates draw call reduction from merging (severity: error >=50%, warn >=20%, info >=5%) |
| Vertex Budget | Warns when merged vertex count exceeds 65,535 (16-bit index buffer limit) |

## Why Static Batching Matters

Without batching:
```
12 wall meshes with same material = 12 draw calls
```

With static batching:
```
12 wall meshes merged = 1 draw call
```

Static batching is most effective for architecture, terrain, environment props, and decorations — any geometry that never moves at runtime.

## Configuration

Create `threeforged.config.js` in your project root:

```javascript
export default {
  staticOptimizer: {
    minMeshesPerGroup: 2,     // Minimum meshes to form a merge group
    maxGroups: 20,            // Max groups to report
    maxEntriesPerGroup: 8,    // Max mesh entries shown per group
    maxFiles: 500,            // Max files to scan
    maxMergedVertices: 65535, // Vertex limit warning threshold
    write: false,             // Set true to merge by default
    force: false,             // Set true to overwrite existing output
    outputDir: undefined,     // Default: same directory as input
  },
};
```

## License

MIT
