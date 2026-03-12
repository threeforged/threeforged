# ThreeForged Repository Structure (v3)

## Overview

ThreeForged is structured as a modular monorepo containing the CLI and all optimization tools.

This architecture allows:

- shared utilities
- modular tool development
- scalable product growth
- consistent CLI integration

---

# Repository Layout

threeforged/

packages/
  cli/
  analyzer/
  optimizer/
  lod-generator/
  instancing/
  auditor/
  shared/

examples/
  demo-scene/
  benchmark-project/

docs/
  threeforged-cli-guide.md
  threeforged-asset-analyzer.md
  threeforged-static-optimizer.md
  threeforged-lod-generator.md
  threeforged-instancing-optimizer.md
  threeforged-performance-auditor.md

package.json
pnpm-workspace.yaml
tsconfig.base.json
README.md

---

# Package Breakdown

## CLI Core

Location:

packages/cli

Purpose:

- main CLI interface
- command routing
- plugin loading
- configuration handling

Structure:

packages/cli/

src/
  cli.ts
  commands/
    analyze.ts
    optimize.ts
    generate-lod.ts
    instance.ts
    audit.ts

package.json

---

## Analyzer

Location:

packages/analyzer

Purpose:

- scene and asset analysis
- metric generation
- performance reporting

Structure:

packages/analyzer/

src/
  analyzeScene.ts
  metrics/
    meshMetrics.ts
    materialMetrics.ts
    textureMetrics.ts
    drawCallEstimator.ts

---

## Static Optimizer

Location:

packages/optimizer

Purpose:

- static mesh batching
- transform baking
- material grouping
- optional texture atlasing

Structure:

packages/optimizer/

src/
  optimizeScene.ts
  batching/
    meshBatcher.ts
  atlas/
    textureAtlas.ts

---

## LOD Generator

Location:

packages/lod-generator

Purpose:

- mesh simplification
- automatic LOD generation

Structure:

packages/lod-generator/

src/
  generateLOD.ts
  simplification/
    meshSimplifier.ts
  manifest/
    lodManifest.ts

---

## Instancing Optimizer

Location:

packages/instancing

Purpose:

- detect repeated meshes
- convert repeated assets into instanced rendering groups

Structure:

packages/instancing/

src/
  optimizeInstancing.ts
  detect/
    findRepeatedMeshes.ts
  transform/
    buildInstancedGroups.ts
  report/
    generateInstancingReport.ts

---

## Performance Auditor

Location:

packages/auditor

Purpose:

- project-wide diagnostics
- performance scoring
- bottleneck detection
- optimization recommendations

Structure:

packages/auditor/

src/
  auditProject.ts
  scoring/
    scoreProject.ts
  recommendations/
    generateRecommendations.ts
  report/
    generateAuditReport.ts

---

## Shared Utilities

Location:

packages/shared

Purpose:

Utilities shared across all packages.

Examples:

- filesystem scanning
- config loading
- logging
- report formatting
- asset path resolution

Structure:

packages/shared/

src/
  scanAssets.ts
  logger.ts
  config.ts
  reportFormatter.ts

---

# CLI Execution Flow

Example command:

threeforged analyze .

Execution pipeline:

CLI receives command  
↓  
Resolve path  
↓  
Scan project assets  
↓  
Send assets to analyzer package  
↓  
Compute metrics  
↓  
Print report

---

# Workspace Configuration

Recommended package manager:

pnpm

pnpm-workspace.yaml

packages:
  - packages/*

Advantages:

- shared dependencies
- faster installs
- easier local development

---

# Development Workflow

Clone repository:

git clone https://github.com/threeforged/threeforged

Install dependencies:

pnpm install

Run CLI locally:

pnpm dev

Test commands:

pnpm cli analyze ./examples/demo-scene

---

# Example Usage

Analyze project:

threeforged analyze .

Optimize scene:

threeforged optimize ./assets

Generate LODs:

threeforged generate-lod ./assets/models

Instance repeated meshes:

threeforged instance ./assets

Audit project performance:

threeforged audit .

---

# Future Expansion

Potential future packages:

packages/texture-optimizer  
packages/atlas-generator  
packages/scene-profiler  

Future commands:

threeforged texture-optimize  
threeforged atlas  
threeforged profile  

---

# Long-Term Vision

ThreeForged becomes the **complete optimization toolkit for Three.js games**.

Tool suite:

threeforged analyze  
threeforged optimize  
threeforged generate-lod  
threeforged instance  
threeforged audit  

Future additions will expand the platform into a full performance pipeline.