import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.cccli');
const QUICK_CONFIG_FILE = path.join(CONFIG_DIR, 'quick-configs.json');

/**
 * 快速配置模板接口
 */
export interface QuickConfigTemplate {
  baseUrl: string;
  authKey: 'ANTHROPIC_AUTH_TOKEN' | 'ANTHROPIC_API_KEY';
}

/**
 * 快速配置集合接口
 */
export interface QuickConfigs {
  templates: Record<string, QuickConfigTemplate>;
}

/**
 * 获取默认模板配置
 */
export function getDefaultConfigs(): QuickConfigs {
  return {
    templates: {
      kimi_coding: {
        baseUrl: 'https://api.kimi.com/coding',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
      kimi: {
        baseUrl: 'https://api.moonshot.cn/anthropic',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
      ali_coding: {
        baseUrl: 'https://coding.dashscope.aliyuncs.com/apps/anthropic',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
      poe: {
        baseUrl: 'https://api.poe.com',
        authKey: 'ANTHROPIC_API_KEY',
      },
      zai: {
        baseUrl: 'https://open.bigmodel.cn/api/anthropic',
        authKey: 'ANTHROPIC_API_KEY',
      },
      zai_coding: {
        baseUrl: 'https://open.bigmodel.cn/api/anthropic',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
      minimax: {
        baseUrl: 'https://api.minimaxi.com/anthropic',
        authKey: 'ANTHROPIC_API_KEY',
      },
      minimax_coding: {
        baseUrl: 'https://api.minimaxi.com/anthropic',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
      ark: {
        baseUrl: 'https://ark.cn-beijing.volces.com/api/compatible',
        authKey: 'ANTHROPIC_AUTH_TOKEN',
      },
    },
  };
}

/**
 * 确保配置目录存在
 */
function ensureConfigDirExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * 读取快速配置
 * 如果配置文件不存在，返回默认配置
 */
export function readQuickConfigs(): QuickConfigs {
  try {
    if (!fs.existsSync(QUICK_CONFIG_FILE)) {
      return getDefaultConfigs();
    }

    const content = fs.readFileSync(QUICK_CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content) as QuickConfigs;

    if (!config.templates || typeof config.templates !== 'object') {
      return getDefaultConfigs();
    }

    return config;
  } catch (error) {
    console.error('读取快速配置文件失败:', error);
    return getDefaultConfigs();
  }
}

/**
 * 保存快速配置
 */
export function writeQuickConfigs(configs: QuickConfigs): void {
  ensureConfigDirExists();

  try {
    fs.writeFileSync(
      QUICK_CONFIG_FILE,
      JSON.stringify(configs, null, 2),
      { encoding: 'utf-8' }
    );
  } catch (error) {
    console.error('保存快速配置文件失败:', error);
    throw error;
  }
}

/**
 * 初始化默认快速配置
 */
export function initQuickConfigs(): void {
  ensureConfigDirExists();

  if (fs.existsSync(QUICK_CONFIG_FILE)) {
    console.log(`快速配置文件已存在: ${QUICK_CONFIG_FILE}`);
    console.log('使用 --force 参数可以覆盖现有配置');
    return;
  }

  const defaultConfigs = getDefaultConfigs();
  writeQuickConfigs(defaultConfigs);
  console.log(`✅ 已创建默认快速配置文件: ${QUICK_CONFIG_FILE}`);
  console.log('');
  console.log('可用模板:');
  listQuickConfigs();
}

/**
 * 强制初始化（覆盖现有配置）
 */
export function forceInitQuickConfigs(): void {
  ensureConfigDirExists();

  const defaultConfigs = getDefaultConfigs();
  writeQuickConfigs(defaultConfigs);
  console.log(`✅ 已覆盖快速配置文件: ${QUICK_CONFIG_FILE}`);
  console.log('');
  console.log('可用模板:');
  listQuickConfigs();
}

/**
 * 列出所有可用的模板
 */
export function listQuickConfigs(): void {
  const configs = readQuickConfigs();
  const templates = Object.entries(configs.templates);

  if (templates.length === 0) {
    console.log('  (暂无模板)');
    return;
  }

  templates.forEach(([name, template]) => {
    console.log(`  ${name}:`);
    console.log(`    baseUrl: ${template.baseUrl}`);
    console.log(`    authKey: ${template.authKey}`);
  });
}

/**
 * 获取模板列表（用于补全）
 */
export function getTemplateNames(): string[] {
  const configs = readQuickConfigs();
  return Object.keys(configs.templates);
}

/**
 * 获取指定模板
 */
export function getTemplate(name: string): QuickConfigTemplate | null {
  const configs = readQuickConfigs();
  return configs.templates[name] || null;
}

/**
 * 检查模板是否存在
 */
export function templateExists(name: string): boolean {
  const configs = readQuickConfigs();
  return name in configs.templates;
}
