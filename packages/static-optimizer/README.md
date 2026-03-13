# @threeforged/static-optimizer

Detect static mesh merge opportunities in Three.js scenes. Groups non-animated meshes by material compatibility and estimates draw call savings from static batching.

## Installation

1. Install the CLI: `npm install -g @threeforged/cli`
2. Install this plugin: `npm install @threeforged/static-optimizer`
3. Run: `threeforged static ./scene.glb`

## CLI Usage

```bash
threeforged static <path>               # Detect static merge candidates
threeforged static <path> --json        # JSON output
threeforged static <path> -o report.txt # Save to file
```

## Programmatic Usage

```javascript
import { detectStaticMergeCandidates } from '@threeforged/static-optimizer';

const report = await detectStaticMergeCandidates('./scene.glb');
console.log(report.groups);       // Merge candidate groups
console.log(report.metrics);      // Scene metrics + savings estimates
console.log(report.warnings);     // Actionable warnings
```

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
  },
};
```

## License

MIT
