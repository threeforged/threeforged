# ThreeForged Static Optimizer

The ThreeForged Static Optimizer identifies meshes in a scene that can be merged into static batches to reduce draw calls and improve rendering performance.

Package:

@threeforged/static-optimizer

---

# Purpose

Many Three.js scenes contain objects that never move, rotate, or scale during runtime.

Examples include:

• buildings  
• terrain  
• environment props  
• architecture  
• static decorations  

These objects can often be **merged into a single mesh** to reduce draw calls.

The Static Optimizer detects these opportunities and reports them.

---

# Installation

```bash
npm install @threeforged/static-optimizer
```

---

# CLI Usage

Run the optimizer through the ThreeForged CLI.

```bash
threeforged static ./scene.glb
```

This analyzes the scene and identifies static mesh merge candidates.

---

# Example Output

```
ThreeForged Static Optimization Report
--------------------------------------

Meshes scanned: 212

Static mesh groups detected:

Village Houses
Meshes: 12
Potential draw calls saved: 11

Stone Wall Segments
Meshes: 34
Potential draw calls saved: 33

Market Props
Meshes: 9
Potential draw calls saved: 8
```

---

# Why Static Mesh Merging Matters

Without merging:

```
12 houses = 12 draw calls
```

With static batching:

```
12 houses = 1 draw call
```

This can significantly reduce GPU overhead.

---

# Detection Algorithm

The optimizer scans the scene graph and groups meshes that meet the following conditions:

• mesh is static  
• no animations  
• identical or compatible materials  
• compatible geometry attributes  

These meshes can potentially be merged.

---

# Material Compatibility

Meshes can only be merged if they use compatible materials.

The optimizer checks for:

• identical shader type  
• identical textures  
• compatible render states  

If materials differ, merging may not be possible.

---

# JSON Output

Machine-readable output can be generated.

```bash
threeforged static scene.glb --json
```

Example:

```json
{
  "groups": [
    {
      "name": "Village Houses",
      "meshes": 12,
      "drawCallsSaved": 11
    }
  ]
}
```

---

# Programmatic Usage

The optimizer can also be used in code.

```javascript
import { detectStaticMergeCandidates } from "@threeforged/static-optimizer"

const report = await detectStaticMergeCandidates("./scene.glb")

console.log(report)
```

Example output:

```javascript
{
  groups: [
    {
      name: "Village Houses",
      meshes: 12
    }
  ]
}
```

---

# Optional Auto-Merge

Future versions may support automatically merging static meshes.

Example:

```
threeforged static scene.glb --apply
```

This would generate a merged version of the scene.

---

# Best Use Cases

Static mesh merging is most effective for:

• architecture  
• terrain segments  
• environment props  
• decorative scene elements  

---

# Integration with Other Plugins

Static optimization works well alongside:

@threeforged/instancing-optimizer  
@threeforged/performance-auditor  

Example workflow:

```
threeforged analyze ./assets
threeforged audit ./scene.glb
threeforged static ./scene.glb
threeforged instancing ./scene.glb
```

---

# Future Improvements

Planned improvements include:

• automatic mesh merging tools  
• draw call visualization  
• scene graph merge previews  
• GPU memory usage estimates  

---

# Goal

The Static Optimizer helps developers identify opportunities to merge static geometry and reduce draw calls in complex Three.js scenes.