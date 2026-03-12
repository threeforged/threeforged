# ThreeForged

Modular, open-source CLI toolkit for Three.js optimization. MIT licensed.

## Architecture

pnpm monorepo with independently publishable packages under `@threeforged/*`.

### Packages

| Package | Path | Status | Description |
|---|---|---|---|
| `@threeforged/core` | `packages/core/` | Implemented | Shared types, logger, config, file utils, GLTF/OBJ loaders |
| `@threeforged/cli` | `packages/cli/` | Implemented | Commander.js CLI with plugin auto-discovery |
| `@threeforged/asset-analyzer` | `packages/asset-analyzer/` | Implemented | 6 analysis rules (high-poly, duplicate materials, large textures, texture memory, unindexed geometry, duplicate meshes) |
| `@threeforged/performance-auditor` | `packages/performance-auditor/` | Placeholder | Scene performance auditing |
| `@threeforged/lod-generator` | `packages/lod-generator/` | Placeholder | Level-of-detail generation |
| `@threeforged/instancing-optimizer` | `packages/instancing-optimizer/` | Placeholder | Instanced rendering optimization |
| `@threeforged/static-optimizer` | `packages/static-optimizer/` | Placeholder | Static geometry optimization |

### Build Order

core → (asset-analyzer, lod-generator, instancing-optimizer, performance-auditor, static-optimizer) → cli

Core must build first. CLI builds last (depends on all plugins as optional deps). The middle packages are independent of each other.

## Tech Stack

- **Runtime:** Node.js >=18, ESM-only
- **Package manager:** pnpm workspaces
- **Language:** TypeScript (strict, `verbatimModuleSyntax`)
- **Build:** tsup (ESM + .d.ts)
- **Test:** Vitest
- **CLI:** Commander.js
- **3D parsing:** @gltf-transform/core (GLB/GLTF), obj-file-parser (OBJ)
- **Terminal output:** picocolors + cli-table3

## Commands

```bash
pnpm build          # Build all packages (respects dependency order)
pnpm test           # Run all tests
pnpm lint           # ESLint (flat config)
pnpm typecheck      # TypeScript type checking
pnpm format         # Prettier
```

### CLI usage (after `pnpm link --global` from packages/cli)

```bash
threeforged analyze <path>          # Analyze assets
threeforged analyze <path> --json   # JSON output
threeforged analyze <path> -o report.txt  # Save to file
threeforged --debug analyze <path>  # Verbose logging
```

## Key Patterns

- **Plugin discovery:** CLI scans `node_modules/@threeforged/*` for packages exporting `threeforgedPlugin` (see `ThreeForgedPlugin` interface in core/types.ts)
- **Dynamic imports:** CLI commands use `await import('@threeforged/<plugin>')` with graceful "not installed" fallback
- **Texture dimensions:** Parsed from raw PNG/JPEG headers (no sharp dependency)
- **OBJ quad handling:** N-vertex faces → N-2 triangles
- **Config:** Optional `threeforged.config.js` in project root, loaded via dynamic import
- **Test fixtures:** Generated programmatically via `packages/core/scripts/generate-fixtures.ts`

## File Conventions

- Package entry: `src/index.ts` (barrel export)
- Tests: `tests/` directory in each package
- Build output: `dist/` (gitignored)
- Config: `tsup.config.ts` per package, extends `../../tsconfig.base.json`

## Planning Docs

Future plugin specs are in `docs/`:
- `threeforged-performance-auditor.md`
- `threeforged-lod-generator.md`
- `threeforged-instancing-optimizer.md`
- `threeforged-static-optimizer.md`
