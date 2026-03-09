import { addConfigItem, getConfig, configExists } from '../config/storage';

// 互斥的认证 key 组
const AUTH_KEYS = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY'];

// 可智能补全的配置 key 列表
const COMPLETABLE_KEYS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_REASONING_MODEL',
];

/**
 * 检查是否存在认证冲突
 * @param configName 配置名称
 * @param newKey 要设置的新 key
 * @returns 如果存在冲突，返回冲突的 key 名称；否则返回 null
 */
function checkAuthConflict(configName: string, newKey: string): string | null {
  // 如果要设置的 key 不是认证 key，不需要检查冲突
  if (!AUTH_KEYS.includes(newKey)) {
    return null;
  }

  // 获取当前配置
  const existingConfig = getConfig(configName);
  if (!existingConfig) {
    return null;
  }

  const existingKeys = Object.keys(existingConfig);

  // 检查是否存在其他认证 key
  for (const authKey of AUTH_KEYS) {
    if (authKey !== newKey && existingKeys.includes(authKey)) {
      return authKey;
    }
  }

  return null;
}

/**
 * 查找匹配的 key 补全建议
 * @param input 用户输入的 key
 * @returns 匹配结果数组
 */
function findKeyCompletions(input: string): string[] {
  const upperInput = input.toUpperCase();
  return COMPLETABLE_KEYS.filter(key =>
    key.toUpperCase().startsWith(upperInput)
  );
}

/**
 * 检查 key 是否需要补全提示
 * @param key 用户输入的 key
 * @returns 如果 key 不在 COMPLETABLE_KEYS 中，返回补全建议；否则返回 null
 */
function suggestKeyCompletion(key: string): string[] | null {
  // 如果 key 已经在可补全列表中，不需要提示
  if (COMPLETABLE_KEYS.includes(key)) {
    return null;
  }

  // 查找匹配的补全建议
  const matches = findKeyCompletions(key);

  if (matches.length > 0) {
    return matches;
  }

  return null;
}

export function setCommand(args: string[]): void {
  if (args.length < 3) {
    console.error('错误: 参数不足');
    console.error('');
    console.error('用法: cc set <config_name> <key> <value>');
    console.error('');
    console.error('示例:');
    console.error('  cc set kimi ANTHROPIC_AUTH_TOKEN sk-xxxxx');
    console.error('  cc set kimi ANTHROPIC_BASE_URL https://api.kimi.com/coding/');
    process.exit(1);
  }

  const [configName, key, ...valueParts] = args;
  const value = valueParts.join(' ');

  // 检查 key 是否需要补全提示
  const suggestions = suggestKeyCompletion(key);
  if (suggestions) {
    console.error(`错误: 未知的配置项 "${key}"`);
    console.error('');

    if (suggestions.length === 1) {
      // 只有一个匹配项，直接提示
      console.error(`您可能想输入: ${suggestions[0]}`);
    } else {
      // 多个匹配项，列出所有可能
      console.error('可能的配置项:');
      suggestions.forEach(suggestion => {
        console.error(`  - ${suggestion}`);
      });
    }

    console.error('');
    console.error('所有可用的配置项:');
    COMPLETABLE_KEYS.forEach(k => {
      console.error(`  - ${k}`);
    });
    process.exit(1);
  }

  // 检查认证冲突
  const conflictKey = checkAuthConflict(configName, key);
  if (conflictKey) {
    console.error(`错误: 认证方式冲突`);
    console.error('');
    console.error(`当前配置已存在 "${conflictKey}"，无法同时设置 "${key}"`);
    console.error('ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 只能选择一个使用');
    console.error('');
    console.error('解决方法:');
    console.error(`  1. 先删除现有的 "${conflictKey}" 配置`);
    console.error(`  2. 或者使用 "cc set ${configName} ${key} <value>" 覆盖（需要手动删除冲突项）`);
    process.exit(1);
  }

  try {
    // 如果配置不存在，自动创建
    if (!configExists(configName)) {
      console.log(`配置 "${configName}" 不存在，将自动创建`);
    }

    addConfigItem(configName, key, value);
    console.log(`✅ 已设置配置: ${configName}.${key}`);
  } catch (error) {
    console.error('设置配置失败:', error);
    process.exit(1);
  }
}
