# ThreeForged Instancing Optimizer

The ThreeForged Instancing Optimizer detects opportunities to reduce draw calls in Three.js scenes by converting repeated meshes into GPU instanced meshes.

Package:

@threeforged/instancing-optimizer

---

# Purpose

Instancing is one of the most important optimization techniques in Three.js.

When many identical meshes exist in a scene, they can often be rendered using a single draw call via `THREE.InstancedMesh`.

The Instancing Optimizer analyzes a scene and identifies meshes that can be instanced safely.

This dramatically reduces draw calls and improves rendering performance.

---

# Installation

```bash
npm install @threeforged/instancing-optimizer
```

---

# CLI Usage

Run the optimizer through the ThreeForged CLI.

```bash
threeforged instancing ./scene.glb
```

This scans the scene and generates a report of instancing candidates.

---

# Example Output

```
ThreeForged Instancing Report
-----------------------------

Meshes scanned: 124

Instancing candidates:

tree_oak_01
Instances: 38
Potential draw calls saved: 37

rock_small_02
Instances: 21
Potential draw calls saved: 20

barrel_wood
Instances: 14
Potential draw calls saved: 13
```

---

# Why Instancing Matters

Without instancing:

```
38 trees = 38 draw calls
```

With instancing:

```
38 trees = 1 draw call
```

This significantly improves performance, especially in large environments.

---

# Detection Algorithm

The optimizer detects instancing opportunities by analyzing meshes with identical:

• geometry  
• material  
• vertex attributes  

Meshes that match these conditions can often be converted into instanced meshes.

---

# Additional Checks

The optimizer also verifies that instancing will not break scene behavior.

Checks include:

• mesh transformations  
• unique materials  
• animation usage  

Meshes with unique animation or material variations are excluded.

---

# JSON Output

Machine-readable output can be enabled.

```bash
threeforged instancing scene.glb --json
```

Example:

```json
{
  "candidates": [
    {
      "mesh": "tree_oak_01",
      "instances": 38,
      "drawCallsSaved": 37
    }
  ]
}
```

---

# Programmatic Usage

The optimizer can also be used directly in code.

```javascript
import { detectInstancingCandidates } from "@threeforged/instancing-optimizer"

const report = await detectInstancingCandidates("./scene.glb")

console.log(report)
```

Example output:

```javascript
{
  candidates: [
    {
      mesh: "tree_oak_01",
      instances: 38
    }
  ]
}
```

---

# Optional Auto-Fix

Future versions may support automatically generating instanced meshes.

Example:

```
threeforged instancing scene.glb --apply
```

This would generate a modified scene with instancing applied.

---

# Best Use Cases

Instancing optimization is most useful for scenes containing:

• forests  
• grass fields  
• cities with repeating assets  
• particle-like mesh objects  
• props repeated many times

---

# Integration with Other Plugins

The Instancing Optimizer works well with:

@threeforged/asset-analyzer  
@threeforged/performance-auditor  

Typical workflow:

```
threeforged analyze ./assets
threeforged audit ./scene.glb
threeforged instancing ./scene.glb
```

---

# Future Improvements

Planned improvements include:

• automatic instanced mesh generation  
• GPU memory impact analysis  
• instancing visualization tools  
• scene graph instancing previews  

---

# Goal

The Instancing Optimizer helps developers reduce draw calls and unlock the full performance potential of GPU instancing in Three.js applications.