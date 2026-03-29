import { spawn } from 'child_process';
import { getOS } from '../config/paths';

// 允许的代理变量名
const ALLOWED_PROXY_NAMES = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY'];

function setWindowsProxy(key: string, value: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = value
      ? `setx ${key} "${value}"`
      : `reg delete HKCU\\Environment /F /V ${key}`;

    const child = spawn('cmd', ['/c', command], { stdio: 'pipe' });
    let stderr = '';

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `命令退出码: ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function setUnixProxy(key: string, value: string | null, shellConfig: string): void {
  const fs = require('fs');

  if (!fs.existsSync(shellConfig)) {
    fs.writeFileSync(shellConfig, '', { encoding: 'utf-8' });
  }

  let content = fs.readFileSync(shellConfig, 'utf-8');
  const lines = content.split('\n');
  const exportPrefix = key.toUpperCase() === key ? '' : 'export ';

  const newLines = lines.filter((line: string) => {
    const trimmed = line.trim();
    return !trimmed.startsWith(`${exportPrefix}${key}=`) &&
           !trimmed.startsWith(`export ${key}=`);
  });

  if (value !== null) {
    newLines.push(`${exportPrefix}${key}="${value}"`);
  }

  fs.writeFileSync(shellConfig, newLines.join('\n'), { encoding: 'utf-8' });
}

function detectShell(): string {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    return 'zsh';
  } else if (shell.includes('bash')) {
    return 'bash';
  } else {
    return 'bash';
  }
}

export async function proxyCommand(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('错误: 参数不足');
    console.error('');
    console.error('用法:');
    console.error('  cccli proxy <proxy_name> <proxy_value>  设置代理');
    console.error('  cccli proxy --unset <proxy_name>        清除代理');
    console.error('');
    console.error('示例:');
    console.error('  cccli proxy http_proxy http://127.0.0.1:18080');
    console.error('  cccli proxy https_proxy http://127.0.0.1:18080');
    console.error('  cccli proxy --unset http_proxy');
    process.exit(1);
  }

  const os = getOS();
  const isUnset = args[0] === '--unset';

  if (isUnset) {
    if (args.length < 2) {
      console.error('错误: 请指定要清除的代理名称');
      console.error('用法: cccli proxy --unset <proxy_name>');
      process.exit(1);
    }

    const proxyName = args[1];

    // 校验代理变量名
    if (!ALLOWED_PROXY_NAMES.includes(proxyName)) {
      console.error(`错误: 不允许的代理变量名 "${proxyName}"`);
      console.error('只允许使用以下变量名:');
      console.error('  - http_proxy');
      console.error('  - https_proxy');
      process.exit(1);
    }

    try {
      if (os === 'win32') {
        await setWindowsProxy(proxyName, null);
      } else {
        const shell = detectShell();
        const shellConfig = shell === 'zsh'
          ? `${process.env.HOME}/.zshrc`
          : `${process.env.HOME}/.bashrc`;
        setUnixProxy(proxyName, null, shellConfig);
      }

      console.log(`✅ 已清除代理: ${proxyName}`);
      console.log('注意: 请重新打开终端或运行 source 命令使更改生效');
    } catch (error) {
      console.error('清除代理失败:', error);
      process.exit(1);
    }
  } else {
    if (args.length < 2) {
      console.error('错误: 请提供代理值');
      console.error('用法: cccli proxy <proxy_name> <proxy_value>');
      process.exit(1);
    }

    const proxyName = args[0];

    // 校验代理变量名
    if (!ALLOWED_PROXY_NAMES.includes(proxyName)) {
      console.error(`错误: 不允许的代理变量名 "${proxyName}"`);
      console.error('只允许使用以下变量名:');
      console.error('  - http_proxy');
      console.error('  - https_proxy');
      process.exit(1);
    }
    const proxyValue = args.slice(1).join(' ');

    try {
      if (os === 'win32') {
        await setWindowsProxy(proxyName, proxyValue);
      } else {
        const shell = detectShell();
        const shellConfig = shell === 'zsh'
          ? `${process.env.HOME}/.zshrc`
          : `${process.env.HOME}/.bashrc`;
        setUnixProxy(proxyName, proxyValue, shellConfig);
      }

      console.log(`✅ 已设置代理: ${proxyName} = ${proxyValue}`);
      console.log('注意: 请重新打开终端或运行 source 命令使更改生效');
    } catch (error) {
      console.error('设置代理失败:', error);
      process.exit(1);
    }
  }
}
