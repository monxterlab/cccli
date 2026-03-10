import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigStorage } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.cccli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'configs.json');

// 优先级配置项，按顺序排在前面
const PRIORITY_KEYS = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY'];

export function getStoragePath(): string {
  return CONFIG_FILE;
}

/**
 * 对配置项的 key 进行排序
 * ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 始终排在第一和第二位
 * 其他配置项按字母顺序排列
 */
function sortConfigKeys(config: Record<string, string>): Record<string, string> {
  const sortedKeys = Object.keys(config).sort((keyA, keyB) => {
    const indexA = PRIORITY_KEYS.indexOf(keyA);
    const indexB = PRIORITY_KEYS.indexOf(keyB);

    // 如果两个都是优先级 key，按优先级顺序排列
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // 如果只有 A 是优先级 key，A 排在前面
    if (indexA !== -1) {
      return -1;
    }

    // 如果只有 B 是优先级 key，B 排在前面
    if (indexB !== -1) {
      return 1;
    }

    // 都不是优先级 key，按字母顺序排列
    return keyA.localeCompare(keyB);
  });

  // 创建新的有序对象
  const sortedConfig: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedConfig[key] = config[key];
  }

  return sortedConfig;
}

export function ensureStorageExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    const initialStorage: ConfigStorage = { configs: {} };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialStorage, null, 2), { encoding: 'utf-8' });
  }
}

export function readStorage(): ConfigStorage {
  ensureStorageExists();

  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const data = JSON.parse(content) as ConfigStorage;

    if (!data.configs || typeof data.configs !== 'object') {
      return { configs: {} };
    }

    return data;
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return { configs: {} };
  }
}

export function writeStorage(storage: ConfigStorage): void {
  ensureStorageExists();

  try {
    // 对所有配置的 key 进行排序
    const sortedStorage: ConfigStorage = {
      configs: {},
      activeConfig: storage.activeConfig,
    };

    for (const [configName, config] of Object.entries(storage.configs)) {
      sortedStorage.configs[configName] = sortConfigKeys(config);
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(sortedStorage, null, 2), { encoding: 'utf-8' });
  } catch (error) {
    console.error('写入配置文件失败:', error);
    throw error;
  }
}

export function configExists(configName: string): boolean {
  const storage = readStorage();
  return configName in storage.configs;
}

export function getConfig(configName: string): Record<string, string> | null {
  const storage = readStorage();
  return storage.configs[configName] || null;
}

export function setConfig(configName: string, config: Record<string, string>): void {
  const storage = readStorage();
  storage.configs[configName] = config;
  writeStorage(storage);
}

export function updateConfigItem(configName: string, key: string, value: string): void {
  const storage = readStorage();

  if (!storage.configs[configName]) {
    throw new Error(`配置 "${configName}" 不存在`);
  }

  storage.configs[configName][key] = value;
  writeStorage(storage);
}

export function addConfigItem(configName: string, key: string, value: string): void {
  const storage = readStorage();

  if (!storage.configs[configName]) {
    storage.configs[configName] = {};
  }

  storage.configs[configName][key] = value;
  writeStorage(storage);
}

export function setActiveConfig(configName: string): void {
  const storage = readStorage();
  storage.activeConfig = configName;
  writeStorage(storage);
}

export function getActiveConfig(): string | undefined {
  const storage = readStorage();
  return storage.activeConfig;
}

export function listConfigs(): string[] {
  const storage = readStorage();
  return Object.keys(storage.configs);
}

export function getAllConfigs(): Record<string, Record<string, string>> {
  const storage = readStorage();
  return storage.configs;
}

/**
 * 删除指定配置
 * @param configName 配置名称
 * @returns 是否删除成功
 */
export function deleteConfig(configName: string): boolean {
  const storage = readStorage();

  if (!(configName in storage.configs)) {
    return false;
  }

  delete storage.configs[configName];

  // 如果删除的是当前激活的配置，清除 activeConfig
  if (storage.activeConfig === configName) {
    delete storage.activeConfig;
  }

  writeStorage(storage);
  return true;
}
