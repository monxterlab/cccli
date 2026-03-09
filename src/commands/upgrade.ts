import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * 版本信息接口
 */
export interface VersionInfo {
  local: string;
  remote: string;
  needsUpdate: boolean;
}

/**
 * 获取本地当前版本
 * @returns 本地版本号
 */
export function getLocalVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    throw new Error(`Failed to get local version: ${error}`);
  }
}

/**
 * 从 npm registry 获取最新版本
 * @param packageName - npm 包名
 * @returns 最新版本号
 */
export async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json() as { version: string };
    return data.version;
  } catch (error) {
    throw new Error(`Failed to fetch latest version: ${error}`);
  }
}

/**
 * 解析版本号
 * @param version - 版本字符串
 * @returns 解析后的版本对象
 */
function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
  pre?: string;
} {
  // 处理带 v 前缀的版本号
  const cleanVersion = version.startsWith('v') ? version.slice(1) : version;

  const [main, pre] = cleanVersion.split('-');
  const parts = main.split('.');

  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
    pre,
  };
}

/**
 * 比较两个版本号
 * 遵循 semver 规范
 * @param v1 - 版本1
 * @param v2 - 版本2
 * @returns -1: v1 < v2, 0: v1 === v2, 1: v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const a = parseVersion(v1);
  const b = parseVersion(v2);

  // 比较 major
  if (a.major !== b.major) {
    return a.major - b.major;
  }

  // 比较 minor
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }

  // 比较 patch
  if (a.patch !== b.patch) {
    return a.patch - b.patch;
  }

  // prerelease 处理: 有 pre 的版本号 < 没有 pre 的版本号
  if (!a.pre && b.pre) return 1;
  if (a.pre && !b.pre) return -1;
  if (a.pre && b.pre) return a.pre.localeCompare(b.pre);

  return 0;
}

/**
 * 检查是否需要更新
 * @param local - 本地版本
 * @param remote - 远程版本
 * @returns 是否需要更新
 */
export function shouldUpdate(local: string, remote: string): boolean {
  return compareVersions(remote, local) > 0;
}

/**
 * 执行 npm install -g 更新
 * @param packageName - npm 包名
 * @returns 是否更新成功
 */
export async function executeUpdate(packageName: string): Promise<boolean> {
  try {
    console.log(`Installing ${packageName}...`);
    execSync(`npm install -g ${packageName}`, {
      stdio: 'inherit',
      timeout: 120000, // 2 minutes timeout
    });
    return true;
  } catch (error) {
    throw new Error(`Update failed: ${error}`);
  }
}

/**
 * Upgrade 命令主入口
 */
export async function upgradeCommand(): Promise<void> {
  const packageName = '@monxterlab/cccli';

  try {
    // 获取本地版本
    const localVersion = getLocalVersion();
    console.log(`Current version: ${localVersion}`);

    // 获取最新版本
    console.log('Checking for updates...');
    const latestVersion = await getLatestVersion(packageName);
    console.log(`Latest version: ${latestVersion}`);

    // 判断是否需要更新
    if (!shouldUpdate(localVersion, latestVersion)) {
      console.log('You are already using the latest version.');
      return;
    }

    // 执行更新
    console.log('');
    console.log(`Updating from ${localVersion} to ${latestVersion}...`);
    console.log('');

    await executeUpdate(packageName);

    console.log('');
    console.log(`Successfully updated to version ${latestVersion}!`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);

      // 提供手动更新提示
      if (error.message.includes('Update failed')) {
        console.error('');
        console.error('You can try updating manually:');
        console.error(`  npm install -g ${packageName}`);
      }

      // 网络错误提示
      if (error.message.includes('fetch')) {
        console.error('');
        console.error('Please check your network connection and try again.');
      }
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}
