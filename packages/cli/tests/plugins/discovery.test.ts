import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { discoverPlugins } from '../../src/plugins/discovery.js';

describe('discoverPlugins', () => {
  it('should not throw when no plugins exist', async () => {
    const program = new Command();
    await expect(discoverPlugins(program)).resolves.toBeUndefined();
  });
});
