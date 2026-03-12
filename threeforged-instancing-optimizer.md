# ThreeForged Instancing Optimizer

## Overview

ThreeForged Instancing Optimizer is a build-time optimization tool for Three.js and HYTOPIA projects that detects repeated meshes and converts them into GPU-instanced rendering structures.

Its purpose is to drastically reduce draw calls for repeated objects such as:

- trees
- rocks
- crates
- fences
- lamps
- environment props
- repeated decorative assets

This tool is designed to solve one of the most common and painful performance issues in browser-based 3D games: rendering many copies of the same mesh inefficiently.

---

## Core Problem

Many Three.js scenes contain hundreds or thousands of repeated meshes.

Examples:

- 400 identical trees
- 200 rocks
- 120 barrels
- 80 lanterns

If these are rendered as separate meshes, the project may suffer from:

- excessive draw calls
- high CPU overhead
- unnecessary transform updates
- poor scene scalability

Even though the geometry is repeated, many developers do not convert these objects into instanced rendering structures manually.

ThreeForged Instancing Optimizer automates that process.

---

## What This Tool Does

The Instancing Optimizer scans assets or scenes and:

1. detects repeated compatible meshes
2. groups identical or equivalent geometry
3. verifies material compatibility
4. replaces repeated objects with an instanced representation
5. outputs optimized assets and a performance report

---

## Why Instancing Matters

Instancing allows the GPU to draw many copies of the same mesh in a much more efficient way.

Example:

Before optimization:

- Tree_01 repeated 412 times
- Draw calls: 412

After instancing:

- Tree_01 rendered as one instanced group
- Draw calls: 1

This can produce dramatic FPS improvements in large scenes.

---

## CLI Usage

Optimize a single asset:

threeforged instance tree_cluster.glb

Optimize a folder:

threeforged instance ./assets/models

Optimize an entire project:

threeforged instance .

---

## Example Output

ThreeForged Instancing Report

Tree_01  
Instances detected: 412  
Draw Calls: 412 → 1

Rock_02  
Instances detected: 128  
Draw Calls: 128 → 1

Crate_01  
Instances detected: 96  
Draw Calls: 96 → 1

Total estimated draw calls reduced: 636

---

## Ideal Use Cases

This tool is best for scenes with many repeated static or semi-static assets.

Examples:

- forests
- towns
- dungeons
- voxel environments
- world decoration kits
- repeated modular structures
- tile-based environments

---

## MVP Goals

The MVP should do five things well:

1. detect repeated meshes reliably
2. confirm they are safe to instance
3. group them correctly
4. output an optimized representation
5. generate a clear report

If those five things work reliably, the tool is already highly valuable.

---

## What Counts as an Instancing Candidate

A mesh should be considered a candidate when:

- geometry is identical or equivalent
- material is identical or compatible
- mesh is repeated multiple times
- no unique skeleton is attached
- no unique per-instance deformation is required

Optional user rules may allow looser matching later.

---

## Unsafe Cases to Exclude

The optimizer should avoid instancing objects that are likely to break gameplay or rendering expectations.

Exclude by default:

- skinned meshes
- animated characters
- objects with unique materials
- meshes requiring individual visibility logic
- objects with unique interactions
- special shader-driven objects
- meshes with per-object unique data not supported by instancing

---

## Detection Strategy

The optimizer should identify repeated objects by comparing:

- geometry identity
- geometry hash
- material identity
- material hash
- mesh name patterns
- scene metadata

The initial MVP can start conservatively:

- exact geometry match
- exact material match

Later versions can support fuzzy matching or deduplication.

---

## Optimization Pipeline

Input model or project path

↓ scan assets

Find repeated compatible meshes

↓ validate safety

Group by shared geometry + material

↓ generate instancing plan

Replace repeated mesh sets with instanced representation

↓ output optimized scene / report

---

## Output Types

The tool should output:

- optimized asset files
- instancing metadata
- terminal report
- optional JSON report

Possible output examples:

forest.instanced.glb  
instancing-report.json  
instancing-report.txt

---

## Example JSON Output

{
  "assetsScanned": 48,
  "instancingCandidates": 12,
  "totalInstancesDetected": 884,
  "estimatedDrawCallsBefore": 922,
  "estimatedDrawCallsAfter": 38,
  "topCandidates": [
    {
      "name": "Tree_01",
      "instances": 412,
      "drawCallsBefore": 412,
      "drawCallsAfter": 1
    }
  ]
}

---

## CLI Options

Basic usage:

threeforged instance ./assets

Output JSON:

threeforged instance ./assets --report json

Specify output folder:

threeforged instance ./assets --out ./dist/instanced

Recursive scan:

threeforged instance . --recursive

---

## Relationship to Analyzer

Analyzer detects repeated mesh opportunities first.

Example workflow:

threeforged analyze .

Analyzer reports:

- repeated meshes detected
- instancing opportunities found

Then developer runs:

threeforged instance ./assets

This makes the instancing tool a natural paid follow-up to the free analyzer.

---

## Technical Stack

Recommended stack:

- Node.js
- TypeScript
- glTF-Transform
- Three.js
- meshoptimizer
- commander
- zod

---

## Recommended Repository Location

packages/instancing

Suggested structure:

packages/instancing/

src/
  optimizeInstancing.ts
  detect/
    findRepeatedMeshes.ts
    hashGeometry.ts
    hashMaterial.ts
  transform/
    buildInstancedGroups.ts
  report/
    generateInstancingReport.ts

package.json

---

## MVP Build Phases

### Phase 1 — Candidate Detection

Build:

- repeated mesh detection
- grouping logic
- terminal report
- JSON report

Deliverable:

Analyzer-style report for instancing opportunities.

---

### Phase 2 — Instanced Output

Build:

- actual grouping replacement
- output optimized files
- before/after estimates

Deliverable:

First working instancing optimizer.

---

### Phase 3 — Safer Exclusions

Add:

- metadata rules
- exclusion flags
- unsafe case detection
- better logging

---

### Phase 4 — Advanced Matching

Add later:

- fuzzy duplicate detection
- material compatibility rules
- deduplication of nearly identical meshes

---

## Pricing Positioning

This is a strong paid product because:

- the performance gains are easy to explain
- the results are dramatic
- manual instancing setup is tedious
- many Three.js developers do not know how to do this properly

Suggested pricing:

- Indie: $39
- Studio: $99

Bundled pricing with other tools:

- ThreeForged Performance Bundle

Includes:

- Static Optimizer
- LOD Generator
- Instancing Optimizer

---

## Positioning Statement

ThreeForged Instancing Optimizer is a build-time optimization tool for Three.js and HYTOPIA projects that detects repeated meshes, converts them into instanced rendering structures, and drastically reduces draw calls in large scenes.