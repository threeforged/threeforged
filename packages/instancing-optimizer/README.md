# @threeforged/instancing-optimizer

Detect instancing opportunities in Three.js scenes. Analyzes GLB, GLTF, and OBJ files to find repeated meshes that can be converted to `InstancedMesh`, dramatically reducing draw calls. Reports candidates with confidence levels, estimated savings, and cross-file detection.

## Installation

```bash
# 1. Install the ThreeForged CLI (one-time setup)
npm install -g @threeforged/cli

# 2. Install the instancing optimizer plugin in your project
npm install --save-dev @threeforged/instancing-optimizer

# 3. Detect instancing opportunities
threeforged instancing ./models/
```

## CLI Usage

Requires `@threeforged/cli`:

```bash
# Analyze a single file
threeforged instancing model.glb

# Analyze a directory of assets
threeforged instancing ./models/

# JSON output
threeforged instancing ./scene.glb --json

# Save to file
threeforged instancing ./assets -o report.txt
```

### Output

The optimizer produces a report with:

- **Summary** — total meshes, draw calls, unique geometries, reuse ratio, candidate counts, estimated savings
- **Candidates table** — per-group breakdown with geometry signature, instance count, draw calls saved, VRAM saved, and confidence level
- **Candidate details** — mesh names, source files, and confidence reasons
- **Warnings** — animation exclusions, material compatibility, cross-file opportunities, severity-weighted savings

### Confidence Levels

Each candidate group is assigned a confidence level based on heuristics:

| Level | Meaning |
|---|---|
| **HIGH** | Identical geometry, no animations, compatible materials |
| **MEDIUM** | Some animations present or high material diversity (but name patterns match) |
| **LOW** | High animation density or heterogeneous materials with no name pattern |

## Rules

| Rule | Description |
|---|---|
| `geometry-grouping` | Groups meshes by `vertices:triangles:indexed` signature |
| `animation-exclusion` | Adjusts confidence based on animation channel density |
| `material-compatibility` | Checks material-to-mesh ratio and mesh name prefix patterns |
| `savings-estimation` | Calculates draw call and VRAM savings with severity thresholds |
| `cross-file-detection` | Flags candidates spanning multiple files |

## Programmatic API

```typescript
import { detectInstancingCandidates } from '@threeforged/instancing-optimizer';

const report = await detectInstancingCandidates('./assets');

console.log(report.candidates);  // InstancingCandidate[]
console.log(report.metrics);     // InstancingMetrics
console.log(report.warnings);    // Warning[]
```

## Configuration

Add an `instancingOptimizer` section to `threeforged.config.js`:

```javascript
export default {
  instancingOptimizer: {
    instancingMinCount: 3,           // Minimum meshes to suggest instancing
    maxGroups: 20,                   // Maximum candidate groups to report
    maxEntriesPerGroup: 8,           // Maximum mesh entries shown per group
    minTrianglesPerMesh: 10,         // Ignore trivial geometry
    maxFiles: 500,                   // File scan limit (hard cap: 10,000)
    materialHeterogeneityThreshold: 0.5,  // Material-to-mesh ratio threshold (0, 1]
  },
};
```

## License

MIT
