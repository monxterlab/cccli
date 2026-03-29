import { configExists, getConfig, getAllConfigs } from '../config/storage';
import { readQuickConfigs } from '../config/quick-config';

/**
 * 对敏感值进行脱敏处理
 */
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
 * 显示导出帮助信息
 */
function showExportHelp(): void {
  console.log('导出配置命令');
  console.log('');
  console.log('用法:');
  console.log('  cccli export json          导出配置为JSON格式');
  console.log('');
  console.log('示例:');
  console.log('  cccli export json > my-configs.json');
  console.log('');
  console.log('选项:');
  console.log('  -h, --help     显示帮助信息');
}

/**
 * 导出配置为JSON格式
 */
function exportJsonConfigs(): void {
  try {
    // 获取所有配置
    const allConfigs = getAllConfigs();

    // 获取当前活跃配置
    const { getConfig: getActiveConfig } = require('../config/storage');
    const activeConfig = getActiveConfig();

    // 处理配置数据
    const exportData: any = {
      configs: {},
      activeConfig: activeConfig || null,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    };

    // 转换配置数据
    Object.entries(allConfigs).forEach(([name, config]) => {
      exportData.configs[name] = {};

      // 优先处理认证密钥
      const priorityKeys = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY'];
      const otherKeys = Object.keys(config)
        .filter(key => !priorityKeys.includes(key))
        .sort();

      // 先添加优先级密钥
      priorityKeys.forEach(key => {
        if (config[key]) {
          exportData.configs[name][key] = maskSensitiveValue(key, config[key]);
        }
      });

      // 再添加其他配置项
      otherKeys.forEach(key => {
        exportData.configs[name][key] = config[key];
      });
    });

    // 输出JSON
    console.log(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('导出配置失败:', error);
    process.exit(1);
  }
}

/**
 * 导出命令入口
 */
export function exportCommand(args: string[]): void {
  // 处理帮助参数
  if (args.includes('--help') || args.includes('-h')) {
    showExportHelp();
    return;
  }

  // 检查参数数量
  if (args.length > 1) {
    console.error('错误: 参数过多');
    console.error('');
    console.error('用法: cccli export json');
    console.error('');
    console.error('使用 --help 查看更多选项');
    process.exit(1);
  }

  const format = args[0];

  // 处理JSON格式导出
  if (format === 'json' || !format) {
    exportJsonConfigs();
  } else {
    console.error(`错误: 不支持的导出格式 "${format}"`);
    console.error('');
    console.error('支持的格式: json');
    console.error('');
    console.error('使用 --help 查看更多选项');
    process.exit(1);
  }
}