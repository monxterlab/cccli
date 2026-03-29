import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

/**
 * 互斥的认证 key 组
 */
const AUTH_TOKEN_KEY = 'ANTHROPIC_AUTH_TOKEN';
const API_KEY_KEY = 'ANTHROPIC_API_KEY';
const AUTH_KEYS = [AUTH_TOKEN_KEY, API_KEY_KEY];

/**
 * 配置接口定义
 */
export interface Config {
  name: string;
  settings: Record<string, any>;
}

/**
 * 获取 Claude Code 配置文件的路径。
 *
 * 根据操作系统的不同，返回不同的配置文件路径：
 * - Windows: `%USERPROFILE%\.claude\settings.json` (例如 `C:\Users\{username}\.claude\settings.json`)
 * - macOS/Linux: `~/.claude/settings.json` (解析为绝对路径)
 *
 * @returns {string} Claude 配置文件的绝对路径
 * @throws {Error} 当无法获取用户主目录时抛出错误
 *
 * @example
 * ```typescript
 * const configPath = getClaudeConfigPath();
 * console.log(configPath); // Windows: "C:\\Users\\username\\.claude\\settings.json"
 *                          // macOS/Linux: "/home/username/.claude/settings.json"
 * ```
 */
export function getClaudeConfigPath(): string {
  const homeDir = os.homedir();

  if (!homeDir) {
    throw new Error(
      'Unable to determine user home directory. ' +
      'Please ensure the HOME environment variable is set (macOS/Linux) ' +
      'or USERPROFILE is set (Windows).'
    );
  }

  const configPath = path.join(homeDir, '.claude', 'settings.json');

  return configPath;
}

/**
 * 获取 Claude Code 配置目录的路径。
 *
 * @returns {string} 配置目录的绝对路径 (例如 `~/.claude`)
 * @throws {Error} 当无法获取用户主目录时抛出错误
 */
export function getClaudeConfigDir(): string {
  const homeDir = os.homedir();

  if (!homeDir) {
    throw new Error(
      'Unable to determine user home directory. ' +
      'Please ensure the HOME environment variable is set (macOS/Linux) ' +
      'or USERPROFILE is set (Windows).'
    );
  }

  return path.join(homeDir, '.claude');
}

/**
 * 读取 Claude Code 配置文件
 *
 * 读取用户主目录下的 `.claude/settings.json` 文件。如果文件不存在，返回空对象。
 *
 * @returns {Promise<Record<string, any>>} 配置对象，文件不存在时返回空对象 `{}`
 * @throws {Error} 权限错误或 JSON 解析错误时抛出友好错误消息
 *
 * @example
 * ```typescript
 * const config = await readClaudeConfig();
 * console.log(config); // { "theme": "dark", "fontSize": 14 }
 * ```
 */
export async function readClaudeConfig(): Promise<Record<string, any>> {
  const configPath = getClaudeConfigPath();

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as Record<string, any>;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }

    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw new Error(
        `权限错误: 无法读取 Claude Code 配置文件 (${configPath})，请检查文件权限`
      );
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `JSON 解析错误: Claude Code 配置文件 (${configPath}) 格式无效，请检查文件内容是否为有效的 JSON`
      );
    }

    throw new Error(`读取 Claude Code 配置文件失败: ${error.message}`);
  }
}

/**
 * 将配置写入 Claude Code 配置文件
 *
 * 将配置对象写入用户主目录下的 `.claude/settings.json` 文件，使用 2 空格缩进格式化 JSON。
 * 如果 `.claude` 目录不存在，会自动创建。
 *
 * @param {Record<string, any>} config - 要写入的配置对象
 * @returns {Promise<void>}
 * @throws {Error} 权限错误、磁盘写入错误时抛出友好错误消息
 *
 * @example
 * ```typescript
 * await writeClaudeConfig({ theme: 'dark', fontSize: 14 });
 * ```
 */
export async function writeClaudeConfig(config: Record<string, any>): Promise<void> {
  const configPath = getClaudeConfigPath();

  try {
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
  } catch (error: any) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw new Error(
        `权限错误: 无法写入 Claude Code 配置文件 (${configPath})，请检查目录权限`
      );
    }

    if (error.code === 'ENOSPC') {
      throw new Error(
        `磁盘空间不足: 无法写入 Claude Code 配置文件 (${configPath})`
      );
    }

    if (error.code === 'EISDIR') {
      throw new Error(
        `写入错误: 配置文件路径 (${configPath}) 是一个目录，而非文件`
      );
    }

    throw new Error(`写入 Claude Code 配置文件失败: ${error.message}`);
  }
}

/**
 * 模型相关配置字段列表
 * 这些字段在激活新配置时，如果新配置中未设置，会从现有配置中移除
 */
const MODEL_KEYS = [
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
];

/**
 * 将指定配置应用到 Claude Code 配置的 env 对象中
 *
 * 读取现有 Claude Code 配置，将新配置的 `settings` 内容合并到 `env` 对象中。
 * 如果 `env` 对象不存在，会自动创建。只覆盖配置相关的 key，保留其他原有内容。
 *
 * 同时处理 ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 的互斥逻辑：
 * - 如果新配置包含 ANTHROPIC_AUTH_TOKEN，将删除已有的 ANTHROPIC_API_KEY
 * - 如果新配置包含 ANTHROPIC_API_KEY，将删除已有的 ANTHROPIC_AUTH_TOKEN
 * - 拒绝激活同时包含两个认证方式的配置
 *
 * 同时处理模型字段的清理逻辑：
 * - 如果新配置中没有设置某些模型字段，会从现有配置中移除这些字段
 * - 避免旧配置中的模型设置影响新配置的行为
 *
 * @param {string} configName - 配置名称（用于错误提示）
 * @param {Config} config - 包含 settings 的配置对象
 * @returns {Promise<void>}
 * @throws {Error} 配置无效、读取失败或写入失败时抛出错误
 *
 * @example
 * ```typescript
 * await applyConfigToClaude('myConfig', {
 *   name: 'myConfig',
 *   settings: { ANTHROPIC_AUTH_TOKEN: 'xxx', ANTHROPIC_BASE_URL: 'https://...' }
 * });
 * // 结果: settings.json 中的 env 对象将包含这些配置
 * ```
 */
export async function applyConfigToClaude(configName: string, config: Config): Promise<void> {
  if (!config || typeof config !== 'object') {
    throw new Error(`配置 "${configName}" 无效: 配置必须是一个对象`);
  }

  if (!config.settings || typeof config.settings !== 'object') {
    throw new Error(`配置 "${configName}" 无效: 缺少 settings 属性或类型不正确`);
  }

  // 检查配置中是否同时包含两个认证 key
  const hasAuthToken = AUTH_TOKEN_KEY in config.settings;
  const hasApiKey = API_KEY_KEY in config.settings;

  if (hasAuthToken && hasApiKey) {
    throw new Error(
      `配置 "${configName}" 无效: 不能同时包含 ${AUTH_TOKEN_KEY} 和 ${API_KEY_KEY}`
    );
  }

  try {
    const existingConfig = await readClaudeConfig();

    // 准备新的 env 对象
    const newEnv: Record<string, any> = {
      ...existingConfig.env,
    };

    // 处理互斥逻辑：如果新配置包含某个认证方式，删除现有的冲突认证方式
    if (hasAuthToken && API_KEY_KEY in newEnv) {
      delete newEnv[API_KEY_KEY];
      console.log(`ℹ️  已移除冲突的认证方式: ${API_KEY_KEY}`);
    }

    if (hasApiKey && AUTH_TOKEN_KEY in newEnv) {
      delete newEnv[AUTH_TOKEN_KEY];
      console.log(`ℹ️  已移除冲突的认证方式: ${AUTH_TOKEN_KEY}`);
    }

    // 处理模型字段清理：如果新配置中没有设置某些模型字段，从现有配置中移除
    for (const modelKey of MODEL_KEYS) {
      if (!(modelKey in config.settings) && modelKey in newEnv) {
        delete newEnv[modelKey];
        console.log(`ℹ️  已清理模型配置: ${modelKey}`);
      }
    }

    // 合并新配置
    Object.assign(newEnv, config.settings);

    const updatedConfig: Record<string, any> = {
      ...existingConfig,
      env: newEnv,
    };

    await writeClaudeConfig(updatedConfig);
  } catch (error: any) {
    if (error.message && (
      error.message.includes('权限错误') ||
      error.message.includes('JSON 解析错误') ||
      error.message.includes('磁盘空间不足') ||
      error.message.includes('不能同时包含')
    )) {
      throw error;
    }
    throw new Error(`应用配置 "${configName}" 到 Claude Code 失败: ${error.message}`);
  }
}
