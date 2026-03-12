import { describe, it, expect } from 'vitest';
import { checkVramUsage } from '../../src/rules/vram-usage.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(opts: {
  vertices?: number;
  gpuMemoryBytes?: number;
}): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [{ name: 'Mesh', triangles: 1000, vertices: opts.vertices ?? 1000, hasIndices: true }],
    materials: [],
    textures: opts.gpuMemoryBytes != null
      ? [{ name: 'Texture', width: 1024, height: 1024, format: 'png', gpuMemoryBytes: opts.gpuMemoryBytes }]
      : [],
    animations: [],
    drawCalls: 1,
    fileSize: 1024,
  };
}

describe('checkVramUsage', () => {
  it('should return no warnings when under budget', () => {
    const warnings = checkVramUsage(makeMockDoc({ vertices: 1000 }), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should error when texture + geometry VRAM exceeds budget', () => {
    // desktop budget is 512MB
    const config = { ...DEFAULT_AUDITOR_CONFIG, profile: 'mobile' as const };
    // 128MB budget; large texture = 130MB
    const warnings = checkVramUsage(
      makeMockDoc({ gpuMemoryBytes: 130 * 1024 * 1024 }),
      config,
    );
    expect(warnings.some((w) => w.severity === 'error')).toBe(true);
  });

  it('should warn when approaching budget (>75%)', () => {
    const config = { ...DEFAULT_AUDITOR_CONFIG, profile: 'mobile' as const };
    // 128MB budget, 75% = 96MB; use ~100MB texture
    const warnings = checkVramUsage(
      makeMockDoc({ gpuMemoryBytes: 100 * 1024 * 1024 }),
      config,
    );
    expect(warnings.some((w) => w.severity === 'warn')).toBe(true);
  });

  it('should handle zero textures', () => {
    const warnings = checkVramUsage(makeMockDoc({ vertices: 100 }), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should guard against NaN gpuMemoryBytes', () => {
    const warnings = checkVramUsage(makeMockDoc({ gpuMemoryBytes: NaN }), DEFAULT_AUDITOR_CONFIG);
    // Should not throw, NaN is treated as 0
    expect(warnings).toBeDefined();
  });

  it('should guard against negative gpuMemoryBytes', () => {
    const warnings = checkVramUsage(makeMockDoc({ gpuMemoryBytes: -1000 }), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toBeDefined();
  });
});
