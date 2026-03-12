import { describe, it, expect } from 'vitest';
import { isSupportedFormat, detectFormat, formatBytes } from '../src/files.js';

describe('isSupportedFormat', () => {
  it('should return true for .glb files', () => {
    expect(isSupportedFormat('model.glb')).toBe(true);
  });

  it('should return true for .gltf files', () => {
    expect(isSupportedFormat('scene.gltf')).toBe(true);
  });

  it('should return true for .obj files', () => {
    expect(isSupportedFormat('mesh.obj')).toBe(true);
  });

  it('should return false for unsupported formats', () => {
    expect(isSupportedFormat('model.fbx')).toBe(false);
    expect(isSupportedFormat('model.stl')).toBe(false);
    expect(isSupportedFormat('file.txt')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isSupportedFormat('model.GLB')).toBe(true);
    expect(isSupportedFormat('model.Gltf')).toBe(true);
  });
});

describe('detectFormat', () => {
  it('should detect glb format', () => {
    expect(detectFormat('model.glb')).toBe('glb');
  });

  it('should detect gltf format', () => {
    expect(detectFormat('scene.gltf')).toBe('gltf');
  });

  it('should detect obj format', () => {
    expect(detectFormat('mesh.obj')).toBe('obj');
  });

  it('should throw for unsupported formats', () => {
    expect(() => detectFormat('model.fbx')).toThrow('Unsupported file format');
  });
});

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.00 GB');
  });
});
