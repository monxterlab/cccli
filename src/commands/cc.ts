import { spawn } from 'child_process';

/**
 * Claude Code 管理命令
 * 统一管理 Claude Code 的安装、更新、升级和版本查询
 */
export async function ccCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.error('错误: 请指定子命令');
    console.error('');
    console.error('用法: cccli cc <subcommand>');
    console.error('');
    console.error('子命令:');
    console.error('  install    安装 Claude Code');
    console.error('  update     更新 Claude Code 到最新版本');
    console.error('  upgrade    升级 Claude Code（claude update）');
    console.error('  version    查看 Claude Code 版本');
    console.error('');
    console.error('示例:');
    console.error('  cccli cc install');
    console.error('  cccli cc update');
    console.error('  cccli cc upgrade');
    console.error('  cccli cc version');
    process.exit(1);
  }

  const subCommand = args[0].toLowerCase();

  switch (subCommand) {
    case 'install':
      await installClaudeCode();
      break;

    case 'update':
      await updateClaudeCode();
      break;

    case 'upgrade':
      await upgradeClaudeCode();
      break;

    case 'version':
    case '-v':
    case '--version':
      await showClaudeCodeVersion();
      break;

    default:
      console.error(`错误: 未知子命令 "${subCommand}"`);
      console.error('');
      console.error('可用子命令: install, update, upgrade, version');
      process.exit(1);
  }
}

/**
 * 安装 Claude Code
 * 执行 npm install -g @anthropic-ai/claude-code
 */
async function installClaudeCode(): Promise<void> {
  const packageName = '@anthropic-ai/claude-code';

  console.log('正在安装 Claude Code ...');
  console.log(`执行: npm install -g ${packageName}`);
  console.log('');

  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install', '-g', packageName], {
      stdio: 'inherit',
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log('✅ Claude Code 安装成功！');
        console.log('');
        console.log('你可以通过以下命令启动 Claude Code:');
        console.log('  claude');
        console.log('');
        console.log('或者查看版本:');
        console.log('  cccli cc version');
        resolve();
      } else {
        console.error('');
        console.error(`❌ 安装失败，退出码: ${code}`);
        console.error('');
        console.error('可能原因:');
        console.error('  - npm 未安装或不在 PATH 中');
        console.error('  - 网络连接问题');
        console.error('  - 权限不足（尝试使用 sudo 或管理员权限）');
        console.error('');
        console.error('解决方法:');
        console.error('  - 确认 Node.js 和 npm 已安装: node --version && npm --version');
        console.error('  - 使用代理: npm config set proxy http://proxy.example.com:8080');
        console.error('  - Linux/Mac 使用 sudo: sudo cccli cc install');
        console.error('  - Windows 使用管理员权限运行终端');
        reject(new Error(`安装失败，退出码: ${code}`));
      }
    });

    npm.on('error', (err) => {
      console.error('');
      console.error('❌ 启动 npm 失败');
      console.error('');
      console.error('错误信息:', err.message);
      console.error('');
      console.error('可能原因:');
      console.error('  - npm 未安装');
      console.error('  - Node.js 环境变量未配置');
      reject(err);
    });
  });
}

/**
 * 更新 Claude Code
 * 执行 npm update -g @anthropic-ai/claude-code
 */
async function updateClaudeCode(): Promise<void> {
  const packageName = '@anthropic-ai/claude-code';

  console.log('正在更新 Claude Code ...');
  console.log(`执行: npm update -g ${packageName}`);
  console.log('');

  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['update', '-g', packageName], {
      stdio: 'inherit',
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log('✅ Claude Code 更新成功！');
        console.log('');
        console.log('当前版本:');
        showClaudeCodeVersion().then(() => resolve()).catch(() => resolve());
      } else {
        console.error('');
        console.error(`❌ 更新失败，退出码: ${code}`);
        reject(new Error(`更新失败，退出码: ${code}`));
      }
    });

    npm.on('error', (err) => {
      console.error('');
      console.error('❌ 启动 npm 失败:', err.message);
      reject(err);
    });
  });
}

/**
 * 升级 Claude Code
 * 执行 claude update
 */
async function upgradeClaudeCode(): Promise<void> {
  console.log('正在升级 Claude Code ...');
  console.log('执行: claude update');
  console.log('');

  return new Promise((resolve, reject) => {
    const claude = spawn('claude', ['update'], {
      stdio: 'inherit',
    });

    claude.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log('✅ Claude Code 升级成功！');
        resolve();
      } else {
        console.error('');
        console.error(`❌ 升级失败，退出码: ${code}`);
        console.error('');
        console.error('可能原因:');
        console.error('  - Claude Code 未安装');
        console.error('  - claude 命令不在 PATH 中');
        console.error('  - 网络连接问题');
        reject(new Error(`升级失败，退出码: ${code}`));
      }
    });

    claude.on('error', (err) => {
      console.error('');
      console.error('❌ 启动 claude 失败');
      console.error('');
      console.error('错误信息:', err.message);
      console.error('');
      console.error('可能原因:');
      console.error('  - Claude Code 未安装');
      console.error('  - claude 命令不在 PATH 中');
      reject(err);
    });
  });
}

/**
 * 显示 Claude Code 版本
 * 执行 claude -v
 */
async function showClaudeCodeVersion(): Promise<void> {
  return new Promise((resolve, reject) => {
    const claude = spawn('claude', ['-v'], {
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    claude.stdout?.on('data', (data) => {
      output += data.toString();
    });

    claude.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    claude.on('close', (code) => {
      if (code === 0) {
        const version = output.trim() || errorOutput.trim();
        if (version) {
          console.log(`Claude Code 版本: ${version}`);
        } else {
          console.log('Claude Code 已安装');
        }
        resolve();
      } else {
        console.error('❌ 无法获取 Claude Code 版本');
        console.error('');
        console.error('可能原因:');
        console.error('  - Claude Code 未安装');
        console.error('  - claude 命令不在 PATH 中');
        reject(new Error(`获取版本失败，退出码: ${code}`));
      }
    });

    claude.on('error', (err) => {
      console.error('❌ 启动 claude 失败');
      console.error('');
      console.error('错误信息:', err.message);
      console.error('');
      console.error('可能原因:');
      console.error('  - Claude Code 未安装');
      console.error('  - claude 命令不在 PATH 中');
      reject(err);
    });
  });
}
