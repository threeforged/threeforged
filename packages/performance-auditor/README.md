# @threeforged/performance-auditor

Audit Three.js scene performance against platform-specific budgets. Analyzes draw calls, triangle counts, VRAM usage, material complexity, geometry efficiency, and instancing opportunities. Produces a composite 0-100 performance score with letter grade.

## Installation

```bash
pnpm add @threeforged/performance-auditor
```

## CLI Usage

Requires `@threeforged/cli`:

```bash
# Audit with default desktop profile
threeforged audit ./assets

# Audit with mobile profile
threeforged audit ./assets --profile mobile

# JSON output
threeforged audit ./scene.glb --json

# Save to file
threeforged audit ./assets -o report.txt
```

### Profiles

| Profile | Draw Calls | Triangles | VRAM |
|---|---|---|---|
| `mobile` | 100 | 500K | 128 MB |
| `desktop` | 300 | 2M | 512 MB |
| `high-end` | 1,000 | 10M | 2,048 MB |

## Programmatic API

```typescript
import { auditPerformance } from '@threeforged/performance-auditor';

const report = await auditPerformance('./assets', 'mobile');

console.log(report.score);   // 0-100
console.log(report.grade);   // 'A' | 'B' | 'C' | 'D' | 'F'
console.log(report.profile); // 'mobile'
console.log(report.warnings);
console.log(report.metrics);
```

## Rules

| Rule | Description |
|---|---|
| `draw-calls` | Draw call count vs profile budget |
| `triangle-budget` | Total triangles vs profile budget |
| `vram-usage` | Texture + geometry VRAM estimate vs budget |
| `material-count` | Unique material count + duplicate detection |
| `geometry-complexity` | Dense geometry, unindexed meshes, vertex-heavy meshes |
| `instancing-opportunities` | Cross-document duplicate geometry detection |
| `performance-score` | Composite 0-100 weighted score with letter grade |

## Configuration

Add a `performanceAuditor` section to `threeforged.config.js`:

```javascript
export default {
  performanceAuditor: {
    profile: 'mobile',
    drawCallThresholds: { mobile: 80, desktop: 250, 'high-end': 800 },
    triangleThresholds: { mobile: 300000, desktop: 1500000, 'high-end': 8000000 },
    vramBudgetMB: { mobile: 96, desktop: 384, 'high-end': 1536 },
    maxMaterials: 15,
    maxMaterialsError: 40,
    maxVerticesPerMesh: 300000,
    instancingMinCount: 3,
    maxFiles: 500,
  },
};
```

## License

MIT
