import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.cccli');
const PROCESS_FILE = path.join(CONFIG_DIR, 'router-processes.json');

/**
 * 运行中的路由进程信息
 */
export interface RouterProcess {
  name: string;
  pid: number;
  port: number;
  routerUrl: string;
  startTime: string;
  originalConfig?: Record<string, any>; // 保存启动前的 Claude 配置
}

/**
 * 进程存储结构
 */
interface ProcessStorage {
  processes: Record<string, RouterProcess>;
}

/**
 * 确保存储文件存在
 */
function ensureStorageExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(PROCESS_FILE)) {
    const initialStorage: ProcessStorage = { processes: {} };
    fs.writeFileSync(PROCESS_FILE, JSON.stringify(initialStorage, null, 2), 'utf-8');
  }
}

/**
 * 读取进程存储
 */
function readStorage(): ProcessStorage {
  ensureStorageExists();
  const content = fs.readFileSync(PROCESS_FILE, 'utf-8');
  return JSON.parse(content) as ProcessStorage;
}

/**
 * 写入进程存储
 */
function writeStorage(storage: ProcessStorage): void {
  ensureStorageExists();
  fs.writeFileSync(PROCESS_FILE, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * 保存运行中的进程
 */
export function saveRouterProcess(process: RouterProcess): void {
  const storage = readStorage();
  storage.processes[process.name] = process;
  writeStorage(storage);
}

/**
 * 获取运行中的进程
 */
export function getRouterProcess(name: string): RouterProcess | undefined {
  const storage = readStorage();
  return storage.processes[name];
}

/**
 * 删除进程记录
 */
export function removeRouterProcess(name: string): void {
  const storage = readStorage();
  delete storage.processes[name];
  writeStorage(storage);
}

/**
 * 列出所有运行中的进程
 */
export function listRouterProcesses(): RouterProcess[] {
  const storage = readStorage();
  return Object.values(storage.processes);
}

/**
 * 检查进程是否正在运行
 */
export function isProcessRunning(pid: number): boolean {
  try {
    // 向进程发送信号 0 来检查是否存在
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * 清理已停止的进程记录
 */
export function cleanStoppedProcesses(): void {
  const storage = readStorage();
  let hasChanges = false;

  for (const [name, proc] of Object.entries(storage.processes)) {
    if (!isProcessRunning(proc.pid)) {
      delete storage.processes[name];
      hasChanges = true;
    }
  }

  if (hasChanges) {
    writeStorage(storage);
  }
}

/**
 * 保存原始 Claude 配置（用于恢复）
 */
export function saveOriginalClaudeConfig(name: string, config: Record<string, any>): void {
  const storage = readStorage();
  if (storage.processes[name]) {
    storage.processes[name].originalConfig = config;
    writeStorage(storage);
  }
}

/**
 * 获取原始 Claude 配置
 */
export function getOriginalClaudeConfig(name: string): Record<string, any> | undefined {
  const storage = readStorage();
  return storage.processes[name]?.originalConfig;
}
