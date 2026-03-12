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

### Step 3: @threeforged/cli Package — DONE (published v0.1.1)

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
      audit.ts          — `threeforged audit <path>` with --profile and --output flags,
                          dynamic import of @threeforged/performance-auditor
      lod.ts            — placeholder for @threeforged/lod-generator
      instancing.ts     — `threeforged instancing <path>` with --output flag,
                          dynamic import of @threeforged/instancing-optimizer
      static.ts         — placeholder for @threeforged/static-optimizer
    plugins/
      discovery.ts      — scans node_modules/@threeforged/*, KNOWN_PLUGINS allowlist (security),
                          isValidPlugin() type guard, only loads official plugins
    output/
      formatter.ts      — formatAssetReport() with cli-table3, word wrapping, fixed col widths
      audit-formatter.ts — formatAuditReport() with score display, profile indicator, VRAM breakdown
      instancing-formatter.ts — formatInstancingReport() with candidate table, confidence colors, details
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
- `packages/lod-generator/` — @threeforged/lod-generator
- `packages/instancing-optimizer/` — @threeforged/instancing-optimizer
- `packages/static-optimizer/` — @threeforged/static-optimizer

Each has `@threeforged/core` as workspace dependency, npm metadata (repository, homepage, bugs, keywords), and a README with planned features.

### Step 6: Security Hardening — DONE

- **File size limit** — 512 MB cap in `loader/index.ts` before loading any file
- **Image header bounds checking** — PNG requires 24+ bytes, JPEG validates offsets and segment lengths
- **Output path restriction** — `--output` flag validates path stays within CWD via `path.isAbsolute()` (fixed Windows bug where `resolve(rel) === resolved` false-positived for files in CWD)
- **Plugin allowlist** — `discovery.ts` only auto-discovers known official plugins from `KNOWN_PLUGINS` set
- **Plugin validation** — `isValidPlugin()` type guard checks structure before calling `registerCLI()`
- **Performance auditor input validation** — all config thresholds validated as finite positive numbers, maxFiles capped at 10,000
- **Safe math** — division-by-zero guards, NaN/Infinity checks, negative clamping in VRAM and geometry rules
- **Resource limits** — maxFiles cap (default 500) prevents DoS via huge directories
- **Bounds on output** — instancing groups capped to 10, entries per group to 5 (performance-auditor); 20 groups, 8 entries (instancing-optimizer)
- **Path sanitization** — audit and instancing reports relativize all file paths (no absolute path leaks)
- **Instancing optimizer input validation** — all config thresholds validated as finite positive, materialHeterogeneityThreshold bounded to (0,1], maxFiles capped at 10,000

### Step 7: Publishing & GitHub — DONE

- **npm org** `@threeforged` created and controlled
- **Published packages:**
  - `@threeforged/core@0.1.0`
  - `@threeforged/cli@0.1.2` (instancing command + formatter)
  - `@threeforged/asset-analyzer@0.1.1`
  - `@threeforged/performance-auditor@0.1.1`
  - `@threeforged/instancing-optimizer@0.1.0`
- **All packages have:** repository, homepage, bugs, keywords fields for npm display
- **GitHub repo:** cleaned of internal files (.claude/, CLAUDE.md, docs/), root README added
- **Verified end-to-end:** global CLI install → plugin install in separate project → `threeforged analyze` and `threeforged audit` work
- **Security audit passed:** no secrets, no private tokens, no hardcoded credentials, no internal URLs, clean .npmrc

### Step 8: @threeforged/performance-auditor Package — DONE (published v0.1.1)

`packages/performance-auditor/` — scene performance auditing plugin.

```
packages/performance-auditor/
  package.json          — deps: @threeforged/core (workspace:*)
  tsconfig.json
  tsup.config.ts
  README.md             — 3-step install instructions, profiles table, config docs
  src/
    index.ts            — exports auditPerformance(), threeforgedPlugin, config utils, re-exports types
    types.ts            — PerformanceProfile, PerformanceAuditorConfig, PerformanceAuditReport
    config.ts           — DEFAULT_AUDITOR_CONFIG with platform budgets, validateConfig() with
                          finite positive checks, loadAuditorConfig() deep-merges with core config
    auditor.ts          — resolve path, findAssetFiles(), enforce maxFiles limit, loadDocument(),
                          runAllRules(), buildAuditReport()
    plugin.ts           — threeforgedPlugin export for CLI auto-discovery
    rules/
      index.ts          — runAllRules() orchestrator returning warnings + score + grade
      draw-calls.ts     — per-profile threshold check with lower-tier info warnings
      triangle-budget.ts — per-profile triangle budget at 80%/100%
      vram-usage.ts     — texture + geometry VRAM estimation (32 bytes/vertex) with NaN/negative guards
      material-count.ts — count thresholds + duplicate detection via property hashing
      geometry-complexity.ts — dense tri/vert ratio, unindexed, vertex-heavy checks, div-by-zero guard
      instancing-opportunities.ts — cross-document duplicate geometry, capped output (10 groups, 5 entries)
      performance-score.ts — weighted 0-100 composite (draw calls 25%, triangles 25%, VRAM 20%,
                             materials 15%, unindexed ratio 15%), letter grades A-F
    report/
      builder.ts        — metrics with geometry VRAM, path sanitization via relative()
  tests/
    auditor.test.ts     — integration test with fixture GLB files
    config.test.ts      — valid config, negative/NaN/Infinity/zero, invalid profile, maxFiles cap
    report/
      builder.test.ts   — metrics computation, path relativization, timestamp
    rules/
      draw-calls.test.ts
      triangle-budget.test.ts
      vram-usage.test.ts
      material-count.test.ts
      geometry-complexity.test.ts
      instancing-opportunities.test.ts
      performance-score.test.ts
```

**58 tests passing.**

Performance profiles:

| Profile | Draw Calls | Triangles | VRAM |
|---|---|---|---|
| mobile | 100 | 500K | 128 MB |
| desktop | 300 | 2M | 512 MB |
| high-end | 1,000 | 10M | 2,048 MB |

CLI usage: `threeforged audit <path> [--profile mobile|desktop|high-end] [--json] [-o file]`

### Step 9: @threeforged/instancing-optimizer Package — DONE (published v0.1.0)

`packages/instancing-optimizer/` — instancing opportunity detection plugin.

```
packages/instancing-optimizer/
  package.json          — deps: @threeforged/core (workspace:*)
  tsconfig.json
  tsup.config.ts
  README.md             — 3-step install instructions, confidence levels table, config docs
  src/
    index.ts            — exports detectInstancingCandidates(), threeforgedPlugin, config utils, re-exports types
    types.ts            — InstancingConfidence, InstancingCandidate, InstancingMeshEntry,
                          InstancingMetrics (extends PerformanceMetrics), InstancingReport,
                          InstancingOptimizerConfig
    config.ts           — DEFAULT_OPTIMIZER_CONFIG, validateConfig() with finite positive checks +
                          materialHeterogeneityThreshold (0,1] bounds, loadOptimizerConfig()
    optimizer.ts        — resolve path, findAssetFiles(), enforce maxFiles limit, loadDocument(),
                          runAllRules(), buildInstancingReport()
    plugin.ts           — threeforgedPlugin export for CLI auto-discovery
    rules/
      index.ts          — runAllRules() orchestrator returning candidates + warnings (sequential pipeline)
      geometry-grouping.ts — groups meshes by vertices:triangles:indexed signature, filters by
                             minTriangles, sorts by impact (instance count then vertex count),
                             caps at maxGroups, limits entries per group
      animation-exclusion.ts — channels-to-meshes ratio heuristic: >=1 → low confidence,
                               >0 → medium confidence, does not upgrade from low
      material-compatibility.ts — material-to-mesh ratio vs threshold, mesh name prefix matching
                                  across _, -, . separators, preserves high confidence with prefix match
      savings-estimation.ts — drawCallsSaved = instanceCount-1, vramSavedBytes = (N-1)*vertices*32,
                              severity: >=50% error, >=20% warn, >=5% info
      cross-file-detection.ts — flags candidates spanning multiple source files
    report/
      builder.ts        — metrics with instancing-specific fields (candidateGroups, totalDrawCallsSaved,
                          totalVramSavedBytes, drawCallReductionPercent, geometryReuseRatio,
                          uniqueGeometryCount, hasAnimations), path sanitization via relative()
  tests/
    config.test.ts      — valid config, custom values, negative/NaN/Infinity/zero, maxFiles cap,
                          materialHeterogeneityThreshold bounds, immutability (12 tests)
    optimizer.test.ts   — integration test with fixture GLB, unsupported file, report structure (4 tests)
    report/
      builder.test.ts   — base metrics, instancing metrics, draw call reduction, timestamp,
                          path relativization, empty inputs, geometry reuse ratio (7 tests)
    rules/
      geometry-grouping.test.ts — grouping, minCount, minTriangles, indexed vs unindexed,
                                  sorting, maxGroups cap, maxEntries cap, cross-document (8 tests)
      animation-exclusion.test.ts — no animations, high ratio, partial ratio, no upgrade, reasons (5 tests)
      material-compatibility.test.ts — low ratio, high ratio no prefix, prefix match, dash prefix,
                                       empty docs (5 tests)
      savings-estimation.test.ts — draw calls saved, triangles=0, VRAM math, error/warn/info/none
                                   severity, zero draw calls (8 tests)
      cross-file-detection.test.ts — single-file, multi-file, per-candidate warnings, file names (4 tests)
```

**53 tests passing.**

CLI usage: `threeforged instancing <path> [--json] [-o file]`

---

## Current State

- **155 total tests passing** across core (31), performance-auditor (58), instancing-optimizer (53), asset-analyzer (9), cli (4)
- **`pnpm build`** — all 7 packages build successfully
- **`pnpm test`** — all tests pass
- **`pnpm lint`** — passes clean
- **CLI installed globally** and working from any directory
- **npm packages live:** core@0.1.0, cli@0.1.2, asset-analyzer@0.1.1, performance-auditor@0.1.1, instancing-optimizer@0.1.0
- **Tested end-to-end** in separate project with real GLB models (animated archer model)

---

## Remaining Plugins to Build

These are placeholder packages with planned features. Each needs full implementation following the established pattern (engine + rules + CLI command + tests).

### @threeforged/lod-generator
Spec: `docs/threeforged-lod-generator.md` (local only, gitignored)

Planned features:
- Automatic mesh simplification at configurable quality levels
- LOD group generation for Three.js LOD objects
- Triangle budget targeting
- UV and attribute preservation
- Batch processing for entire asset directories

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
- **validateOutputPath on Windows:** `resolve(rel) === resolved` is always true for files in CWD on Windows — use `path.isAbsolute(rel)` instead to catch cross-drive paths
- **Global link stale binaries:** If `threeforged` was previously installed via npm/nvm, the old binary at `nvm4w/nodejs/` takes PATH priority over pnpm's global link — must remove stale binary manually
- **Performance auditor config pattern:** Plugin-specific config lives under a sub-key (e.g., `performanceAuditor`) in `threeforged.config.js`, deep-merged with defaults — cast through `unknown` to access sub-keys from `ThreeForgedConfig`
- **PowerShell vs bash:** `&&` chaining doesn't work in older PowerShell — run commands separately or use bash
- **pnpm vs npm for pack:** `pnpm npm pack --dry-run` doesn't work — use `npm pack --dry-run` directly
- **Plugin naming:** "optimizer" implies file modification but all 3 current plugins are read-only analyzers — naming is fine for now, can add `--apply` mode later to make the name fully accurate
