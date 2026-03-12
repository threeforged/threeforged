# ThreeForged Monorepo Architecture

ThreeForged is an open-source toolkit for optimizing Three.js projects.

The project is organized as a **monorepo** containing multiple independent npm packages that can be installed individually.

Each plugin performs a specific optimization or analysis task.

---

# Core Principles

• Fully open source  
• MIT licensed  
• Modular architecture  
• Individually installable packages  
• CLI orchestration tool  
• Designed for large Three.js projects

---

# Package Namespace

All packages are published under:

@threeforged/*

Examples:

@threeforged/cli  
@threeforged/asset-analyzer  
@threeforged/lod-generator  
@threeforged/instancing-optimizer  
@threeforged/static-optimizer  
@threeforged/performance-auditor

---

# Monorepo Structure

threeforged/

packages/  
 cli/  
 asset-analyzer/  
 lod-generator/  
 instancing-optimizer/  
 static-optimizer/  
 performance-auditor/  

docs/  
 guides/  
 api/  

examples/  

scripts/  

package.json  
pnpm-workspace.yaml  
tsconfig.base.json  

---

# Why a Monorepo?

Benefits include:

• Shared utilities  
• Unified versioning  
• Easier dependency management  
• Consistent development tooling  
• Cross-plugin integration  

---

# Package Design

Each package follows the same internal structure.

package-name/

src/  
 index.ts  
 core/  
 utils/  

tests/  

package.json  
tsconfig.json  
README.md  

---

# CLI Integration

Plugins can be used in two ways:

1) Direct npm usage  
2) Through the ThreeForged CLI

Example:

npx threeforged analyze ./assets

---

# Example Installation

Install individual packages:

npm install @threeforged/lod-generator

or

npm install @threeforged/instancing-optimizer

---

# CLI Usage

Install CLI globally:

npm install -g @threeforged/cli

Run commands:

threeforged audit ./scene.glb

threeforged analyze ./assets

threeforged optimize ./scene.glb

---

# Package Independence

Each plugin works independently.

Users are free to install only the tools they need.

Example:

npm install @threeforged/asset-analyzer

without installing any other packages.

---

# Shared Utilities

Shared utilities may exist in an internal package:

@threeforged/core

This package can contain:

• shared math utilities  
• geometry analysis helpers  
• logging utilities  
• config parsing  
• CLI helpers  

---

# Versioning

Versioning will follow standard semantic versioning:

MAJOR.MINOR.PATCH

Example:

1.2.0

---

# Licensing

ThreeForged is fully open source.

License: MIT

Users are free to:

• use commercially  
• modify  
• distribute  
• contribute

---

# Contributing

Community contributions are encouraged.

Typical contributions include:

• performance improvements  
• new optimization tools  
• bug fixes  
• documentation improvements

---

# Future Plugins

Potential future plugins may include:

@threeforged/lightmap-baker  
@threeforged/texture-atlas-generator  
@threeforged/navmesh-generator  
@threeforged/physics-analyzer  

---

# Goal

ThreeForged aims to become the **standard optimization toolkit for Three.js developers**.

A single ecosystem of tools designed to make WebGL scenes faster, smaller, and easier to maintain.