# ThreeForged Implementation Roadmap

This document outlines the development roadmap for the ThreeForged toolkit. The goal is to build a robust, open-source ecosystem of optimization tools for Three.js developers.

ThreeForged will be developed as a **monorepo** containing multiple packages under the `@threeforged/*` namespace.

All tools are **free and open source** under the MIT license.

---

# Project Goals

ThreeForged aims to become a standard toolkit for optimizing Three.js scenes and asset pipelines.

Core goals:

• Improve performance of Three.js projects  
• Provide developer-friendly tooling  
• Automate common optimization tasks  
• Integrate easily into existing workflows  
• Remain modular and extensible  

---

# Core Packages

The initial release of ThreeForged will include the following packages:

@threeforged/cli  
@threeforged/asset-analyzer  
@threeforged/performance-auditor  
@threeforged/lod-generator  
@threeforged/instancing-optimizer  
@threeforged/static-optimizer  

These packages will form the foundation of the ecosystem.

---

# Phase 1 — Project Foundation

Goals:

• Create GitHub organization  
• Initialize monorepo  
• Configure workspace tooling  
• Setup CLI scaffolding  

Tasks:

Initialize repository:

```
threeforged/
```

Create workspace configuration:

```
pnpm-workspace.yaml
```

Create packages folder:

```
packages/
  cli/
  asset-analyzer/
  performance-auditor/
  lod-generator/
  instancing-optimizer/
  static-optimizer/
```

Setup TypeScript base configuration:

```
tsconfig.base.json
```

Setup linting and formatting:

• ESLint  
• Prettier  

Setup testing framework:

• Vitest or Jest  

---

# Phase 2 — CLI Development

Goals:

Build the ThreeForged CLI as the primary interface for all tools.

Features:

• command parsing  
• plugin registration  
• consistent output formatting  
• JSON export support  

Example commands:

```
threeforged analyze
threeforged audit
threeforged lod
threeforged instancing
threeforged static
```

CLI responsibilities:

• parse commands  
• invoke package functions  
• display reports  

The CLI will remain lightweight and depend on plugin packages.

---

# Phase 3 — Asset Analyzer

Goals:

Implement the asset analysis engine.

Features:

• mesh statistics  
• texture analysis  
• material inspection  
• duplicate detection  

Output:

• human-readable reports  
• JSON reports  

This tool becomes the foundation for scene diagnostics.

---

# Phase 4 — Performance Auditor

Goals:

Create a high-level performance diagnostic tool.

Features:

• draw call estimation  
• triangle count analysis  
• texture memory estimation  
• scene complexity reporting  

This tool will provide recommendations for further optimization.

---

# Phase 5 — Instancing Optimizer

Goals:

Detect repeated meshes that can use GPU instancing.

Features:

• duplicate mesh detection  
• instancing opportunity reports  
• estimated draw call reductions  

Future features:

• automatic instanced mesh generation.

---

# Phase 6 — Static Optimizer

Goals:

Detect meshes that can be merged into static batches.

Features:

• static mesh grouping  
• merge candidate reports  
• draw call reduction estimates  

Future features:

• automatic mesh merging.

---

# Phase 7 — LOD Generator

Goals:

Automatically generate simplified meshes for distant rendering.

Features:

• mesh simplification  
• configurable LOD levels  
• triangle reduction ratios  

Future features:

• automatic scene integration.

---

# Phase 8 — Documentation

Goals:

Provide clear documentation for developers.

Documentation sections:

• installation guides  
• CLI reference  
• API reference  
• optimization tutorials  

Example guides:

• optimizing large environments  
• reducing draw calls in Three.js  
• preparing assets for mobile

---

# Phase 9 — Developer Experience

Goals:

Improve developer workflow and usability.

Potential improvements:

• configuration file support  
• project scanning  
• performance score reports  
• HTML visualization reports  

---

# Phase 10 — Ecosystem Expansion

After the core tools are stable, new plugins can be added.

Potential plugins:

@threeforged/texture-atlas-generator  
@threeforged/lightmap-baker  
@threeforged/navmesh-generator  
@threeforged/scene-visualizer  

These tools will expand the capabilities of the ThreeForged ecosystem.

---

# Community Contributions

ThreeForged is open source and welcomes contributions from the community.

Developers can contribute:

• new plugins  
• bug fixes  
• performance improvements  
• documentation  

Contribution guidelines will be provided in the repository.

---

# Release Strategy

Versioning will follow semantic versioning:

MAJOR.MINOR.PATCH

Example:

```
1.0.0
```

Initial releases may start at:

```
0.1.0
```

until the API stabilizes.

---

# Long-Term Vision

The long-term vision for ThreeForged is to become the go-to optimization toolkit for Three.js development.

Key outcomes:

• faster WebGL applications  
• improved developer workflows  
• automated optimization pipelines  
• a thriving open-source ecosystem