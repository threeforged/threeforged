import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, loadConfig } from '../src/config.js';

describe('DEFAULT_CONFIG', () => {
  it('should have sensible default thresholds', () => {
    expect(DEFAULT_CONFIG.polyCountThresholds.medium).toBe(50_000);
    expect(DEFAULT_CONFIG.polyCountThresholds.large).toBe(100_000);
    expect(DEFAULT_CONFIG.maxTextureSize).toBe(4096);
    expect(DEFAULT_CONFIG.maxTextureMB).toBe(64);
  });

  it('should support glb, gltf, and obj formats', () => {
    expect(DEFAULT_CONFIG.supportedFormats).toContain('glb');
    expect(DEFAULT_CONFIG.supportedFormats).toContain('gltf');
    expect(DEFAULT_CONFIG.supportedFormats).toContain('obj');
  });
});

describe('loadConfig', () => {
  it('should return default config when no config file exists', async () => {
    const config = await loadConfig('/nonexistent/path/threeforged.config.js');
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('should return default config when called without arguments', async () => {
    const config = await loadConfig();
    expect(config.polyCountThresholds).toEqual(DEFAULT_CONFIG.polyCountThresholds);
  });
});
