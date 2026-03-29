import { listConfigs, getActiveConfig } from '../config/storage';

export function listCommand(): void {
  const configs = listConfigs();
  const activeConfig = getActiveConfig();

  if (configs.length === 0) {
    console.log('暂无配置');
    console.log('使用 "cccli set <config_name> <key> <value>" 添加配置');
    return;
  }

  console.log('可用配置列表:');
  configs.forEach(name => {
    const marker = name === activeConfig ? ' (当前激活)' : '';
    console.log(`  - ${name}${marker}`);
  });
}
