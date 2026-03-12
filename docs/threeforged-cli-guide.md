# ThreeForged CLI Guide

The ThreeForged CLI is the primary interface for interacting with the ThreeForged tool ecosystem. It provides a unified command-line tool that allows developers to run analysis, optimization, and generation tools for their Three.js projects.

The CLI acts as a **thin orchestration layer** that invokes the underlying plugin packages installed in the project.

---

# Philosophy

The CLI follows several design principles:

• Simple commands  
• Fast execution  
• Composable tooling  
• Plugin-driven architecture  
• Works with any Three.js project  
• No vendor lock-in

The CLI itself does **not implement heavy logic**. Instead, it calls functions from the various `@threeforged/*` packages.

---

# Installation

The CLI can be installed globally or used via `npx`.

## Global Install

```bash
npm install -g @threeforged/cli
```

Usage:

```bash
threeforged <command>
```

## NPX Usage

```bash
npx threeforged <command>
```

This allows running the CLI without a global installation.

---

# CLI Command Structure

The CLI follows a simple structure:

```
threeforged <command> [options]
```

Example:

```bash
threeforged analyze ./assets
```

---

# Core Commands

## Analyze Assets

Analyzes a directory of models and assets for common performance issues.

```bash
threeforged analyze ./assets
```

Powered by:

```
@threeforged/asset-analyzer
```

Outputs:

• polygon counts  
• draw call estimates  
• material usage  
• texture usage  
• mesh complexity reports

---

## Performance Audit

Runs a complete performance audit on a scene or project.

```bash
threeforged audit ./scene.glb
```

Powered by:

```
@threeforged/performance-auditor
```

Outputs:

• estimated draw calls  
• geometry complexity  
• texture memory usage  
• GPU bottlenecks  
• recommended optimizations

---

## Generate LODs

Automatically generates Level of Detail (LOD) meshes.

```bash
threeforged lod ./models/tree.glb
```

Powered by:

```
@threeforged/lod-generator
```

Options:

```
--levels=3
--ratio=0.5
```

Example:

```bash
threeforged lod tree.glb --levels=4 --ratio=0.6
```

---

## Optimize Instancing

Analyzes meshes to detect instancing opportunities.

```bash
threeforged instancing ./scene.glb
```

Powered by:

```
@threeforged/instancing-optimizer
```

Outputs:

• duplicate mesh detection  
• instancing candidates  
• potential draw call reductions

---

## Static Mesh Optimization

Detects static meshes that can be merged.

```bash
threeforged static ./scene.glb
```

Powered by:

```
@threeforged/static-optimizer
```

Outputs:

• merge candidates  
• draw call reductions  
• batching recommendations

---

# CLI Output

The CLI prints readable terminal output.

Example:

```
ThreeForged Asset Report
------------------------

Meshes: 54
Materials: 12
Textures: 18

Estimated Draw Calls: 67

Warnings:
⚠ High poly mesh: castle_wall (42k triangles)
⚠ Duplicate material detected: stone_01
```

Future versions may support additional output formats.

---

# JSON Output

Machine-readable output can be enabled.

```bash
threeforged audit scene.glb --json
```

Example output:

```json
{
  "meshes": 54,
  "materials": 12,
  "textures": 18,
  "estimatedDrawCalls": 67
}
```

This allows integration with CI pipelines.

---

# Configuration File

Projects may define a configuration file.

```
threeforged.config.js
```

Example:

```javascript
export default {
  lod: {
    levels: 3,
    ratio: 0.5
  },

  audit: {
    warnPolyCount: 20000
  }
}
```

The CLI automatically loads this configuration if present.

---

# CLI Plugin System

The CLI is designed to load plugins dynamically.

Each plugin registers commands.

Example internal architecture:

```
packages/
  cli/
  asset-analyzer/
  lod-generator/
  instancing-optimizer/
```

Each plugin exposes a function such as:

```ts
export function registerCLI(program)
```

The CLI loads all installed plugins and registers commands automatically.

---

# Development Workflow

Clone the repository:

```bash
git clone https://github.com/threeforged/threeforged
```

Install dependencies:

```bash
pnpm install
```

Run CLI locally:

```bash
pnpm dev
```

Test commands:

```bash
pnpm cli analyze ./examples/assets
```

---

# Debug Mode

Enable verbose debugging:

```bash
threeforged analyze ./assets --debug
```

This prints internal processing steps.

---

# Future Features

Planned CLI improvements:

• interactive CLI mode  
• automatic project scanning  
• performance score grading  
• visual HTML reports  
• automatic asset fixing  
• scene graph visualization

---

# Example Workflow

A typical workflow might look like this:

Analyze project assets:

```bash
threeforged analyze ./assets
```

Audit a scene:

```bash
threeforged audit ./scene.glb
```

Generate LOD meshes:

```bash
threeforged lod ./models
```

Optimize draw calls:

```bash
threeforged instancing ./scene.glb
```

This creates a complete optimization pipeline.

---

# Goal

The ThreeForged CLI aims to become the **standard command-line toolkit for optimizing Three.js projects**.

It provides powerful tools while remaining lightweight and modular.