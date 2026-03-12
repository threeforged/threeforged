# ThreeForged Implementation Roadmap (v2)

## Overview

This document outlines the development roadmap for the ThreeForged toolkit.

ThreeForged is designed to become the **performance toolkit for Three.js and HYTOPIA games**, providing automated analysis, optimization, and diagnostics for 3D projects.

Core philosophy:

1. Start with **diagnostic tools developers will run immediately**
2. Expand into **automated optimization tools**
3. Build a **complete performance pipeline**

The development order is extremely important. Tools should be built in the order that developers naturally use them.

---

# Current Tool Suite

The ThreeForged CLI currently includes the following commands:

threeforged analyze  
threeforged optimize  
threeforged generate-lod  
threeforged instance  
threeforged audit  

Each tool targets a specific performance issue in Three.js projects.

---

# Development Phases

The toolkit should be built in the following phases.

---

# Phase 1 — Core CLI + Asset Analyzer

This phase establishes the foundation of the ecosystem.

Primary goals:

- working CLI
- asset scanning
- project-wide analysis
- developer adoption

The analyzer acts as the **entry point to the ecosystem**.

---

## Tool 1: Asset Analyzer

Command:

threeforged analyze <path>

### Purpose

Scan assets or entire projects and report performance metrics.

This tool reveals the problems that the rest of the toolkit will solve.

---

### Features (MVP)

Scan:

- .glb
- .gltf

Report:

- mesh count
- triangle count
- material count
- texture count
- estimated draw calls

Detect:

- repeated meshes
- high triangle assets
- large textures
- static mesh candidates
- LOD candidates
- instancing candidates

---

### Example Output

ThreeForged Analysis Report

Meshes: 2,948  
Triangles: 1,920,320  
Materials: 181  
Textures: 94  
Draw Calls: 2,412  

Optimization Opportunities:

Static batching recommended  
LOD recommended for 38 assets  
Instancing recommended for 412 meshes  

---

### Technical Dependencies

- glTF-Transform
- Three.js GLTFLoader
- Node.js filesystem scanning

---

### Estimated Development Difficulty

LOW

Estimated build time:

1–2 weeks

---

# Phase 2 — Static Optimizer

Command:

threeforged optimize <path>

### Purpose

Reduce draw calls by merging compatible static meshes.

Draw calls are one of the most common performance bottlenecks in Three.js scenes.

---

### Features (MVP)

- static mesh detection
- transform baking
- mesh merging
- material grouping

Optional features:

- texture atlasing
- duplicate material cleanup

---

### Example Output

Optimizing assets...

castle.glb  
Draw Calls: 42 → 6

trees.glb  
Draw Calls: 210 → 1

---

### Technical Dependencies

- glTF-Transform
- meshoptimizer
- geometry utilities

---

### Estimated Development Difficulty

MEDIUM

Estimated build time:

3–5 weeks

---

# Phase 3 — Instancing Optimizer

Command:

threeforged instance <path>

### Purpose

Detect repeated meshes and convert them into GPU instanced rendering groups.

This dramatically reduces draw calls in environments with repeated assets.

---

### Example

Before:

Tree_01 repeated 412 times  
Draw Calls: 412

After:

Tree_01 instanced  
Draw Calls: 1

---

### Features (MVP)

- repeated mesh detection
- instancing candidate identification
- instanced group generation
- instancing performance report

---

### Technical Dependencies

- glTF-Transform
- meshoptimizer
- Three.js instancing support

---

### Estimated Development Difficulty

MEDIUM

Estimated build time:

2–4 weeks

---

# Phase 4 — LOD Generator

Command:

threeforged generate-lod <path>

### Purpose

Automatically generate simplified versions of models for distance rendering.

LOD reduces triangle count for distant objects and improves rendering scalability.

---

### Features (MVP)

Generate:

LOD0  
LOD1  
LOD2  

Triangle reduction:

Balanced profile:

LOD1 → 50%  
LOD2 → 20%

---

### Example Output

castle.glb

LOD0: 48,200 triangles  
LOD1: 22,910 triangles  
LOD2: 8,440 triangles  

---

### Technical Dependencies

- meshoptimizer
- glTF-Transform simplify()
- quadric error simplification

---

### Estimated Development Difficulty

MEDIUM

Estimated build time:

2–4 weeks

---

# Phase 5 — Performance Auditor

Command:

threeforged audit <path>

### Purpose

Perform a project-wide performance diagnosis and recommend optimization actions.

This tool acts as the **decision engine** of the ThreeForged ecosystem.

Instead of reporting raw metrics, it answers:

- What is slowing my scene down?
- Which issues matter most?
- What should I fix first?

---

### Features (MVP)

- project-wide analysis
- performance scoring
- bottleneck detection
- prioritized optimization recommendations
- JSON and terminal reports

---

### Example Output

ThreeForged Performance Audit

Project Score: 64 / 100  
Performance Risk: High

Top Issues:

- excessive draw calls
- missing LODs
- repeated meshes not instanced
- large textures detected

Recommended Actions:

1. Run threeforged optimize ./assets  
2. Run threeforged instance ./assets  
3. Run threeforged generate-lod ./assets/models  

---

### Technical Dependencies

- analyzer metrics
- scoring system
- recommendation engine

---

### Estimated Development Difficulty

MEDIUM

Estimated build time:

3–4 weeks

---

# Phase 6 — Texture Optimizer (Future)

Command:

threeforged texture-optimize <path>

### Purpose

Reduce GPU memory usage through texture optimization.

Features:

- texture resizing
- KTX2 compression
- duplicate texture detection
- mipmap optimization

Estimated difficulty:

MEDIUM

---

# Recommended Development Order

Tools should be built in this order:

1️⃣ Asset Analyzer  
2️⃣ Static Optimizer  
3️⃣ Instancing Optimizer  
4️⃣ LOD Generator  
5️⃣ Performance Auditor  
6️⃣ Texture Optimizer  

This sequence reflects the real optimization workflow developers follow.

---

# Typical Developer Workflow

A typical optimization workflow might look like:

threeforged analyze .

↓

threeforged optimize .

↓

threeforged instance .

↓

threeforged generate-lod .

↓

threeforged audit .

This pipeline makes optimization systematic and repeatable.

---

# Launch Strategy

## Step 1 — Open Source Analyzer

Release:

threeforged analyze

Free.

Goal:

- widespread adoption
- organic discovery
- developer trust

---

## Step 2 — Release Optimization Tools

Offer:

threeforged optimize  
threeforged instance  
threeforged generate-lod  

These tools automate the fixes recommended by the analyzer.

---

## Step 3 — Release Performance Auditor

Offer:

threeforged audit

This tool becomes the orchestration layer for the ecosystem.

---

# Growth Strategy

The Analyzer acts as the entry point.

Developer runs:

threeforged analyze .

Analyzer identifies:

- high draw calls
- repeated meshes
- missing LODs

Developer then runs:

threeforged optimize  
threeforged instance  
threeforged generate-lod  

This creates a natural upgrade path.

---

# Long-Term Vision

ThreeForged becomes the **standard optimization toolkit for Three.js projects**.

Tool suite:

threeforged analyze  
threeforged optimize  
threeforged generate-lod  
threeforged instance  
threeforged audit  
threeforged texture-optimize  

Equivalent to:

Unity Performance Tools  
Unreal Optimization Tools  

But for **Three.js and web-based games**.

---

# Key Principle

Focus on tools that:

- save developers time
- automate tedious optimization tasks
- improve runtime performance

Developer tools succeed when they eliminate painful manual work.

---

# Final Goal

ThreeForged becomes:

"The performance toolkit for Three.js games."