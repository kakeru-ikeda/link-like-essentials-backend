export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getOptionalEnvVar(
  key: string,
  defaultValue?: string
): string | undefined {
  return process.env[key] ?? defaultValue;
}
