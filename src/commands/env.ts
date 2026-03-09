import { readClaudeConfig } from '../config/claude-config';

const ALLOWED_PROXY_KEYS = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY'];

/**
 * 显示 Claude Code 配置文件中的 env 对象所有配置
 */
async function showEnvConfig(): Promise<void> {
  try {
    const config = await readClaudeConfig();

    if (!config.env || Object.keys(config.env).length === 0) {
      console.log('Claude Code 配置中暂无环境变量设置 (env 对象为空)');
      return;
    }

    console.log('Claude Code 环境变量配置 (settings.json -> env):');
    console.log('');

    const entries = Object.entries(config.env);
    entries.forEach(([key, value]) => {
      const displayValue = maskSensitiveValue(key, String(value));
      console.log(`  ${key}: ${displayValue}`);
    });
  } catch (error: any) {
    console.error('读取配置失败:', error.message);
    process.exit(1);
  }
}

/**
 * 显示系统代理环境变量
 */
function showProxyEnv(): void {
  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;

  console.log('系统代理环境变量:');
  console.log('');
  console.log(`  http_proxy:  ${httpProxy || '(未设置)'}`);
  console.log(`  https_proxy: ${httpsProxy || '(未设置)'}`);
}

/**
 * 对敏感值进行脱敏显示
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
 * env 命令入口
 * - cc env: 显示 Claude Code 配置中的 env 对象
 * - cc env proxy: 显示系统代理环境变量
 */
export async function envCommand(args: string[]): Promise<void> {
  if (args.length === 0) {
    // cc env - 显示 Claude Code 配置中的 env 对象
    await showEnvConfig();
  } else if (args.length === 1 && args[0].toLowerCase() === 'proxy') {
    // cc env proxy - 显示系统代理环境变量
    showProxyEnv();
  } else {
    console.error('错误: 无效的参数');
    console.log('');
    console.log('用法:');
    console.log('  cc env        查看 Claude Code 配置中的 env 对象');
    console.log('  cc env proxy  查看系统代理环境变量 (http_proxy, https_proxy)');
    process.exit(1);
  }
}
