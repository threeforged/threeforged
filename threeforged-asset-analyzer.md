# ThreeForged Asset Analyzer

## Overview

ThreeForged Asset Analyzer is a CLI performance profiler for Three.js and HYTOPIA assets.

It scans scenes and models to identify performance bottlenecks including:

- excessive meshes
- high triangle counts
- large textures
- too many materials
- instancing opportunities
- missing LODs

This tool acts as the **entry point to the ThreeForged ecosystem**.

---

## Why This Tool Exists

Many developers struggle to understand why their Three.js scenes perform poorly.

Common causes:

- thousands of meshes
- large geometry counts
- excessive draw calls
- large texture memory usage

ThreeForged Analyzer identifies these problems instantly.

---

## CLI Usage

Analyze a single model:

threeforged analyze castle.glb

Analyze a folder:

threeforged analyze ./assets/models

Analyze an entire project:

threeforged analyze .

---

## Example Output

ThreeForged Scene Analysis Report

Meshes: 2,948  
Triangles: 1,920,320  
Materials: 181  
Textures: 94  
Estimated Draw Calls: 2,412  

Optimization opportunities:

Static batching recommended for 2,301 meshes  
GPU instancing recommended for 412 meshes  
LOD generation recommended for 38 assets  

---

## Supported File Types

Initial MVP:

.glb  
.gltf

Future support:

.fbx  
.obj  

---

## Metrics Reported

### Mesh Count

Total meshes detected in scene.

High mesh counts cause CPU overhead.

---

### Triangle Count

Total geometry complexity.

Example:

Largest mesh: castle_tower.glb (128k triangles)

---

### Material Count

High material counts prevent batching.

Analyzer highlights duplicate materials.

---

### Texture Analysis

Reports:

- texture resolution
- memory usage
- duplicate textures

Example:

terrain_diffuse.png (4096x4096)

---

### Instancing Opportunities

Repeated meshes are detected.

Example:

Tree_01 repeated 210 times  
Recommendation: GPU instancing

---

### Static Mesh Detection

Objects that never move can be merged.

Example:

Static meshes detected: 2,301

---

### LOD Candidates

Large distant objects are flagged for LOD generation.

Example:

castle.glb  
windmill.glb  
town_house.glb

---

## CLI Options

Generate JSON report:

threeforged analyze . --report json

Output both terminal and JSON:

threeforged analyze . --report both

---

## Example JSON Output

{
 "meshes": 2948,
 "triangles": 1920320,
 "materials": 181,
 "textures": 94,
 "drawCalls": 2412,
 "staticMeshes": 2301,
 "instancingCandidates": 412,
 "lodCandidates": 38
}

---

## Why This Tool Is Free

The Analyzer is designed to spread widely.

Developers discover problems using:

threeforged analyze .

Then upgrade to optimization tools:

threeforged optimize  
threeforged generate-lod

This creates a natural product funnel.

---

## Future Features

- scene heatmaps
- optimization previews
- texture compression suggestions
- CI integration