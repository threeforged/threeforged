# ThreeForged Asset Analyzer

The ThreeForged Asset Analyzer is a tool designed to inspect 3D assets used in Three.js projects and generate detailed reports about their structure, complexity, and potential performance issues.

This tool helps developers identify inefficiencies in models, textures, and materials before they become runtime performance problems.

Package:

@threeforged/asset-analyzer

---

# Purpose

The Asset Analyzer scans models and asset folders to detect common issues such as:

• excessive polygon counts  
• redundant materials  
• large textures  
• duplicate meshes  
• inefficient geometry structures  

The goal is to provide actionable insights that help developers optimize their scenes.

---

# Installation

```bash
npm install @threeforged/asset-analyzer
```

---

# CLI Usage

The Asset Analyzer can be used through the ThreeForged CLI.

```bash
threeforged analyze ./assets
```

This command scans the provided directory and produces a report.

---

# Supported File Types

The analyzer supports common 3D formats used in Three.js workflows:

• .glb  
• .gltf  
• .obj  
• .fbx (limited support)

Additional formats may be supported in future versions.

---

# Output Report

After analyzing assets, the tool outputs a summary report.

Example:

```
ThreeForged Asset Analysis
--------------------------

Assets Scanned: 32

Meshes: 148
Materials: 36
Textures: 54

Largest Mesh: castle_wall (42,380 triangles)
Largest Texture: terrain_diffuse.png (4096x4096)

Warnings:
⚠ Mesh exceeds recommended polycount: castle_wall
⚠ Duplicate material detected: stone_01
⚠ Texture resolution very large: terrain_diffuse.png
```

---

# JSON Output

Machine-readable output can be generated using the `--json` flag.

```bash
threeforged analyze ./assets --json
```

Example JSON:

```json
{
  "assets": 32,
  "meshes": 148,
  "materials": 36,
  "textures": 54,
  "warnings": [
    "High poly mesh: castle_wall",
    "Duplicate material: stone_01"
  ]
}
```

This allows integration with CI pipelines or automated build systems.

---

# What the Analyzer Detects

## Polygon Count

The analyzer calculates triangle counts for each mesh and flags models that exceed recommended thresholds.

Example thresholds:

• small props: < 5k triangles  
• medium objects: < 20k triangles  
• large hero assets: < 100k triangles  

These thresholds may be configurable.

---

## Duplicate Materials

Detects materials that are identical but duplicated across meshes.

This can increase draw calls unnecessarily.

Example warning:

```
Duplicate material detected: metal_01
Used by 6 meshes
```

---

## Texture Analysis

The analyzer inspects texture sizes and formats.

Checks include:

• texture resolution  
• format type  
• estimated GPU memory usage  

Example warning:

```
Texture exceeds recommended size: terrain_diffuse.png (4096x4096)
```

---

## Geometry Complexity

The analyzer inspects geometry structure and flags potential inefficiencies such as:

• extremely dense meshes  
• unindexed geometry  
• unused vertex attributes  

---

# Programmatic Usage

The analyzer can also be used directly in JavaScript.

Example:

```javascript
import { analyzeAssets } from "@threeforged/asset-analyzer"

const report = await analyzeAssets("./assets")

console.log(report)
```

Example output object:

```javascript
{
  meshes: 148,
  materials: 36,
  textures: 54,
  warnings: [...]
}
```

---

# Integration with the CLI

The CLI simply acts as a wrapper around this package.

Example internal usage:

```javascript
import { analyzeAssets } from "@threeforged/asset-analyzer"

const result = await analyzeAssets(path)
printReport(result)
```

---

# Future Improvements

Planned improvements include:

• automatic texture compression suggestions  
• mesh simplification recommendations  
• duplicate mesh detection  
• unused asset detection  
• asset dependency graphs  

---

# Best Use Cases

The Asset Analyzer is most useful when:

• importing large asset libraries  
• optimizing game environments  
• preparing assets for mobile devices  
• auditing performance issues  

---

# Goal

The goal of the Asset Analyzer is to help developers maintain efficient asset pipelines and avoid performance issues caused by poorly optimized models and textures.
```