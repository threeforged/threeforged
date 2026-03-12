# ThreeForged Performance Auditor

## Overview

ThreeForged Performance Auditor is a full-scene and project-wide diagnostics tool for Three.js and HYTOPIA games.

It acts like a performance auditing system for browser-based 3D projects by analyzing assets, scenes, and optimization opportunities and producing a high-level performance health report.

This tool is intended to become:

"Lighthouse for Three.js games"

Instead of just reporting raw metrics, the Auditor helps developers understand:

- what is slowing their project down
- which issues matter most
- what actions should be taken first
- which ThreeForged tools can fix those issues

---

## Core Purpose

Most developers do not need more raw numbers.

They need answers to questions like:

- Why is my scene slow?
- Is the biggest problem draw calls or triangles?
- Are my textures too large?
- Should I use batching, instancing, or LOD?
- Which assets are the worst offenders?
- What should I fix first?

The Performance Auditor is designed to answer those questions clearly.

---

## How It Differs From the Asset Analyzer

Asset Analyzer is the free gateway tool.

It reports:

- mesh counts
- triangle counts
- materials
- textures
- estimated draw calls

Performance Auditor goes further.

It adds:

- bottleneck identification
- scene health scoring
- prioritized recommendations
- optimization pathway suggestions
- estimated risk categories
- project-wide performance summaries

Analyzer tells developers what exists.

Auditor tells developers what matters.

---

## CLI Usage

Audit a single scene:

threeforged audit ./assets/world.glb

Audit a folder:

threeforged audit ./assets

Audit an entire project:

threeforged audit .

---

## Example Output

ThreeForged Performance Audit

Project Score: 64 / 100  
Performance Risk: High

Summary:

- Draw calls significantly above recommended range
- Several large textures detected
- Repeated meshes not instanced
- Large distant assets missing LOD
- Static environment objects not batched

Top Issues:

1. Draw call pressure is the largest bottleneck
2. Texture memory usage is excessive
3. LOD missing on large assets
4. Repeated props should be instanced

Recommended Actions:

1. Run threeforged optimize ./assets
2. Run threeforged instance ./assets
3. Run threeforged generate-lod ./assets/models
4. Resize or compress 4096 textures

---

## Key Value Proposition

The Auditor turns raw data into decisions.

This makes it a much stronger strategic tool than a simple analyzer.

It can become:

- a premium diagnostics tool
- a project health checker
- a CI performance gate
- a decision engine for the rest of the ThreeForged ecosystem

---

## MVP Goals

The MVP should do six things well:

1. scan a file, folder, or project
2. aggregate analyzer-like metrics
3. identify likely performance bottlenecks
4. rank issues by severity
5. recommend specific next actions
6. generate human-readable and JSON reports

---

## Core Report Categories

### 1. Scene Complexity

Measures:

- total meshes
- total triangles
- materials
- textures
- large assets
- repeated assets

This gives the overall scale of the scene or project.

---

### 2. Draw Call Risk

Estimates render submission pressure based on:

- mesh count
- material fragmentation
- repeated unbatched assets
- repeated uninstanced assets

Example:

Draw Call Risk: High

Reason:

- 2,412 estimated draw calls
- 412 repeated mesh opportunities
- many small static objects rendered individually

---

### 3. Geometry Risk

Measures:

- total triangle count
- largest mesh counts
- oversized hero assets
- lack of LOD on distant models

Example:

Geometry Risk: Medium

Reason:

- Total triangle count acceptable
- 6 individual assets exceed ideal range
- LOD recommended on 12 large assets

---

### 4. Texture Memory Risk

Measures:

- large textures
- duplicate textures
- oversized texture resolutions
- texture count and estimated memory impact

Example:

Texture Risk: High

Reason:

- 14 textures at 4096 resolution
- several duplicate normal maps
- estimated texture memory exceeds ideal target

---

### 5. Scene Scalability Risk

Measures how likely the scene is to degrade badly as it grows.

Signals include:

- high repeated asset counts
- lack of instancing
- lack of batching
- no LOD usage
- material explosion

This is important because some projects still run acceptably now but will collapse later as content expands.

---

### 6. Optimization Opportunity Summary

The Auditor should recommend categories like:

- static batching
- instancing
- LOD generation
- texture optimization
- atlas generation
- material consolidation

---

## Example Project Score Model

The MVP can produce a simple weighted score:

100 = excellent  
80–99 = healthy  
60–79 = needs improvement  
40–59 = high risk  
0–39 = severe risk

This score should be based on weighted inputs such as:

- draw calls
- triangles
- texture pressure
- material count
- repeated mesh inefficiency
- missing LOD candidates

The exact weighting can evolve over time.

---

## Example JSON Output

{
  "projectScore": 64,
  "riskLevel": "high",
  "summary": {
    "meshes": 2948,
    "triangles": 1920320,
    "materials": 181,
    "textures": 94,
    "drawCalls": 2412
  },
  "risks": {
    "drawCalls": "high",
    "geometry": "medium",
    "textures": "high",
    "scalability": "high"
  },
  "recommendations": [
    "Run static optimizer",
    "Generate LODs for large assets",
    "Instance repeated props",
    "Reduce oversized textures"
  ]
}

---

## CLI Options

Basic usage:

threeforged audit .

Output JSON:

threeforged audit . --report json

Output both terminal and JSON:

threeforged audit . --report both

Save to custom output:

threeforged audit . --out ./reports/audit.json

---

## Relationship to Other ThreeForged Tools

The Performance Auditor should sit above the rest of the product line.

Recommended flow:

1. Developer runs threeforged analyze .
2. Developer runs threeforged audit .
3. Auditor recommends:
   - threeforged optimize
   - threeforged instance
   - threeforged generate-lod
   - texture optimization steps

This makes the Auditor a strategic orchestration layer for the ecosystem.

---

## Technical Stack

Recommended stack:

- Node.js
- TypeScript
- commander
- zod
- glTF-Transform
- Three.js
- internal metrics from analyzer package

The Auditor should reuse infrastructure from:

- analyzer
- optimizer heuristics
- instancing candidate detection
- LOD candidate detection

---

## Recommended Repository Location

packages/auditor

Suggested structure:

packages/auditor/

src/
  auditProject.ts
  scoring/
    scoreProject.ts
    classifyRisk.ts
  recommendations/
    generateRecommendations.ts
    prioritizeActions.ts
  report/
    generateAuditReport.ts

package.json

---

## MVP Build Phases

### Phase 1 — Aggregated Audit Report

Build:

- pull analyzer metrics together
- classify major risk areas
- generate terminal summary
- export JSON

Deliverable:

First working project-wide audit report.

---

### Phase 2 — Recommendation Engine

Build:

- prioritized next steps
- recommendation logic
- action ranking

Deliverable:

Auditor that explains what to do next.

---

### Phase 3 — Scoring System

Build:

- scene/project score
- health classification
- weighted performance categories

Deliverable:

A more opinionated and premium-feeling report.

---

### Phase 4 — CI / Regression Support

Add later:

- compare reports over time
- fail builds when metrics exceed thresholds
- support project budgets

This could become one of the most valuable premium features.

---

## Why This Product Is Powerful

This tool is strategically important because it moves ThreeForged from:

"a set of optimization commands"

to:

"a complete performance decision platform"

It becomes much easier to market because it answers:

What is wrong?  
How bad is it?  
What should I do first?

---

## Pricing Positioning

This tool could be:

### Option A — premium paid tool

Because it provides decision support and orchestration.

### Option B — pro bundle feature

Included in:

ThreeForged Pro  
ThreeForged Performance Suite

### Option C — limited free version

Free:

- raw audit summary
- basic scoring

Paid:

- advanced recommendations
- JSON export
- CI integration
- threshold budgets
- regression comparisons

---

## Best Positioning Statement

ThreeForged Performance Auditor is a project-wide diagnostics and decision tool for Three.js and HYTOPIA games that identifies performance bottlenecks, scores scene health, and recommends the highest-impact optimization actions.