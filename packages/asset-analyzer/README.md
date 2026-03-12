# @threeforged/asset-analyzer

Analyze 3D assets for performance issues. Scans GLB, GLTF, and OBJ files and reports potential problems like high polygon counts, duplicate materials, oversized textures, and more.

## Installation

```bash
# 1. Install the ThreeForged CLI (one-time setup)
npm install -g @threeforged/cli

# 2. Install the asset analyzer plugin in your project
npm install --save-dev @threeforged/asset-analyzer

# 3. Analyze your assets
threeforged analyze ./models/
```

## CLI Usage

```bash
# Analyze a single file
threeforged analyze model.glb

# Analyze a directory of assets
threeforged analyze ./models/

# Save report to file
threeforged analyze ./models/ -o report.txt

# JSON output
threeforged analyze ./models/ --json
```

### Output

The analyzer produces a report with:

- **Summary** — total meshes, triangles, vertices, materials, textures, draw calls, animations, GPU memory
- **Files table** — per-file breakdown with format, size, mesh count, vertices, triangles, materials, draw calls, and animations
- **Warnings** — actionable issues found in your assets

## Analysis Rules

| Rule | Severity | What it checks |
|---|---|---|
| `high-poly` | warn/error | Meshes exceeding polygon thresholds (50k warn, 100k error) |
| `duplicate-materials` | warn | Materials with identical properties that could be merged |
| `large-textures` | warn | Textures exceeding max dimensions (default: 4096x4096) |
| `texture-memory` | error | Total GPU texture memory exceeding budget (default: 64 MB) |
| `unindexed-geometry` | warn | Meshes without index buffers (higher memory usage) |
| `duplicate-meshes` | info | Meshes sharing identical geometry across files (instancing candidates) |

## Programmatic API

```typescript
import { analyzeAssets } from '@threeforged/asset-analyzer';

const report = await analyzeAssets('./models/');

console.log(report.metrics.totalTriangles);
console.log(report.warnings);
```

## Configuration

Thresholds can be customized via `threeforged.config.js`:

```javascript
export default {
  polyCountThresholds: { medium: 30000, large: 80000 },
  maxTextureSize: 2048,
  maxTextureMB: 32,
};
```

## License

MIT
