# ThreeForged Performance Auditor

The ThreeForged Performance Auditor performs a full performance inspection of a Three.js scene and generates a detailed report identifying potential bottlenecks and optimization opportunities.

Package:

@threeforged/performance-auditor

---

# Purpose

Real-time 3D scenes can suffer from performance issues caused by excessive geometry, too many draw calls, large textures, or inefficient materials.

The Performance Auditor analyzes scenes and provides a high-level overview of performance characteristics along with recommendations for improvement.

It acts as a **diagnostic tool** for developers who want to understand why their scenes may be slow.

---

# Installation

```bash
npm install @threeforged/performance-auditor
```

---

# CLI Usage

Run the auditor through the ThreeForged CLI.

```bash
threeforged audit ./scene.glb
```

This scans the scene and generates a performance report.

---

# Example Output

```
ThreeForged Performance Audit
-----------------------------

Scene Summary

Meshes: 84
Materials: 22
Textures: 31

Estimated Draw Calls: 96
Total Triangles: 1,284,000

Warnings:

⚠ High triangle count detected
⚠ Large texture memory usage
⚠ Potential instancing opportunities
⚠ Multiple duplicate materials
```

---

# What the Auditor Measures

The Performance Auditor analyzes several important metrics.

## Draw Calls

Draw calls represent how many separate rendering commands are sent to the GPU.

High draw call counts can reduce performance significantly.

Example threshold guidelines:

• mobile: < 100 draw calls  
• desktop: < 300 draw calls  
• high-end desktop: < 1000 draw calls  

---

## Triangle Count

The auditor calculates the total triangle count in the scene.

Example recommendations:

• mobile: < 500k triangles  
• desktop: < 2 million triangles  

These numbers vary depending on hardware and scene complexity.

---

## Texture Memory

Textures can consume large amounts of GPU memory.

The auditor calculates estimated VRAM usage.

Example warning:

```
Texture memory usage: 512MB
Recommended maximum: 256MB
```

---

## Material Count

Many unique materials increase draw calls.

The auditor detects duplicate or redundant materials that could potentially be merged.

---

## Geometry Complexity

The auditor inspects meshes for:

• extremely dense geometry  
• unindexed geometry  
• inefficient vertex layouts  

---

# JSON Output

Machine-readable output can be generated.

```bash
threeforged audit scene.glb --json
```

Example:

```json
{
  "meshes": 84,
  "materials": 22,
  "textures": 31,
  "drawCalls": 96,
  "triangles": 1284000,
  "warnings": [
    "High triangle count",
    "Large texture memory usage"
  ]
}
```

This allows integration with CI pipelines or automated build systems.

---

# Programmatic Usage

The Performance Auditor can also be used directly in code.

```javascript
import { auditScene } from "@threeforged/performance-auditor"

const report = await auditScene("./scene.glb")

console.log(report)
```

Example output:

```javascript
{
  meshes: 84,
  drawCalls: 96,
  triangles: 1284000,
  warnings: []
}
```

---

# Integration with Other Plugins

The Performance Auditor works best alongside other ThreeForged tools.

Example workflow:

```
threeforged analyze ./assets
threeforged audit ./scene.glb
threeforged instancing ./scene.glb
threeforged static ./scene.glb
threeforged lod ./models
```

The auditor identifies problems, and the other tools help fix them.

---

# Future Improvements

Planned improvements include:

• performance scoring system  
• GPU memory estimation improvements  
• HTML performance reports  
• scene graph visualization  
• automatic optimization suggestions  

---

# Best Use Cases

The Performance Auditor is useful when:

• debugging slow scenes  
• preparing projects for mobile deployment  
• optimizing WebGL applications  
• auditing third-party asset libraries  

---

# Goal

The Performance Auditor helps developers understand the performance characteristics of their Three.js scenes and provides guidance on how to improve rendering efficiency.