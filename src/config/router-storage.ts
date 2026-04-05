import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { RouterConfig, RoutersStorage } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.cccli');
const ROUTERS_FILE = path.join(CONFIG_DIR, 'routers.json');

/**
 * 确保路由配置存储文件存在
 */
export function ensureRoutersStorageExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(ROUTERS_FILE)) {
    const initialStorage: RoutersStorage = { routers: {} };
    fs.writeFileSync(ROUTERS_FILE, JSON.stringify(initialStorage, null, 2), 'utf-8');
  }
}

/**
 * 读取路由配置存储
 */
export function readRoutersStorage(): RoutersStorage {
  ensureRoutersStorageExists();
  const content = fs.readFileSync(ROUTERS_FILE, 'utf-8');
  return JSON.parse(content) as RoutersStorage;
}

/**
 * 写入路由配置存储
 */
export function writeRoutersStorage(storage: RoutersStorage): void {
  ensureRoutersStorageExists();
  fs.writeFileSync(ROUTERS_FILE, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * 获取指定名称的路由配置
 */
export function getRouterConfig(name: string): RouterConfig | undefined {
  const storage = readRoutersStorage();
  return storage.routers[name];
}

/**
 * 保存路由配置
 */
export function saveRouterConfig(config: RouterConfig): void {
  const storage = readRoutersStorage();
  storage.routers[config.name] = config;
  writeRoutersStorage(storage);
}

/**
 * 删除路由配置
 */
export function deleteRouterConfig(name: string): boolean {
  const storage = readRoutersStorage();
  if (!storage.routers[name]) {
    return false;
  }
  delete storage.routers[name];
  writeRoutersStorage(storage);
  return true;
}

/**
 * 列出所有路由配置
 */
export function listRouterConfigs(): RouterConfig[] {
  const storage = readRoutersStorage();
  return Object.values(storage.routers);
}

/**
 * 检查路由配置是否存在
 */
export function routerConfigExists(name: string): boolean {
  const storage = readRoutersStorage();
  return !!storage.routers[name];
}
