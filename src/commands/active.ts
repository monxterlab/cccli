import * as fs from 'fs';
import { configExists, getConfig, setActiveConfig } from '../config/storage';
import { applyConfigToClaude, getClaudeConfigPath } from '../config/claude-config';

export async function activeCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.error('错误: 请指定配置名称');
    console.error('');
    console.error('用法: cc active <config_name>');
    console.error('       cc active <config_name> --force  跳过文件存在性检查');
    console.error('');
    console.error('示例:');
    console.error('  cc active kimi');
    process.exit(1);
  }

  const configName = args[0];
  const isForce = args.includes('--force');

  if (!configExists(configName)) {
    console.error(`错误: 配置 "${configName}" 不存在`);
    console.error('使用 "cc list" 查看所有可用配置');
    process.exit(1);
  }

  const config = getConfig(configName);
  if (!config) {
    console.error(`错误: 无法读取配置 "${configName}"`);
    process.exit(1);
  }

  // 检查 Claude Code 配置文件是否存在
  const claudeConfigPath = getClaudeConfigPath();
  const claudeConfigExists = fs.existsSync(claudeConfigPath);

  if (!claudeConfigExists && !isForce) {
    console.warn('⚠️  警告: Claude Code 配置文件不存在');
    console.warn('');
    console.warn(`目标文件: ${claudeConfigPath}`);
    console.warn('');
    console.warn('可能的原因:');
    console.warn('  - Claude Code 尚未初始化');
    console.warn('  - 这是首次运行 Claude Code');
    console.warn('');
    console.warn('建议操作:');
    console.warn('  1. 先运行一次 Claude Code 以创建配置文件');
    console.warn('  2. 或使用 --force 参数强制继续 (将自动创建配置文件)');
    console.warn('');
    console.warn(`强制继续命令: cc active ${configName} --force`);
    process.exit(1);
  }

  if (!claudeConfigExists && isForce) {
    console.log('ℹ️  Claude Code 配置文件不存在，将自动创建...');
  }

  try {
    const configData = {
      name: configName,
      settings: config,
    };
    await applyConfigToClaude(configName, configData);
    setActiveConfig(configName);
    console.log(`✅ 已激活配置: ${configName}`);
    console.log('配置已写入 Claude Code 配置文件');
  } catch (error: any) {
    console.error('激活配置失败:', error.message || error);
    process.exit(1);
  }
}
