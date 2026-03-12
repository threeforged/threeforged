export function formatJson(report: unknown): string {
  return JSON.stringify(report, null, 2);
}
