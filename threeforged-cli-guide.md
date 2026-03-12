# ThreeForged CLI Guide (v3)

## Overview

ThreeForged is a command-line toolkit designed to help developers optimize and diagnose performance issues in Three.js and HYTOPIA projects.

Instead of installing multiple tools, developers install a single CLI package:

npm install -D threeforged

This provides the main command:

threeforged

The CLI exposes multiple optimization and diagnostic tools through subcommands.

---

# Core Command Structure

All tools follow this structure:

threeforged <command> <path>

The `<path>` parameter can be:

- a single file
- a folder
- the project root

Examples:

threeforged analyze castle.glb  
threeforged analyze ./assets  
threeforged analyze .

threeforged optimize ./assets/models  
threeforged generate-lod ./assets/models  
threeforged instance ./assets  
threeforged audit .

---

# Current Tool Suite

ThreeForged currently includes the following tools:

threeforged analyze  
threeforged optimize  
threeforged generate-lod  
threeforged instance  
threeforged audit  

Each tool targets a specific performance issue common in Three.js projects.

---

# Tool Descriptions

## analyze

Scans assets or entire projects and reports performance metrics.

Example:

threeforged analyze .

Reports:

- mesh count
- triangle count
- materials
- textures
- estimated draw calls
- repeated mesh candidates
- LOD candidates
- static batching candidates

The analyzer is the **entry point to the ThreeForged ecosystem**.

---

## optimize

Reduces draw calls by merging compatible static meshes.

Example:

threeforged optimize ./assets

Features:

- static mesh batching
- transform baking
- material grouping
- optional texture atlasing

---

## generate-lod

Automatically generates simplified versions of models.

Example:

threeforged generate-lod ./assets/models

Generates:

LOD0  
LOD1  
LOD2  

Helps reduce GPU load for distant objects.

---

## instance

Detects repeated meshes and converts them into GPU instancing groups.

Example:

threeforged instance ./assets

Benefits:

- major draw call reduction
- improved rendering performance
- automated detection of repeated assets

Example improvement:

412 trees → 1 draw call

---

## audit

Performs a project-wide performance diagnosis.

Example:

threeforged audit .

The audit tool analyzes scenes and produces:

- performance score
- bottleneck identification
- optimization recommendations
- prioritized action steps

This tool acts as the **decision engine** for the rest of the toolkit.

---

# Example Workflow

Step 1 — Analyze project

threeforged analyze .

Example output:

Meshes: 2,948  
Triangles: 1.9M  
Draw Calls: 2,412  

Recommendations:

- static batching recommended
- LOD recommended
- instancing recommended

---

Step 2 — Optimize scene

threeforged optimize ./assets

---

Step 3 — Instance repeated assets

threeforged instance ./assets

---

Step 4 — Generate LODs

threeforged generate-lod ./assets/models

---

Step 5 — Run performance audit

threeforged audit .

---

# Installation

## Install locally in a project

npm install -D threeforged

Run commands using:

npx threeforged analyze .

---

## Global install (optional)

npm install -g threeforged

Then run:

threeforged analyze .

---

# CLI Architecture

The CLI is implemented using:

- Node.js
- TypeScript
- commander (CLI framework)
- glTF-Transform
- meshoptimizer

---

# Example CLI Entry

packages/cli/src/cli.ts

#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program.name("threeforged");

program.command("analyze").argument("<path>");
program.command("optimize").argument("<path>");
program.command("generate-lod").argument("<path>");
program.command("instance").argument("<path>");
program.command("audit").argument("<path>");
program.command("activate").argument("<license>");

program.parse();

---

# Licensing & Plugin Activation

Some ThreeForged tools are available for free, while others require a valid license.

Free tools can be used immediately after installation.

Paid tools require activation using a license key.

---

## Free Tools

The following command is available to all users:

threeforged analyze

The analyzer helps developers identify optimization opportunities.

---

## Paid Tools

The following commands may require a valid license:

threeforged optimize  
threeforged generate-lod  
threeforged instance  
threeforged audit  

Licenses are purchased from:

https://threeforged.dev

---

# Activating a License

After purchasing a plugin, users receive a license key.

Example:

TF-OPT-8K3D9X-2Q7MPL-4ZN8AR

Activate the license using the CLI:

threeforged activate <license_key>

Example:

threeforged activate TF-OPT-8K3D9X-2Q7MPL-4ZN8AR

The CLI verifies the license with the ThreeForged API and stores it locally.

---

# Local License Storage

After activation, the license is stored locally.

Default location:

~/.threeforged/license.json

Example:

{
  "licenseKey": "TF-OPT-8K3D9X-2Q7MPL-4ZN8AR",
  "products": ["optimizer"],
  "lastVerifiedAt": "2026-03-11T14:00:00Z"
}

This allows the CLI to operate without contacting the server on every command.

---

# License Verification

When running paid commands, the CLI checks whether the required entitlement is present.

Example:

threeforged optimize ./assets

If the license is valid, the command runs normally.

If no license is found, the CLI displays a message:

Optimizer requires a valid license.

Activate a license:

threeforged activate YOUR_LICENSE_KEY

Or purchase a license:

https://threeforged.dev

---

# License Verification Refresh

The CLI periodically re-validates the license with the ThreeForged API.

Recommended strategy:

- verify license during activation
- cache license locally
- refresh verification every few days

This ensures commands run quickly while still allowing license revocation if necessary.

---

# Example Paid Tool Workflow

Install CLI and plugin:

npm install threeforged @threeforged/optimizer

Activate license:

threeforged activate TF-OPT-XXXX

Run tool:

threeforged optimize ./assets

---

# Philosophy

ThreeForged is designed to provide a frictionless developer experience.

Installation should work like any normal npm tool.

Licensing should only require a single activation step.

# Philosophy

ThreeForged is designed to feel like a **professional optimization toolkit**, not just a collection of scripts.

Goals:

- automate tedious optimization tasks
- help developers diagnose performance issues
- provide a unified pipeline for asset optimization
- become the standard toolkit for Three.js performance workflows