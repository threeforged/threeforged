import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig, PerformanceProfile } from '../types.js';

const PROFILE_ORDER: PerformanceProfile[] = ['mobile', 'desktop', 'high-end'];

export function checkDrawCalls(
  doc: ParsedDocument,
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];
  const { profile, drawCallThresholds } = config;
  const threshold = drawCallThresholds[profile];
  const drawCalls = doc.drawCalls;

  if (drawCalls > threshold) {
    warnings.push({
      rule: 'draw-calls',
      severity: 'error',
      message: `${drawCalls} draw calls exceed ${profile} budget of ${threshold}`,
    });
  } else if (drawCalls > threshold * 0.75) {
    warnings.push({
      rule: 'draw-calls',
      severity: 'warn',
      message: `${drawCalls} draw calls approaching ${profile} budget of ${threshold} (>${Math.round(threshold * 0.75)})`,
    });
  }

  // Check if this would fail on a lower-tier profile
  const currentIdx = PROFILE_ORDER.indexOf(profile);
  for (let i = 0; i < currentIdx; i++) {
    const lowerProfile = PROFILE_ORDER[i];
    const lowerThreshold = drawCallThresholds[lowerProfile];
    if (drawCalls > lowerThreshold) {
      warnings.push({
        rule: 'draw-calls',
        severity: 'info',
        message: `${drawCalls} draw calls would exceed ${lowerProfile} budget of ${lowerThreshold}`,
      });
      break;
    }
  }

  return warnings;
}
