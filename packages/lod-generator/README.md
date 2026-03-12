# @threeforged/lod-generator

Simplify Three.js meshes using production-quality mesh decimation (meshoptimizer). Reduce polygon counts for better performance — works on single files or entire asset directories.

## Installation

1. Install the CLI (if not already):
```bash
npm install -g @threeforged/cli
```

2. Install this plugin:
```bash
npm install -g @threeforged/lod-generator
```

3. Run:
```bash
threeforged lod ./models/
```

## Quick Start

```bash
# See how much your models can be simplified (no files created)
threeforged lod ./models/

# Simplify all models to 25% of original triangle count
threeforged lod ./models/ --target 0.25 --write

# Preview first, generate after
threeforged lod hero.glb --target 0.3          # see the numbers
threeforged lod hero.glb --target 0.3 --write  # generate the file
```

## Two Modes

### Target Mode (recommended for most projects)

Generates **one simplified file** per model. Best for reducing asset weight without changing your project structure.

```bash
# Simplify a single model to 30% of its triangles
threeforged lod character.glb --target 0.3 --write
# → character_simplified.glb

# Simplify an entire directory
threeforged lod models/units/ --target 0.2 --write
# → models/units/archer_simplified.glb
# → models/units/cavalry_simplified.glb
# → models/units/mage_simplified.glb
# → ... (original files untouched)
```

### Multi-Level Mode (for THREE.LOD distance switching)

Generates **multiple LOD files** at progressively lower detail. Use this when you want distance-based mesh swapping with `THREE.LOD`.

```bash
threeforged lod tree.glb --levels 3 --ratio 0.5 --write
# → tree_lod1.glb     (50% of original)
# → tree_lod2.glb     (25% of original)
# → tree_lod3.glb     (12.5% of original)
```

## CLI Options

| Option | Default | Description |
|---|---|---|
| `--target <n>` | — | Simplify to this ratio (0-1). Produces one `_simplified` file per model |
| `--levels <n>` | `3` | Number of LOD levels (multi-level mode) |
| `--ratio <n>` | `0.5` | Reduction ratio per level (multi-level mode) |
| `--error <n>` | `0.01` | Simplification error tolerance (higher = more aggressive) |
| `--write` | off | Actually generate files (default: analyze only) |
| `--force` | off | Overwrite existing output files |
| `--output-dir <dir>` | same as input | Output directory for generated files |
| `-o, --output <file>` | — | Save report to a file |
| `--json` | off | JSON output |

## Using Simplified Models in Three.js

### Drop-in Replacement (simplest)

If you used `--target` to create a lighter version of a model, just swap the file path:

```javascript
// Before: loading the original heavy model
const model = await loader.loadAsync('models/castle.glb');

// After: load the simplified version instead
const model = await loader.loadAsync('models/castle_simplified.glb');
```

No code changes beyond the path. The simplified model has the same structure, materials, and textures — just fewer polygons.

### Zoom-Based Switching (games with zoom, e.g. strategy/4X/RTS)

For games where zoom level determines how much detail you need, keep two versions (original + simplified) and toggle based on camera distance:

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Load both versions for each unit type
async function loadUnit(name) {
  const [high, low] = await Promise.all([
    loader.loadAsync(`models/units/${name}.glb`),
    loader.loadAsync(`models/units/${name}_simplified.glb`),
  ]);
  return { high: high.scene, low: low.scene };
}

// Add both to the scene, hide one
function addUnit(unit, position) {
  unit.high.position.copy(position);
  unit.low.position.copy(position);
  unit.low.visible = false;
  scene.add(unit.high);
  scene.add(unit.low);
}

// Call this when zoom changes — all units switch together
function updateLOD(cameraHeight) {
  const useHighDetail = cameraHeight < 80;
  for (const unit of units) {
    unit.high.visible = useHighDetail;
    unit.low.visible = !useHighDetail;
  }
}
```

This works well for strategy games because zoom affects all units equally — you switch them all at once rather than per-object.

### Per-Object Distance LOD (open world / large scenes)

For scenes where individual objects are at different distances from the camera, use `THREE.LOD`. This requires multi-level mode (`--levels`):

```bash
threeforged lod models/tree.glb --levels 2 --ratio 0.4 --write
```

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

async function createLODObject(baseName) {
  const lod = new THREE.LOD();

  const [high, med, low] = await Promise.all([
    loader.loadAsync(`models/${baseName}.glb`),
    loader.loadAsync(`models/${baseName}_lod1.glb`),
    loader.loadAsync(`models/${baseName}_lod2.glb`),
  ]);

  lod.addLevel(high.scene, 0);    // full detail when close
  lod.addLevel(med.scene, 50);    // medium detail at 50 units
  lod.addLevel(low.scene, 150);   // low detail at 150 units

  return lod;
}

// THREE.LOD automatically switches based on camera distance each frame
const tree = await createLODObject('tree');
scene.add(tree);
```

`THREE.LOD` handles the distance checking and visibility toggling automatically — you don't need to write update logic.

### Choosing Distance Thresholds

The right distance thresholds depend on your scene. Rules of thumb:

| Object size | LOD1 distance | LOD2 distance | LOD3 distance |
|---|---|---|---|
| Small (props, items) | 20-30 | 50-80 | 100+ |
| Medium (characters, furniture) | 40-60 | 80-120 | 150+ |
| Large (buildings, vehicles) | 80-120 | 150-250 | 300+ |

Start with these and adjust based on when you can visually notice the quality difference in your specific scene.

## Safety

- **Never modifies original files** — only creates new suffixed files
- **Analyze mode by default** — no files written unless `--write` is passed
- **No overwrite by default** — skips existing files unless `--force` is used
- **Output path validation** — generated files stay within the working directory
- **GLB/GLTF only** — OBJ files are gracefully skipped

## Programmatic Usage

```javascript
import { generateLOD } from '@threeforged/lod-generator';

// Analyze: see simplification potential without writing files
const report = await generateLOD('./models/', { target: 0.3 });
for (const file of report.files) {
  const original = file.levels[0].totalTriangles;
  const simplified = file.levels[1].totalTriangles;
  console.log(`${file.file}: ${original} → ${simplified} triangles`);
}

// Generate simplified files
await generateLOD('./models/', { target: 0.3, write: true });

// Multi-level LOD
await generateLOD('./tree.glb', { levels: 3, ratio: 0.5, write: true });
```

## Configuration

Add defaults to `threeforged.config.js` in your project root:

```javascript
export default {
  lodGenerator: {
    levels: 3,
    ratio: 0.5,
    error: 0.01,
    minTriangles: 8,
    maxFiles: 500,
  },
};
```

## Best Suited For

LOD generation provides the most value on **high-poly source meshes** that haven't been manually optimized:

- **Photogrammetry scans** — 100K+ triangle raw captures
- **Sculpted models** — Blender/ZBrush exports with subdivision surfaces
- **CAD/architectural imports** — detailed mechanical or structural models
- **Detailed environment assets** — foliage, terrain, buildings with high geometry density

The tool will detect and warn you when models are already optimized. Game-ready assets that have been manually retopologized (low-poly characters, hand-modeled props) typically show minimal reduction — this is expected and means they're already efficient.

### Limitations

- **Flat-shaded geometry** — Models with unique normals per face (for hard edges/flat shading) have no shared vertices for the simplifier to collapse. The tool will warn when it detects this.
- **GLB/GLTF only** — OBJ files are not supported for LOD generation (they are gracefully skipped).
- **Simplification is geometric only** — texture resolution, material complexity, and draw calls are not affected. Use `threeforged analyze` and `threeforged audit` for those.

## How It Works

1. Reads GLB/GLTF files using `@gltf-transform/core`
2. Welds coincident vertices for clean mesh topology
3. Applies meshoptimizer WASM-based simplification at the target ratio
4. Reports triangle/vertex counts with reduction percentages
5. Optionally writes simplified meshes as new GLB files

The simplification algorithm (meshoptimizer) preserves:
- Mesh topology and silhouette
- UV coordinates and texture mapping
- Material assignments
- Scene hierarchy

## License

MIT
