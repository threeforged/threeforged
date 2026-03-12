# ThreeForged Publish Checklist

## Overview

This checklist explains how to publish the ThreeForged CLI and future add-on packages so developers can install them with npm.

Primary publishing goals:

- publish the free core CLI as `threeforged`
- later publish optional add-on packages such as:
  - `@threeforged/optimizer`
  - `@threeforged/lod-generator`
  - `@threeforged/instancing`
  - `@threeforged/auditor`

Recommended first release:

- publish only the core CLI
- make sure `threeforged analyze` works
- add paid packages later

---

# Publishing Strategy

## First package to publish

Publish the free core CLI first:

threeforged

This should include:

- the main CLI command
- the analyzer command
- any shared infrastructure required for analysis

Do **not** publish every package at once for the first release.

---

# Pre-Publish Requirements

Before publishing any package, make sure it has:

- a valid `package.json`
- a unique package name
- a version number
- a build step
- a README
- a LICENSE
- a working built output

For a CLI package, you also need:

- a `bin` field in `package.json`

---

# Core CLI Package Checklist

For the core CLI package, confirm the following:

## 1. Package name

Recommended:

threeforged

This name must be available on npm.

---

## 2. Version

Start with:

0.1.0

Remember:

- once a package name + version is published, that exact combination cannot be reused

So every release should bump the version.

---

## 3. `bin` field

Your CLI package must expose the command with the `bin` field.

Example:

```json
{
  "name": "threeforged",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "threeforged": "./dist/cli.js"
  }
}
```

This is what makes the terminal command work after install.

---

## 4. Build script

Your package should build into `dist/` before publishing.

Example:

```json
{
  "scripts": {
    "build": "tsup src/cli.ts --format esm --clean",
    "prepublishOnly": "npm run build"
  }
}
```

`prepublishOnly` helps ensure the package is built before publish.

---

## 5. Published files

Control what gets published.

Recommended `files` field:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

This helps keep the package clean and avoids shipping unnecessary source files.

---

# Example `package.json` for Core CLI

```json
{
  "name": "threeforged",
  "version": "0.1.0",
  "description": "ThreeForged CLI for Three.js and HYTOPIA optimization workflows",
  "type": "module",
  "bin": {
    "threeforged": "./dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/cli.ts --format esm --clean",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "threejs",
    "three.js",
    "hytopia",
    "cli",
    "optimization",
    "gamedev"
  ]
}
```

---

# npm Account Setup

## 1. Create npm account

Create an npm account if you do not already have one.

---

## 2. Log in from terminal

```bash
npm login
```

You must be logged in before publishing.

If two-factor auth is enabled for publishing, npm may prompt for a one-time password.

---

# Local Verification Checklist

Before publishing, test the package locally.

## 1. Install dependencies

```bash
npm install
```

or if using a workspace tool such as pnpm:

```bash
pnpm install
```

---

## 2. Build the package

```bash
npm run build
```

or workspace equivalent.

Confirm that `dist/cli.js` exists.

---

## 3. Test the CLI locally

If testing from the package directory:

```bash
npm link
```

Then try:

```bash
threeforged --help
threeforged analyze .
```

This simulates how the command will behave after install.

---

# Preflight Publish Checks

## 1. Dry run publish

Always run:

```bash
npm publish --dry-run
```

This shows what would be published without actually publishing.

Review:

- package name
- version
- included files
- package size

---

## 2. Check packed contents

Optional but recommended:

```bash
npm pack --dry-run
```

This helps confirm exactly what files will be included in the package tarball.

---

# Publishing the Core CLI

## Unscoped public package

If your core package is named:

threeforged

Publish with:

```bash
npm publish
```

This is the recommended approach for the free public CLI.

---

# Publishing Scoped Packages

Future paid or modular packages may use scoped names like:

- `@threeforged/optimizer`
- `@threeforged/lod-generator`
- `@threeforged/instancing`
- `@threeforged/auditor`

For a **public scoped package**, the initial publish must include:

```bash
npm publish --access public
```

If you do not do this on first publish, npm will treat scoped packages as restricted by default.

---

# Monorepo Publishing Checklist

ThreeForged uses a monorepo structure.

That means:

- one Git repository
- multiple publishable packages

Example:

```txt
threeforged/
  packages/
    cli/
    analyzer/
    optimizer/
    lod-generator/
    instancing/
    auditor/
    shared/
```

You publish packages individually from their package directories, or via workspace-aware publish commands.

---

## Per-package publish flow in a monorepo

For example, to publish the core CLI:

1. go to:

```txt
packages/cli
```

2. confirm `package.json` is correct

3. build

4. dry-run publish

5. publish

Example:

```bash
cd packages/cli
npm run build
npm publish --dry-run
npm publish
```

---

## Workspace publish flow

If using npm workspaces, npm supports workspace-aware commands.

Example patterns:

```bash
npm publish --workspace=packages/cli
```

or for multiple workspaces:

```bash
npm publish --workspaces
```

For first releases, publishing package-by-package is usually safer.

---

# First Release Checklist

For your first public release, follow this exact order:

## Step 1

Publish only:

threeforged

---

## Step 2

Ship only the free Analyzer flow:

```bash
threeforged analyze .
```

Do not worry about paid add-ons yet.

---

## Step 3

From a fresh test folder, verify install and execution:

```bash
npx threeforged --help
npx threeforged analyze .
```

Also test:

```bash
npm install -D threeforged
npx threeforged analyze .
```

---

# Future Add-On Package Checklist

When ready to publish optional paid or modular packages, each add-on should have:

- its own `package.json`
- its own version
- its own README
- a clear package name
- a clean public or private publishing plan

Example names:

- `@threeforged/optimizer`
- `@threeforged/lod-generator`
- `@threeforged/instancing`
- `@threeforged/auditor`

Each add-on should be installable separately.

---

# Suggested Release Order

Recommended publishing order:

1. `threeforged`
2. `@threeforged/optimizer`
3. `@threeforged/instancing`
4. `@threeforged/lod-generator`
5. `@threeforged/auditor`

This matches the implementation roadmap and keeps launch complexity low.

---

# Versioning Checklist

For each release:

- update version in `package.json`
- update changelog if you keep one
- rebuild
- dry run publish
- publish
- test install from a clean folder

Simple version progression example:

- 0.1.0
- 0.1.1
- 0.2.0
- 0.3.0
- 1.0.0

---

# Recommended First Publish Command Sequence

For the first core CLI release, the safest sequence is:

```bash
cd packages/cli
npm login
npm install
npm run build
npm publish --dry-run
npm publish
```

Then verify from another folder:

```bash
npx threeforged --help
npx threeforged analyze .
```

---

# Common Mistakes to Avoid

- forgetting the `bin` field
- publishing before testing locally
- forgetting to build before publishing
- publishing the wrong files
- forgetting `--access public` on first scoped public package
- forgetting to bump the version number
- trying to publish all packages at once on day one

---

# Recommended First Milestone

Your first publishing milestone should be:

- package name reserved
- `threeforged` published publicly
- `threeforged analyze .` works through `npx`

Once that is stable, move on to add-on packages.

---

# Final Goal

Developers should be able to do:

```bash
npx threeforged analyze .
```

and later install optional tools as the product suite grows.