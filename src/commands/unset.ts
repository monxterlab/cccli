import { deleteConfig, configExists, getConfig } from '../config/storage';

/**
 * 显示使用说明
 */
function showUsage(): void {
  console.log('删除配置命令');
  console.log('');
  console.log('用法:');
  console.log('  cccli unset <config_name>       删除指定名称的配置');
  console.log('  cccli unset <config_name> --force  强制删除，不提示确认');
  console.log('');
  console.log('示例:');
  console.log('  cccli unset kimi                删除名为 kimi 的配置');
  console.log('  cccli unset kimi --force        强制删除 kimi 配置');
  console.log('');
  console.log('注意: 删除操作不可恢复，请谨慎操作');
}

/**
 * 显示配置预览
 */
function showConfigPreview(configName: string): void {
  const config = getConfig(configName);
  if (!config) {
    return;
  }

  console.log('');
  console.log(`配置 "${configName}" 的内容:`);
  console.log('─'.repeat(50));

  const entries = Object.entries(config);
  if (entries.length === 0) {
    console.log('  (空配置)');
  } else {
    for (const [key, value] of entries) {
      const displayValue = key.includes('TOKEN') || key.includes('KEY')
        ? maskSensitiveValue(value)
        : value;
      console.log(`  ${key} = ${displayValue}`);
    }
  }

  console.log('─'.repeat(50));
}

/**
 * 对敏感值进行脱敏显示
 */
function maskSensitiveValue(value: string): string {
  if (value.length < 12) {
    return value;
  }
  const prefix = value.slice(0, 8);
  const suffix = value.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * 模拟用户确认（Node.js 环境下）
 */
function confirmDelete(configName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`确认删除配置 "${configName}"? [y/N] `, (answer: string) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * unset 命令入口
 */
export async function unsetCommand(args: string[]): Promise<void> {
  // 无参数或帮助参数
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showUsage();
    return;
  }

  const configName = args[0];
  const isForce = args.includes('--force') || args.includes('-f');

  // 检查配置是否存在
  if (!configExists(configName)) {
    console.error(`错误: 配置 "${configName}" 不存在`);
    console.error('');
    console.error('可用配置:');
    const { listConfigs } = require('../config/storage');
    const configs = listConfigs();
    if (configs.length === 0) {
      console.error('  (暂无配置)');
    } else {
      configs.forEach((name: string) => {
        console.error(`  - ${name}`);
      });
    }
    process.exit(1);
  }

  // 显示配置预览
  showConfigPreview(configName);

  // 非强制模式下询问确认
  if (!isForce) {
    const confirmed = await confirmDelete(configName);
    if (!confirmed) {
      console.log('');
      console.log('已取消删除操作');
      return;
    }
  }

  // 执行删除
  try {
    const success = deleteConfig(configName);
    if (success) {
      console.log('');
      console.log(`✅ 配置 "${configName}" 已删除`);
    } else {
      console.error(`错误: 删除配置 "${configName}" 失败`);
      process.exit(1);
    }
  } catch (error) {
    console.error('删除配置时发生错误:', error);
    process.exit(1);
  }
}
