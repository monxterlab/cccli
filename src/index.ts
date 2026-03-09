#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { helpCommand } from './commands/help';
import { setCommand } from './commands/set';
import { activeCommand } from './commands/active';
import { listCommand } from './commands/list';
import { getCommand } from './commands/get';
import { proxyCommand } from './commands/proxy';
import { envCommand } from './commands/env';
import { completionCommand } from './commands/completion';
import { quickCommand } from './commands/quick';
import { unsetCommand } from './commands/unset';
import { upgradeCommand } from './commands/upgrade';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check version flag first
  if (args[0] === '--version' || args[0] === '-v') {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    console.log(packageJson.version);
    process.exit(0);
  }

  if (args.length === 0 || args[0] === '--help' || args[0] === 'help' || args[0] === '?') {
    helpCommand();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'set':
      setCommand(commandArgs);
      break;

    case 'active':
      await activeCommand(commandArgs);
      break;

    case 'list':
      listCommand();
      break;

    case 'get':
      getCommand(commandArgs);
      break;

    case 'proxy':
      await proxyCommand(commandArgs);
      break;

    case 'env':
      await envCommand(commandArgs);
      break;

    case 'completion':
      completionCommand(commandArgs);
      break;

    case 'q':
      quickCommand(commandArgs);
      break;

    case 'unset':
      await unsetCommand(commandArgs);
      break;

    case 'upgrade':
      await upgradeCommand();
      break;

    default:
      console.error(`错误: 未知命令 "${command}"`);
      console.error('');
      console.error('可用命令: set, active, list, get, env, proxy, completion, q, unset, upgrade, help');
      console.error('运行 "cc help" 或 "cc ?" 查看详细帮助');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('发生错误:', error);
  process.exit(1);
});
