# ThreeForged Publish Checklist

This document outlines the process for preparing and publishing ThreeForged packages to npm.

ThreeForged packages are published under the `@threeforged/*` namespace and are part of a monorepo.

All packages are **open source and MIT licensed**.

---

# Publishing Philosophy

ThreeForged packages follow several publishing principles:

• Small focused packages  
• Stable versioning  
• Clear documentation  
• Safe release process  
• Automated publishing where possible

Each plugin should be installable independently.

Example:

```
npm install @threeforged/lod-generator
```

---

# Package Naming

All packages follow the naming convention:

```
@threeforged/<package-name>
```

Examples:

```
@threeforged/cli
@threeforged/asset-analyzer
@threeforged/performance-auditor
@threeforged/lod-generator
@threeforged/instancing-optimizer
@threeforged/static-optimizer
```

---

# Pre-Publish Checklist

Before publishing any package, verify the following.

## 1. Package Metadata

Check `package.json`:

• correct package name  
• version number updated  
• description written  
• repository URL present  
• license set to MIT  

Example:

```json
{
  "name": "@threeforged/lod-generator",
  "version": "0.1.0",
  "license": "MIT"
}
```

---

## 2. Build Output

Ensure compiled output exists.

Typical structure:

```
dist/
  index.js
  index.d.ts
```

Build command:

```
pnpm build
```

---

## 3. TypeScript Types

Verify types are exported correctly.

Example:

```
types: dist/index.d.ts
```

---

## 4. Documentation

Each package should contain a README.

README sections:

• package description  
• installation instructions  
• CLI usage  
• programmatic usage examples  

---

## 5. Tests Passing

Run all tests before publishing.

```
pnpm test
```

All tests should pass successfully.

---

## 6. Linting

Ensure code style consistency.

```
pnpm lint
```

---

# Publishing a Package

Navigate to the package directory.

Example:

```
cd packages/lod-generator
```

Publish the package.

```
npm publish --access public
```

Because this is a scoped package, `--access public` is required.

---

# Monorepo Publishing

In a monorepo setup, publishing may be automated using tools such as:

• Changesets  
• Turborepo pipelines  
• pnpm workspace publishing  

Example workspace publish:

```
pnpm publish -r
```

This publishes all updated packages.

---

# Versioning

ThreeForged uses semantic versioning.

```
MAJOR.MINOR.PATCH
```

Examples:

```
0.1.0
0.2.0
1.0.0
```

Guidelines:

• PATCH → bug fixes  
• MINOR → new features  
• MAJOR → breaking changes  

---

# Testing Installation

After publishing, verify the package installs correctly.

Example:

```
npm install @threeforged/lod-generator
```

Then test usage in a sample project.

---

# CLI Publishing

The CLI package should expose a binary command.

Example `package.json`:

```json
{
  "name": "@threeforged/cli",
  "bin": {
    "threeforged": "./dist/index.js"
  }
}
```

This allows the command:

```
threeforged
```

to run after installation.

---

# NPM Organization

All packages should be published under the **ThreeForged npm organization**.

Example:

```
https://www.npmjs.com/org/threeforged
```

This provides a central location for the ecosystem.

---

# GitHub Releases

Each published version should correspond to a GitHub release.

Release notes should include:

• new features  
• bug fixes  
• breaking changes  

---

# Future Automation

Future improvements may include automated releases using:

• GitHub Actions  
• Changesets versioning  
• automated changelog generation  

This will reduce manual publishing steps.

---

# Goal

The goal of this checklist is to ensure that every ThreeForged package is published consistently, reliably, and with high quality documentation.