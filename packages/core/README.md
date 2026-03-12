# @threeforged/core

Shared foundation for all ThreeForged tools. Provides types, file utilities, 3D asset loaders, configuration, and logging.

## Installation

```bash
pnpm add @threeforged/core
```

## Features

- **Asset Loading** — Headless GLB, GLTF, and OBJ parsing (no WebGL required)
- **Type System** — Shared interfaces for meshes, materials, textures, animations, warnings, and reports
- **File Utilities** — Format detection, directory scanning, file size formatting
- **Configuration** — Load `threeforged.config.js` with sensible defaults
- **Logger** — Leveled logging with colored output (debug, info, warn, error, success)

## API

```typescript
import {
  loadDocument,
  findAssetFiles,
  isSupportedFormat,
  detectFormat,
  formatBytes,
  loadConfig,
  getLogger,
  createLogger,
} from '@threeforged/core';

// Load and parse a 3D asset
const doc = await loadDocument('model.glb');
console.log(doc.meshes);     // MeshInfo[]
console.log(doc.materials);  // MaterialInfo[]
console.log(doc.textures);   // TextureInfo[]
console.log(doc.animations); // AnimationInfo[]
console.log(doc.drawCalls);  // number

// Find all supported assets in a directory
const files = await findAssetFiles('./models');

// Configuration
const config = await loadConfig();
```

## Supported Formats

| Format | Extensions | Parser |
|---|---|---|
| glTF Binary | `.glb` | @gltf-transform/core |
| glTF | `.gltf` | @gltf-transform/core |
| Wavefront OBJ | `.obj` | obj-file-parser |

## Configuration

Create a `threeforged.config.js` in your project root:

```javascript
export default {
  polyCountThresholds: { medium: 50000, large: 100000 },
  maxTextureSize: 4096,
  maxTextureMB: 64,
  supportedFormats: ['glb', 'gltf', 'obj'],
  excludePatterns: ['**/node_modules/**'],
};
```

## License

MIT
