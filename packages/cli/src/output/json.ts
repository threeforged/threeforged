import type { AssetReport } from '@threeforged/core';

export function formatJson(report: AssetReport): string {
  return JSON.stringify(report, null, 2);
}
