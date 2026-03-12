import { describe, it, expect } from 'vitest';
import { checkDrawCalls } from '../../src/rules/draw-calls.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(drawCalls: number): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [],
    materials: [],
    textures: [],
    animations: [],
    drawCalls,
    fileSize: 1024,
  };
}

describe('checkDrawCalls', () => {
  it('should return no warnings when under budget', () => {
    const warnings = checkDrawCalls(makeMockDoc(50), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when approaching budget (>75%)', () => {
    // desktop budget is 300, 75% = 225
    // Also triggers info for exceeding mobile budget (100)
    const warnings = checkDrawCalls(makeMockDoc(230), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.severity === 'warn')).toBe(true);
    expect(warnings[0].severity).toBe('warn');
    expect(warnings[0].rule).toBe('draw-calls');
  });

  it('should error when exceeding budget', () => {
    const warnings = checkDrawCalls(makeMockDoc(350), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.severity === 'error')).toBe(true);
  });

  it('should add info for lower-tier profile violation', () => {
    // desktop profile, but exceeds mobile budget of 100
    const config = { ...DEFAULT_AUDITOR_CONFIG, profile: 'desktop' as const };
    const warnings = checkDrawCalls(makeMockDoc(150), config);
    expect(warnings.some((w) => w.severity === 'info' && w.message.includes('mobile'))).toBe(true);
  });

  it('should respect mobile profile thresholds', () => {
    const config = { ...DEFAULT_AUDITOR_CONFIG, profile: 'mobile' as const };
    const warnings = checkDrawCalls(makeMockDoc(110), config);
    expect(warnings.some((w) => w.severity === 'error')).toBe(true);
  });

  it('should handle zero draw calls', () => {
    const warnings = checkDrawCalls(makeMockDoc(0), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });
});
