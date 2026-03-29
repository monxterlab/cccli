import { configExists, getConfig } from '../config/storage';

// 优先级配置项，按顺序排在前面
const PRIORITY_KEYS = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY'];

function maskSensitiveValue(key: string, value: string): string {
  const sensitiveKeys = ['token', 'key', 'secret', 'password', 'auth'];
  const isSensitive = sensitiveKeys.some(sk => key.toLowerCase().includes(sk));

  if (!isSensitive || value.length < 12) {
    return value;
  }

  const prefix = value.slice(0, 8);
  const suffix = value.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * 按优先级排序配置项
 * ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 始终排在第一和第二位
 * 其他配置项按字母顺序排列
 */
function sortConfigEntries(entries: [string, string][]): [string, string][] {
  return entries.sort(([keyA], [keyB]) => {
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
}

/**
 * 查看配置详情
 * @param args 命令参数
 */
export function getCommand(args: string[]): void {
  if (args.length < 1) {
    console.error('错误: 请指定配置名称');
    console.error('');
    console.error('用法: cccli get <config_name>');
    console.error('');
    console.error('示例:');
    console.error('  cccli get kimi');
    process.exit(1);
  }

  const configName = args[0];

  if (!configExists(configName)) {
    console.error(`错误: 配置 "${configName}" 不存在`);
    console.error('使用 "cccli list" 查看所有可用配置');
    process.exit(1);
  }

  const config = getConfig(configName);
  if (!config) {
    console.error(`错误: 无法读取配置 "${configName}"`);
    process.exit(1);
  }

  console.log(`配置名称: ${configName}`);
  console.log('配置项:');

  const entries = Object.entries(config);
  if (entries.length === 0) {
    console.log('  (无配置项)');
  } else {
    // 按优先级排序后显示
    const sortedEntries = sortConfigEntries(entries);
    sortedEntries.forEach(([key, value]) => {
      const displayValue = maskSensitiveValue(key, value);
      console.log(`  ${key}: ${displayValue}`);
    });
  }
}
