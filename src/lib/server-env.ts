let _cloudflareEnv: Record<string, string> = {};

export function setCloudflareEnv(env: unknown) {
  if (env && typeof env === "object") {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") {
        _cloudflareEnv[key] = value;
        try {
          if (typeof process !== "undefined" && process.env) {
            process.env[key] = value;
          }
        } catch {
          // ignore if process.env is read-only
        }
      }
    }
  }
}

export function getServerEnv(key: string): string | undefined {
  return _cloudflareEnv[key] || (typeof process !== "undefined" ? process.env[key] : undefined);
}
