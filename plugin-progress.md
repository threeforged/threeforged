# ThreeForged Monorepo — Progress & Plan

## Context

ThreeForged is a modular, open-source (MIT) toolkit of CLI-based optimization tools for Three.js developers. The project lives in the `threeforged` GitHub org under the `@threeforged` npm scope.

---

## Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Package manager | **pnpm** workspaces | Fast, disk-efficient, great monorepo support |
| Test framework | **Vitest** | Native TS/ESM, fast, Jest-compatible API |
| CLI framework | **Commander.js** | ESM support, lightweight, tree-of-subcommands maps to `threeforged <cmd>` |
| 3D file parsing | **@gltf-transform/core** (GLB/GLTF) + **obj-file-parser** (OBJ) | Headless Node.js — no WebGL context needed |
| Terminal colors | **picocolors** | 14x smaller than chalk, fast startup |
| Table output | **cli-table3** | Column alignment, wrapping, colored cells |
| Build tool | **tsup** | Zero-config TS → ESM bundling with `.d.ts` generation |
| Config loading | Dynamic `import()` | ESM-native, no extra dependency |

---

## Completed Steps

### Step 1: Root Configuration (Foundation) — DONE

Created at project root:

- **`package.json`** — `private: true`, `type: "module"`, workspace scripts (`build`, `test`, `lint`, `format`, `clean`, `dev`, `typecheck`), shared devDeps (typescript, eslint, prettier, tsup, vitest, @types/node), `engines: { node: ">=18.0.0", pnpm: ">=9.0.0" }`
- **`pnpm-workspace.yaml`** — `packages: ["packages/*"]`, `onlyBuiltDependencies: [esbuild]`
- **`tsconfig.base.json`** — `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, strict, `verbatimModuleSyntax: true`, declarations + sourcemaps
- **`eslint.config.js`** — Flat config (ESLint 9), typescript-eslint recommended, ignore dist/node_modules
- **`.prettierrc`** — semi, singleQuote, tabWidth 2, trailingComma all, printWidth 100
- **`.gitignore`** — node_modules, dist, coverage, *.tsbuildinfo, .env, .claude/, CLAUDE.md, docs/
- **`.npmrc`** — `auto-install-peers=true`, `strict-peer-dependencies=false`
- **`LICENSE`** — MIT, ThreeForged Contributors
- **`README.md`** — Root repo README with quick start, package table, usage docs, configuration

### Step 2: @threeforged/core Package — DONE (published v0.1.0)

`packages/core/` — shared foundation every other package depends on.

```
packages/core/
  package.json          — deps: @gltf-transform/core, obj-file-parser, picocolors, globby
  tsconfig.json         — extends ../../tsconfig.base.json
  tsup.config.ts        — ESM-only, dts, target node18
  README.md
  src/
    index.ts            — barrel export
    types.ts            — LogLevel, ThreeForgedConfig, AssetReport, MeshInfo, MaterialInfo,
                          TextureInfo, AnimationInfo, Warning, PerformanceMetrics,
                          ThreeForgedPlugin, ParsedDocument, SupportedFormat, PolyCountThresholds
    logger.ts           — Logger class with debug/info/warn/error/success, picocolors prefixes,
                          verbosity filtering, singleton via createLogger()/getLogger()
    config.ts           — loadConfig() — dynamic import of threeforged.config.js/.mjs,
                          DEFAULT_CONFIG with sensible thresholds
    files.ts            — isSupportedFormat(), detectFormat(), findAssetFiles() via globby,
                          getFileSize(), formatBytes()
    loader/
      index.ts          — loadDocument() facade — dispatches by extension, 512 MB file size limit
      gltf-loader.ts    — NodeIO wrapper: meshes, materials, textures (PNG/JPEG header parsing
                          with bounds checking), animations, draw calls
      obj-loader.ts     — obj-file-parser wrapper: handles quad faces (N-2 triangles),
                          materials from face references, no animation support
  scripts/
    generate-fixtures.ts — programmatically generates test GLB/OBJ files
  tests/
    logger.test.ts
    config.test.ts
    files.test.ts
    loader/gltf-loader.test.ts
    loader/obj-loader.test.ts
```

**31 tests passing.**

### Step 3: @threeforged/cli Package — DONE (published v0.1.0)

`packages/cli/` — command orchestration layer.

```
packages/cli/
  package.json          — deps: @threeforged/core (workspace:*), commander, cli-table3, picocolors
                          bin: { "threeforged": "./dist/index.js" }
                          optionalDependencies for all plugins (workspace:*)
  tsconfig.json
  tsup.config.ts        — banner: { js: "#!/usr/bin/env node" }
  README.md
  src/
    index.ts            — Commander setup, register global options, register built-in commands,
                          discover plugins, program.parse()
    utils/
      global-options.ts — --json, --debug, --config flags, preAction hook sets logger level
    commands/
      index.ts          — registerBuiltinCommands() barrel
      analyze.ts        — `threeforged analyze <path>` with --output flag, ANSI stripping for
                          file export, output path validation (must stay within CWD)
      audit.ts          — placeholder for @threeforged/performance-auditor
      lod.ts            — placeholder for @threeforged/lod-generator
      instancing.ts     — placeholder for @threeforged/instancing-optimizer
      static.ts         — placeholder for @threeforged/static-optimizer
    plugins/
      discovery.ts      — scans node_modules/@threeforged/*, KNOWN_PLUGINS allowlist (security),
                          isValidPlugin() type guard, only loads official plugins
    output/
      formatter.ts      — formatAssetReport() with cli-table3, word wrapping, fixed col widths
      json.ts           — formatJson() wrapper
  tests/
    cli.test.ts
    plugins/discovery.test.ts
    output/formatter.test.ts
```

**4 tests passing.**

### Step 4: @threeforged/asset-analyzer Package — DONE (published v0.1.1)

`packages/asset-analyzer/` — first real plugin.

```
packages/asset-analyzer/
  package.json          — deps: @threeforged/core (workspace:*), commander
  tsconfig.json
  tsup.config.ts
  README.md             — 3-step install instructions (CLI → plugin → run)
  src/
    index.ts            — exports analyzeAssets(), threeforgedPlugin, re-exports types
    analyzer.ts         — resolve path (file or dir), findAssetFiles(), loadDocument(),
                          runAllRules(), buildReport()
    plugin.ts           — threeforgedPlugin export for CLI auto-discovery
    rules/
      index.ts          — runAllRules() orchestrator
      high-poly.ts      — flag meshes > large threshold (error) or > medium (warn)
      duplicate-materials.ts — hash material properties, flag groups with count > 1
      large-textures.ts — flag textures > maxTextureSize
      texture-memory.ts — sum GPU memory, warn if > maxTextureMB
      unindexed-geometry.ts — flag meshes with hasIndices === false
      duplicate-meshes.ts — cross-file detection, caps at 5 names with "and N more"
    report/
      builder.ts        — assembles AssetReport with full metrics (triangles, vertices, meshes,
                          materials, textures, draw calls, animations, GPU memory)
  tests/
    analyzer.test.ts    — end-to-end with fixture GLB files
    rules/
      high-poly.test.ts
      duplicate-materials.test.ts
      large-textures.test.ts
    fixtures/            — generated via core's generate-fixtures.ts script
```

**9 tests passing.**

### Step 5: Placeholder Packages — DONE

Created minimal shells (package.json + tsconfig.json + tsup.config.ts + src/index.ts + README.md) for:
- `packages/performance-auditor/` — @threeforged/performance-auditor
- `packages/lod-generator/` — @threeforged/lod-generator
- `packages/instancing-optimizer/` — @threeforged/instancing-optimizer
- `packages/static-optimizer/` — @threeforged/static-optimizer

Each has `@threeforged/core` as workspace dependency, npm metadata (repository, homepage, bugs, keywords), and a README with planned features.

### Step 6: Security Hardening — DONE

- **File size limit** — 512 MB cap in `loader/index.ts` before loading any file
- **Image header bounds checking** — PNG requires 24+ bytes, JPEG validates offsets and segment lengths
- **Output path restriction** — `--output` flag validates path stays within CWD via `path.relative()`
- **Plugin allowlist** — `discovery.ts` only auto-discovers known official plugins from `KNOWN_PLUGINS` set
- **Plugin validation** — `isValidPlugin()` type guard checks structure before calling `registerCLI()`

### Step 7: Publishing & GitHub — DONE

- **npm org** `@threeforged` created and controlled
- **Published packages:**
  - `@threeforged/core@0.1.0`
  - `@threeforged/cli@0.1.0`
  - `@threeforged/asset-analyzer@0.1.1`
- **All packages have:** repository, homepage, bugs, keywords fields for npm display
- **GitHub repo:** cleaned of internal files (.claude/, CLAUDE.md, docs/), root README added
- **Verified end-to-end:** global CLI install → plugin install in separate project → `threeforged analyze` works

---

## Current State

- **44 total tests passing** across core (31), asset-analyzer (9), cli (4)
- **`pnpm build`** — all 7 packages build successfully
- **`pnpm test`** — all tests pass
- **CLI installed globally** and working from any directory
- **npm packages live** and installable by anyone

---

## Remaining Plugins to Build

These are placeholder packages with planned features. Each needs full implementation following the asset-analyzer pattern (analyzer engine + rules + CLI command + tests).

### @threeforged/performance-auditor
Spec: `docs/threeforged-performance-auditor.md` (local only, gitignored)

Planned features:
- Draw call analysis and batching recommendations
- Shader complexity scoring
- Overdraw detection
- Material and geometry deduplication suggestions
- Scene graph depth analysis
- Performance budget enforcement

### @threeforged/lod-generator
Spec: `docs/threeforged-lod-generator.md` (local only, gitignored)

Planned features:
- Automatic mesh simplification at configurable quality levels
- LOD group generation for Three.js LOD objects
- Triangle budget targeting
- UV and attribute preservation
- Batch processing for entire asset directories

### @threeforged/instancing-optimizer
Spec: `docs/threeforged-instancing-optimizer.md` (local only, gitignored)

Planned features:
- Automatic detection of duplicate geometry
- InstancedMesh conversion recommendations
- Transform matrix extraction for instances
- Material compatibility analysis
- Draw call reduction estimates

### @threeforged/static-optimizer
Spec: `docs/threeforged-static-optimizer.md` (local only, gitignored)

Planned features:
- Static mesh detection and merging
- Geometry batching by material
- Buffer geometry optimization
- Vertex deduplication
- Bounding volume generation

---

## Publishing Workflow (for future releases)

```bash
# 1. Bump version in the package's package.json (or use `npm version patch`)
# 2. Build: pnpm --filter @threeforged/<package> build
# 3. Commit and push to GitHub
# 4. Publish: pnpm --filter @threeforged/<package> publish --access public
```

---

## Key Lessons / Gotchas

- **pnpm strict isolation:** CLI needs `optionalDependencies` for all plugins to enable dynamic `import()` in pnpm workspaces
- **esbuild postinstall:** pnpm requires `onlyBuiltDependencies: [esbuild]` in pnpm-workspace.yaml
- **obj-file-parser:** Latest is v0.6.2, not v1.x — use `^0.6.0`
- **Fixture generation:** Script must live in packages/core/ (not repo root) to access @gltf-transform/core under pnpm isolation
- **npm scoped packages:** Require `--access public` on first publish (default to private)
- **npm propagation:** Newly published scoped packages can take 5-15 minutes to appear in the registry CLI
- **ThreeForgedPlugin.registerCLI:** Takes `unknown` (not `Command`) to avoid commander as a core dependency
