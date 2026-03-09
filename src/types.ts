export interface ConfigStorage {
  configs: Record<string, Record<string, string>>;
  activeConfig?: string;
}

export interface ClaudeConfig {
  [key: string]: string;
}

export type OS = 'win32' | 'darwin' | 'linux' | 'unknown';
