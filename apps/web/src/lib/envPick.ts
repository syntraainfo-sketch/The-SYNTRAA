/** First set, non-empty trimmed value (supports alternate Vercel / template key names). */
export function firstEnv(...keys: string[]): string {
  for (const key of keys) {
    const v = process.env[key];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return "";
}
