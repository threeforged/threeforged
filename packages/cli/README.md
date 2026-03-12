# @threeforged/cli

Command-line interface for ThreeForged optimization tools. Orchestrates all ThreeForged plugins through a single `threeforged` command.

## Installation

```bash
pnpm add -g @threeforged/cli
```

## Usage

```bash
threeforged <command> [options]
```

### Commands

| Command | Description | Plugin Required |
|---|---|---|
| `analyze <path>` | Analyze 3D assets for performance issues | @threeforged/asset-analyzer |
| `audit <path>` | Audit scene performance | @threeforged/performance-auditor |
| `lod <path>` | Generate levels of detail | @threeforged/lod-generator |
| `instancing <path>` | Optimize instanced rendering | @threeforged/instancing-optimizer |
| `static <path>` | Optimize static geometry | @threeforged/static-optimizer |

### Global Options

| Option | Description |
|---|---|
| `--json` | Output results as JSON |
| `--debug` | Enable debug logging |
| `--config <path>` | Path to config file |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

### Examples

```bash
# Analyze a single file
threeforged analyze model.glb

# Analyze all assets in a directory
threeforged analyze ./models/

# JSON output for CI/CD pipelines
threeforged analyze ./models/ --json

# Save report to file
threeforged analyze ./models/ -o report.txt

# Debug mode
threeforged --debug analyze model.glb
```

## Plugin Discovery

The CLI automatically discovers installed `@threeforged/*` plugins. Install only the plugins you need — uninstalled plugins show a helpful installation message when their command is run.

## License

MIT
