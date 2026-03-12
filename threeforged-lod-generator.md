# ThreeForged LOD Generator

## Overview

ThreeForged LOD Generator automatically creates simplified versions of models to reduce rendering cost at distance.

LOD (Level of Detail) reduces triangle count for distant objects.

This dramatically improves performance in large scenes.

---

## CLI Usage

Generate LODs for a model:

threeforged generate-lod castle.glb

Generate LODs for a folder:

threeforged generate-lod ./assets/models

Generate LODs for entire project:

threeforged generate-lod .

---

## Output Example

castle.glb

Generated:

castle_LOD0.glb  
castle_LOD1.glb  
castle_LOD2.glb  

---

## Simplification Profiles

Profiles control mesh reduction.

Conservative

LOD0 → 100%  
LOD1 → 70%  
LOD2 → 40%

Balanced

LOD0 → 100%  
LOD1 → 50%  
LOD2 → 20%

Aggressive

LOD0 → 100%  
LOD1 → 35%  
LOD2 → 10%

---

## Runtime Switching

LOD switching example:

0–20m → LOD0  
20–60m → LOD1  
60m+ → LOD2

---

## Example Report

LOD Generation Report

Asset: castle.glb

Original triangles: 48,200  
LOD1 triangles: 22,910  
LOD2 triangles: 8,440  

---

## Ideal Use Cases

- large worlds
- towns
- forests
- distant landmarks
- repeated environment assets

---

## Technical Stack

- Node.js
- TypeScript
- glTF-Transform
- meshoptimizer
- Three.js LOD system

---

## Relationship to Analyzer

Analyzer detects LOD opportunities:

threeforged analyze .

Then developers run:

threeforged generate-lod ./assets/models