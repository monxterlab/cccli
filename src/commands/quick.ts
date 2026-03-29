import {
  readQuickConfigs,
  getTemplate,
  listQuickConfigs,
  initQuickConfigs,
  forceInitQuickConfigs,
  templateExists,
} from '../config/quick-config';
import { addConfigItem, getConfig } from '../config/storage';

// 互斥的认证 key 组
const AUTH_KEYS = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY'];

/**
 * 检查是否存在认证冲突
 */
function checkAuthConflict(configName: string, newKey: string): string | null {
  if (!AUTH_KEYS.includes(newKey)) {
    return null;
  }

  const existingConfig = getConfig(configName);
  if (!existingConfig) {
    return null;
  }

  const existingKeys = Object.keys(existingConfig);

  for (const authKey of AUTH_KEYS) {
    if (authKey !== newKey && existingKeys.includes(authKey)) {
      return authKey;
    }
  }

  return null;
}

/**
 * 显示使用说明
 */
function showUsage(): void {
  console.log('快速配置环境命令');
  console.log('');
  console.log('用法:');
  console.log('  cccli q <template_name> <auth_key>    根据模板快速创建配置');
  console.log('  cccli q --list                         列出所有可用模板');
  console.log('  cccli q --init                         初始化默认模板配置');
  console.log('  cccli q --init --force                 强制覆盖现有配置');
  console.log('');
  console.log('示例:');
  console.log('  cccli q kimi_coding sk-xxxxx');
  console.log('    相当于:');
  console.log('    cccli set kimi_coding ANTHROPIC_BASE_URL https://api.kimi.com/coding');
  console.log('    cccli set kimi_coding ANTHROPIC_AUTH_TOKEN sk-xxxxx');
  console.log('');
  console.log('可用模板:');
  listQuickConfigs();
}

/**
 * 交互式选择配置模板
 */
function interactiveSelect(): void {
  const configs = readQuickConfigs();
  const templates = Object.entries(configs.templates);

  if (templates.length === 0) {
    console.log('暂无可用模板');
    return;
  }

  console.log('可用的快捷配置模板:');
  templates.forEach(([name, template], index) => {
    console.log(`  ${index + 1}. ${name}`);
    console.log(`     ${template.baseUrl}`);
  });

  console.log('');

  // 使用简单的readline实现交互
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('请选择模板名称 (输入数字或名称): ', (input: string) => {
    rl.close();

    let templateName: string;

    // 尝试解析数字选择
    const numInput = parseInt(input.trim());
    if (!isNaN(numInput) && numInput >= 1 && numInput <= templates.length) {
      templateName = templates[numInput - 1][0];
    } else {
      // 直接使用输入的名称
      templateName = input.trim();
    }

    // 检查模板是否存在
    if (!templateExists(templateName)) {
      console.error(`错误: 模板 "${templateName}" 不存在`);
      return;
    }

    // 获取模板信息
    const template = getTemplate(templateName);
    if (!template) {
      console.error(`错误: 无法读取模板 "${templateName}"`);
      return;
    }

    // 提示输入API密钥
    rl.question(`请输入 ${templateName} 的 API 密钥: `, (authKey: string) => {
      rl.close();

      if (!authKey.trim()) {
        console.error('错误: API密钥不能为空');
        return;
      }

      // 检查认证冲突
      const conflictKey = checkAuthConflict(templateName, template.authKey);
      if (conflictKey) {
        console.error(`错误: 认证方式冲突`);
        console.error('');
        console.error(`当前配置已存在 "${conflictKey}"，无法设置 "${template.authKey}"`);
        console.error('ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 只能选择一个使用');
        return;
      }

      try {
        // 设置 ANTHROPIC_BASE_URL
        addConfigItem(templateName, 'ANTHROPIC_BASE_URL', template.baseUrl);
        console.log(`✅ 已设置: ${templateName}.ANTHROPIC_BASE_URL = ${template.baseUrl}`);

        // 设置认证 key
        addConfigItem(templateName, template.authKey, authKey);
        console.log(`✅ 已设置: ${templateName}.${template.authKey} = ${maskSensitiveValue(authKey)}`);

        console.log('');
        console.log(`配置 "${templateName}" 已完成！`);
        console.log(`使用 "cccli active ${templateName}" 激活此配置`);
      } catch (error) {
        console.error('设置配置失败:', error);
      }
    });
  });
}

/**
 * 快速配置命令入口
 */
export function quickCommand(args: string[]): void {
  // 无参数，进入交互模式
  if (args.length === 0) {
    interactiveSelect();
    return;
  }

  const firstArg = args[0];

  // 处理 --list 参数
  if (firstArg === '--list' || firstArg === '-l') {
    console.log('可用模板:');
    listQuickConfigs();
    return;
  }

  // 处理 --init 参数
  if (firstArg === '--init') {
    const isForce = args.includes('--force');
    if (isForce) {
      forceInitQuickConfigs();
    } else {
      initQuickConfigs();
    }
    return;
  }

  // 处理 --help 参数和 ? 参数（Mac兼容）
  if (firstArg === '--help' || firstArg === '-h' || firstArg === '?') {
    showUsage();
    return;
  }

  // 检查参数数量
  if (args.length < 2) {
    console.error('错误: 参数不足');
    console.error('');
    console.error('用法: cccli q <template_name> <auth_key>');
    console.error('');
    console.error('示例:');
    console.error('  cccli q kimi_coding sk-xxxxx');
    console.error('');
    console.error('可用模板:');
    listQuickConfigs();
    process.exit(1);
  }

  const templateName = args[0];
  const authKey = args[1];

  // 检查模板是否存在
  if (!templateExists(templateName)) {
    console.error(`错误: 模板 "${templateName}" 不存在`);
    console.error('');
    console.error('可用模板:');
    listQuickConfigs();
    process.exit(1);
  }

  // 获取模板配置
  const template = getTemplate(templateName);
  if (!template) {
    console.error(`错误: 无法读取模板 "${templateName}"`);
    process.exit(1);
  }

  // 检查认证冲突
  const conflictKey = checkAuthConflict(templateName, template.authKey);
  if (conflictKey) {
    console.error(`错误: 认证方式冲突`);
    console.error('');
    console.error(`当前配置已存在 "${conflictKey}"，无法设置 "${template.authKey}"`);
    console.error('ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_API_KEY 只能选择一个使用');
    console.error('');
    console.error('解决方法:');
    console.error(`  1. 使用其他配置名称`);
    console.error(`  2. 删除现有配置中的 "${conflictKey}"`);
    process.exit(1);
  }

  try {
    // 设置 ANTHROPIC_BASE_URL
    addConfigItem(templateName, 'ANTHROPIC_BASE_URL', template.baseUrl);
    console.log(`✅ 已设置: ${templateName}.ANTHROPIC_BASE_URL = ${template.baseUrl}`);

    // 设置认证 key
    addConfigItem(templateName, template.authKey, authKey);
    console.log(`✅ 已设置: ${templateName}.${template.authKey} = ${maskSensitiveValue(authKey)}`);

    console.log('');
    console.log(`配置 "${templateName}" 已完成！`);
    console.log(`使用 "cccli active ${templateName}" 激活此配置`);
  } catch (error) {
    console.error('设置配置失败:', error);
    process.exit(1);
  }
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
