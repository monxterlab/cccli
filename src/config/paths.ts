import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { OS, ClaudeConfig } from '../types';

export function getOS(): OS {
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return 'win32';
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
}

export function getClaudeConfigPath(): string | null {
  const osType = getOS();

  switch (osType) {
    case 'win32': {
      const appData = process.env.APPDATA;
      if (appData) {
        return path.join(appData, 'Claude', 'settings.json');
      }
      return null;
    }
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'settings.json');
    case 'linux':
      return path.join(os.homedir(), '.config', 'Claude', 'settings.json');
    default:
      return null;
  }
}

export function readClaudeConfig(): ClaudeConfig {
  const configPath = getClaudeConfigPath();

  if (!configPath) {
    throw new Error('无法检测当前操作系统的 Claude Code 配置路径');
  }

  try {
    if (!fs.existsSync(configPath)) {
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      return {};
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as ClaudeConfig;
  } catch (error) {
    console.error('读取 Claude Code 配置失败:', error);
    return {};
  }
}

export function writeClaudeConfig(config: ClaudeConfig): void {
  const configPath = getClaudeConfigPath();

  if (!configPath) {
    throw new Error('无法检测当前操作系统的 Claude Code 配置路径');
  }

  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
  } catch (error) {
    console.error('写入 Claude Code 配置失败:', error);
    throw error;
  }
}

export function applyConfigToClaude(configName: string, config: Record<string, string>): void {
  const claudeConfig = readClaudeConfig();

  Object.entries(config).forEach(([key, value]) => {
    claudeConfig[key] = value;
  });

  writeClaudeConfig(claudeConfig);
}
