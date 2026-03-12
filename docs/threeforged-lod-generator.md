# ThreeForged LOD Generator

The ThreeForged LOD Generator automatically generates **Level of Detail (LOD)** meshes for 3D models used in Three.js projects.

Package:

@threeforged/lod-generator

---

# Purpose

Level of Detail (LOD) is a critical optimization technique used in real-time rendering.

LOD reduces the complexity of objects when they are far away from the camera by switching to lower-poly versions of the mesh.

This significantly improves rendering performance in scenes with many objects.

The LOD Generator automatically creates simplified versions of meshes so developers do not have to manually create them.

---

# Installation

```bash
npm install @threeforged/lod-generator
```

---

# CLI Usage

The LOD generator can be used through the ThreeForged CLI.

```bash
threeforged lod ./models/tree.glb
```

This command generates simplified versions of the mesh.

---

# CLI Options

Developers can control LOD generation using options.

```
--levels
--ratio
--output
```

Example:

```bash
threeforged lod tree.glb --levels=3 --ratio=0.5
```

This creates 3 LOD levels where each level reduces triangle count by 50%.

---

# Example Output

```
ThreeForged LOD Report
----------------------

Model: tree.glb

LOD0: 24,382 triangles
LOD1: 12,110 triangles
LOD2: 6,034 triangles
LOD3: 2,991 triangles
```

---

# Generated Files

The generator may output separate LOD files.

Example:

```
tree_lod0.glb
tree_lod1.glb
tree_lod2.glb
tree_lod3.glb
```

Alternatively, LODs may be embedded into a single model depending on the export settings.

---

# How LOD Works in Three.js

Three.js includes a built-in `THREE.LOD` class.

Example:

```javascript
const lod = new THREE.LOD()

lod.addLevel(highMesh, 0)
lod.addLevel(mediumMesh, 50)
lod.addLevel(lowMesh, 120)
```

The engine automatically switches meshes based on camera distance.

The LOD Generator prepares meshes that can be used with this system.

---

# Simplification Algorithm

The generator uses mesh decimation algorithms to reduce geometry complexity.

Common techniques include:

• vertex collapse  
• edge contraction  
• triangle reduction  

These algorithms preserve the shape of the model while reducing polygon counts.

---

# JSON Output

Machine-readable output can be generated.

```bash
threeforged lod tree.glb --json
```

Example:

```json
{
  "model": "tree.glb",
  "lods": [
    { "level": 0, "triangles": 24382 },
    { "level": 1, "triangles": 12110 },
    { "level": 2, "triangles": 6034 },
    { "level": 3, "triangles": 2991 }
  ]
}
```

---

# Programmatic Usage

Developers can also use the generator directly in code.

```javascript
import { generateLOD } from "@threeforged/lod-generator"

const lods = await generateLOD("./tree.glb", {
  levels: 3,
  ratio: 0.5
})

console.log(lods)
```

---

# Best Use Cases

LOD generation is most useful for:

• open world environments  
• forests and vegetation  
• cities and large environments  
• large prop libraries  
• distant scenery

---

# Integration with Other Plugins

LOD generation works best alongside other optimization tools.

Example workflow:

```
threeforged analyze ./assets
threeforged audit ./scene.glb
threeforged lod ./models
```

---

# Future Improvements

Planned improvements include:

• smarter LOD distance recommendations  
• automatic scene integration  
• texture resolution scaling  
• progressive mesh streaming

---

# Goal

The LOD Generator helps developers quickly generate optimized meshes so that large scenes remain performant while preserving visual quality.