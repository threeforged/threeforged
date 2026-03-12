# ThreeForged Static Optimizer

## Overview

ThreeForged Static Optimizer is a build-time optimization tool that reduces draw calls in Three.js scenes by merging compatible static meshes.

It performs:

- mesh batching
- transform baking
- material grouping
- optional texture atlasing

This dramatically improves rendering performance.

---

## CLI Usage

Optimize a single asset:

threeforged optimize castle.glb

Optimize a folder:

threeforged optimize ./assets/models

Optimize an entire project:

threeforged optimize .

---

## Example Output

Optimizing assets...

castle.glb  
Draw Calls: 42 → 6

town_house.glb  
Draw Calls: 18 → 3

trees.glb  
Draw Calls: 210 → 1

Total draw calls reduced by 78%

---

## What It Optimizes

### Static Mesh Batching

Static meshes sharing the same material are merged.

---

### Transform Baking

Object transforms are baked directly into geometry.

This eliminates runtime transform updates.

---

### Material Grouping

Meshes with compatible materials are grouped.

---

### Optional Texture Atlasing

Textures can be packed into atlases to enable larger mesh merges.

---

## Ideal Use Cases

- towns
- forests
- voxel-style worlds
- decorative environments
- static props

---

## Technical Stack

- Node.js
- TypeScript
- glTF-Transform
- Three.js
- Sharp (for texture atlases)

---

## Relationship to Analyzer

The Analyzer detects optimization opportunities.

Example workflow:

threeforged analyze .

Then run:

threeforged optimize ./assets

---

## Future Features

- automatic atlas generation
- batch project optimization
- CI pipeline integration