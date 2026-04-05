import * as http from 'http';
import * as https from 'https';
import { spawn, exec } from 'child_process';
import { RouterConfig } from '../types';
import {
  saveRouterConfig,
  deleteRouterConfig,
  listRouterConfigs,
  getRouterConfig,
  routerConfigExists,
} from '../config/router-storage';
import {
  saveRouterProcess,
  getRouterProcess,
  removeRouterProcess,
  listRouterProcesses,
  isProcessRunning,
  cleanStoppedProcesses,
} from '../config/router-process';

/**
 * URL 快捷方式映射
 */
const URL_SHORTCUTS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1',
  'kimi': 'https://api.moonshot.cn/v1',
  'moonshot': 'https://api.moonshot.cn/v1',
  'zhipu': 'https://open.bigmodel.cn/api/anthropic',
  'glm': 'https://open.bigmodel.cn/api/anthropic',
  'dashscope': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  'ali': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  'aliyun': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  'minimax': 'https://api.minimaxi.com/anthropic',
  'poe': 'https://api.poe.com',
  'volcengine': 'https://ark.cn-beijing.volces.com/api/compatible',
  'ark': 'https://ark.cn-beijing.volces.com/api/compatible',
  'huoshan': 'https://ark.cn-beijing.volces.com/api/compatible',
  'stepfun': 'https://api.stepfun.com/compatible-mode/v1',
  'step': 'https://api.stepfun.com/compatible-mode/v1',
  'deepseek': 'https://api.deepseek.com/v1',
  'baidu': 'https://qianfan.baidubce.com/v2',
  'qianfan': 'https://qianfan.baidubce.com/v2',
  'siliconflow': 'https://api.siliconflow.cn/v1',
  'xinference': 'http://localhost:9997/v1',
  'ollama': 'http://localhost:11434/v1',
  'lmstudio': 'http://localhost:1234/v1',
  'vllm': 'http://localhost:8000/v1',
  'textgen': 'http://localhost:5000/v1',
};

/**
 * 解析 URL（支持快捷方式）
 */
function parseUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  return URL_SHORTCUTS[lowerUrl] || url;
}

/**
 * 解析命令行参数选项
 */
function parseArgs(args: string[]): Record<string, string> {
  const options: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-n' || arg === '--name') {
      options['name'] = args[++i];
    } else if (arg === '-u' || arg === '--url') {
      const urlValue = args[++i];
      options['url'] = parseUrl(urlValue);
    } else if (arg === '-p' || arg === '--port') {
      options['port'] = args[++i];
    } else if (arg === '-k' || arg === '--key') {
      options['key'] = args[++i];
    }
  }
  return options;
}

/**
 * Router 命令入口
 */
export async function routerCommand(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.log('用法:');
    console.log('  cccli router -n/--name <name> -u/--url <openai_url|shortcut> -k/--key <api_key> [-p/--port <port>]');
    console.log('  cccli router start <name>                                                        后台启动路由服务');
    console.log('  cccli router stop <name>                                                         停止路由服务');
    console.log('  cccli router restart <name>                                                      重启路由服务');
    console.log('  cccli router status                                                              查看服务状态');
    console.log('  cccli router list                                                                列出所有路由配置');
    console.log('  cccli router remove <name>                                                       删除路由配置');
    console.log('');
    console.log('选项:');
    console.log('  -n, --name    路由名称（唯一标识）');
    console.log('  -u, --url     OpenAI API 基础地址或快捷名称');
    console.log('  -k, --key     OpenAI API Key');
    console.log('  -p, --port    监听端口（默认 3000）');
    console.log('');
    console.log('URL 快捷方式:');
    console.log('  openai, kimi, moonshot, zhipu, glm, dashscope, ali, aliyun,');
    console.log('  minimax, poe, volcengine, ark, huoshan, stepfun, step,');
    console.log('  deepseek, baidu, qianfan, siliconflow');
    console.log('  xinference, ollama, lmstudio, vllm, textgen (本地服务)');
    console.log('');
    console.log('示例:');
    console.log('  cccli router -n openai -u openai -k sk-xxx');
    console.log('  cccli router -n kimi -u kimi -k sk-yyy -p 3001');
    console.log('  cccli router -n local -u ollama -k dummy-key -p 11434');
    console.log('  cccli router start openai');
    console.log('  cccli router stop openai');
    console.log('  cccli router restart openai');
    console.log('  cccli router status');
    return;
  }

  const subCommand = args[0];

  // 处理子命令
  switch (subCommand) {
    case 'start':
      if (args.length < 2) {
        console.error('错误: 请指定路由名称');
        console.log('用法: cccli router start <name>');
        process.exit(1);
      }
      await startRouterServer(args[1]);
      break;

    case 'stop':
      if (args.length < 2) {
        console.error('错误: 请指定路由名称');
        console.log('用法: cccli router stop <name>');
        process.exit(1);
      }
      await stopRouterServer(args[1]);
      break;

    case 'restart':
      if (args.length < 2) {
        console.error('错误: 请指定路由名称');
        console.log('用法: cccli router restart <name>');
        process.exit(1);
      }
      await restartRouterServer(args[1]);
      break;

    case 'status':
      await showRouterStatus();
      break;

    case 'daemon':
      // 内部使用：以守护进程模式运行
      if (args.length < 2) {
        console.error('错误: 请指定路由名称');
        process.exit(1);
      }
      await runDaemon(args[1]);
      break;

    case 'list':
      listRouters();
      break;

    case 'remove':
      if (args.length < 2) {
        console.error('错误: 请指定路由名称');
        console.log('用法: cccli router remove <name>');
        process.exit(1);
      }
      removeRouter(args[1]);
      break;

    default:
      // 检查是否是选项格式
      if (subCommand.startsWith('-')) {
        const options = parseArgs(args);

        if (!options['name'] || !options['url'] || !options['key']) {
          console.error('错误: 缺少必需参数');
          console.log('必需参数: -n/--name, -u/--url, -k/--key');
          console.log('用法: cccli router -n <name> -u <openai_url> -k <api_key> [-p <port> 默认为 3000]');
          process.exit(1);
        }

        const name = options['name'];
        const openaiBaseUrl = options['url'];
        const apiKey = options['key'];
        const port = options['port'] ? parseInt(options['port'], 10) : 3000;
        const routerUrl = `http://localhost:${port}`;

        if (isNaN(port) || port < 1 || port > 65535) {
          console.error('错误: 端口号无效，必须是 1-65535 之间的数字');
          process.exit(1);
        }

        configureRouter(name, openaiBaseUrl, routerUrl, apiKey, port);
      } else if (args.length >= 4) {
        // 兼容旧格式: router <name> <openai_base_url> <router_url> <api_key> [port]
        const name = args[0];
        const openaiBaseUrl = args[1];
        const routerUrl = args[2];
        const apiKey = args[3];
        const port = args[4] ? parseInt(args[4], 10) : 3000;

        if (isNaN(port) || port < 1 || port > 65535) {
          console.error('错误: 端口号无效，必须是 1-65535 之间的数字');
          process.exit(1);
        }

        configureRouter(name, openaiBaseUrl, routerUrl, apiKey, port);
      } else {
        console.error(`错误: 未知命令 "${subCommand}"`);
        console.log('运行 "cccli router" 查看帮助');
        process.exit(1);
      }
  }
}

/**
 * 配置并保存路由
 */
function configureRouter(
  name: string,
  openaiBaseUrl: string,
  routerUrl: string,
  apiKey: string,
  port: number
): void {
  const config: RouterConfig = {
    name,
    openaiBaseUrl,
    routerUrl,
    apiKey,
    port,
  };

  saveRouterConfig(config);
  console.log(`路由配置 "${name}" 已保存`);
  console.log(`  OpenAI API: ${openaiBaseUrl}`);
  console.log(`  本地路由地址: ${routerUrl}`);
  console.log(`  监听端口: ${port}`);
}

/**
 * 列出所有路由配置
 */
function listRouters(): void {
  const routers = listRouterConfigs();

  if (routers.length === 0) {
    console.log('暂无路由配置');
    console.log('使用 "cccli router <name> <openai_url> <router_url> <api_key> [port]" 添加配置');
    return;
  }

  console.log('已配置的路由:');
  console.log('');

  for (const router of routers) {
    console.log(`  ${router.name}`);
    console.log(`    OpenAI API: ${router.openaiBaseUrl}`);
    console.log(`    路由地址: ${router.routerUrl}`);
    console.log(`    端口: ${router.port}`);
    console.log('');
  }
}

/**
 * 删除路由配置
 */
function removeRouter(name: string): void {
  if (!routerConfigExists(name)) {
    console.error(`错误: 路由配置 "${name}" 不存在`);
    process.exit(1);
  }

  deleteRouterConfig(name);
  console.log(`路由配置 "${name}" 已删除`);
}

/**
 * 在后台启动路由服务
 */
async function startRouterServer(name: string): Promise<void> {
  const config = getRouterConfig(name);

  if (!config) {
    console.error(`错误: 路由配置 "${name}" 不存在`);
    console.log(`请先运行: cccli router -n ${name} -u <openai_url> -k <api_key>`);
    process.exit(1);
  }

  // 检查是否已经在运行
  const existingProcess = getRouterProcess(name);
  if (existingProcess && isProcessRunning(existingProcess.pid)) {
    console.error(`错误: 路由服务 "${name}" 已经在运行 (PID: ${existingProcess.pid})`);
    console.log(`访问地址: ${config.routerUrl}`);
    process.exit(1);
  }

  // 检查端口是否可用
  const portAvailable = await checkPortAvailable(config.port);
  if (!portAvailable) {
    console.error(`错误: 端口 ${config.port} 已被占用`);
    process.exit(1);
  }

  // 在后台启动服务进程
  // 使用当前运行的 Node 脚本启动 daemon 模式，避免依赖全局 cccli 可执行文件
  const entryScript = process.argv[1];
  const child = spawn(process.execPath, [entryScript, 'router', 'daemon', name], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    env: process.env,
  });

  child.unref();

  // 保存进程信息（包含原始配置用于恢复）
  saveRouterProcess({
    name,
    pid: child.pid!,
    port: config.port,
    routerUrl: config.routerUrl,
    startTime: new Date().toISOString(),
  });

  console.log('');
  console.log(`路由服务 "${name}" 已在后台启动`);
  console.log(`PID: ${child.pid}`);
  console.log(`监听端口: ${config.port}`);
  console.log(`转发到: ${config.openaiBaseUrl}`);
  console.log(`访问地址: ${config.routerUrl}`);
  console.log('');
  console.log(`停止服务: cccli router stop ${name}`);
}

/**
 * 以守护进程模式运行（内部使用）
 */
async function runDaemon(name: string): Promise<void> {
  const config = getRouterConfig(name);
  if (!config) {
    console.error(`错误: 路由配置 "${name}" 不存在`);
    process.exit(1);
  }

  // 设置信号处理
  setupSignalHandlers();

  // 创建并启动 HTTP 服务器
  const server = createRouterServer(config);

  server.listen(config.port, () => {
    // 守护进程不输出到控制台
  });

  // 保持进程运行
  return new Promise(() => {});
}

/**
 * 停止路由服务
 */
async function stopRouterServer(name: string): Promise<void> {
  const processInfo = getRouterProcess(name);

  if (!processInfo) {
    console.error(`错误: 路由服务 "${name}" 没有在运行`);
    process.exit(1);
  }

  // 检查进程是否真的在运行
  if (!isProcessRunning(processInfo.pid)) {
    // 清理已停止的记录
    removeRouterProcess(name);
    console.log(`路由服务 "${name}" 已经停止`);
    return;
  }

  // 杀死进程
  try {
    process.kill(processInfo.pid, 'SIGTERM');
    removeRouterProcess(name);
    console.log(`路由服务 "${name}" 已停止 (PID: ${processInfo.pid})`);
  } catch (error) {
    console.error(`停止服务失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 重启路由服务
 */
async function restartRouterServer(name: string): Promise<void> {
  console.log(`正在重启路由服务 "${name}"...`);
  console.log('');

  const config = getRouterConfig(name);
  if (!config) {
    console.error(`错误: 路由配置 "${name}" 不存在`);
    console.log(`请先运行: cccli router -n ${name} -u <url> -k <key>`);
    process.exit(1);
  }

  // 先停止服务（如果正在运行）
  const processInfo = getRouterProcess(name);
  if (processInfo && isProcessRunning(processInfo.pid)) {
    try {
      process.kill(processInfo.pid, 'SIGTERM');
      removeRouterProcess(name);
      console.log(`✓ 已停止旧服务 (PID: ${processInfo.pid})`);
    } catch (error) {
      console.error(`停止旧服务失败: ${error}`);
    }
  }

  // 等待端口释放（最多等待 5 秒）
  console.log(`✓ 等待端口 ${config.port} 释放...`);
  let portFreed = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const portAvailable = await checkPortAvailable(config.port);
    if (portAvailable) {
      portFreed = true;
      break;
    }
  }

  if (!portFreed) {
    console.error(`错误: 端口 ${config.port} 仍被占用，尝试强制释放...`);
    // 尝试查找并杀死占用端口的进程
    try {
      const { exec } = require('child_process');
      exec(`lsof -ti :${config.port} | xargs kill -9 2>/dev/null || true`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      // 忽略错误
    }
  }

  // 启动新服务
  console.log('✓ 正在启动新服务...');
  console.log('');
  await startRouterServer(name);
}

/**
 * 显示路由服务状态
 */
async function showRouterStatus(): Promise<void> {
  // 清理已停止的进程记录
  cleanStoppedProcesses();

  const processes = listRouterProcesses();

  if (processes.length === 0) {
    console.log('没有运行中的路由服务');
    return;
  }

  console.log('运行中的路由服务:');
  console.log('');

  for (const proc of processes) {
    const running = isProcessRunning(proc.pid);
    const status = running ? '运行中' : '已停止';
    const startTime = new Date(proc.startTime).toLocaleString();

    console.log(`  ${proc.name}`);
    console.log(`    状态: ${status}`);
    console.log(`    PID: ${proc.pid}`);
    console.log(`    端口: ${proc.port}`);
    console.log(`    地址: ${proc.routerUrl}`);
    console.log(`    启动时间: ${startTime}`);
    console.log('');
  }
}

/**
 * 检查端口是否可用
 */
function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const testServer = http.createServer();
    testServer.once('error', () => {
      resolve(false);
    });
    testServer.once('listening', () => {
      testServer.close(() => {
        resolve(true);
      });
    });
    testServer.listen(port);
  });
}

/**
 * 设置信号处理器
 */
function setupSignalHandlers(): void {
  const cleanup = () => {
    console.log('');
    console.log('正在停止路由服务...');
    console.log('路由服务已停止');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

/**
 * 创建 HTTP 服务器
 */
function createRouterServer(config: RouterConfig): http.Server {
  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = requestUrl.pathname.replace(/\/+$/, '') || '/';

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // 健康检查端点
    if (pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', router: config.name }));
      return;
    }

    // 模型列表端点
    if (pathname === '/v1/models' && req.method === 'GET') {
      await handleModelsListRequest(res, config);
      return;
    }

    // 模型详情端点
    if (pathname.startsWith('/v1/models/') && req.method === 'GET') {
      const modelId = decodeURIComponent(pathname.slice('/v1/models/'.length));
      await handleModelRetrieveRequest(res, config, modelId);
      return;
    }

    // 主端点: /v1/messages
    if (pathname === '/v1/messages' && req.method === 'POST') {
      await handleMessagesRequest(req, res, config);
      return;
    }

    // 其他端点返回 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}

/**
 * 处理 /v1/messages 请求
 */
async function handleMessagesRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  config: RouterConfig
): Promise<void> {
  try {
    // 读取请求体
    const body = await readRequestBody(req);
    let anthropicBody: Record<string, any>;

    try {
      anthropicBody = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    // 转换为 OpenAI 格式
    const openaiBody = convertAnthropicToOpenAIRequest(anthropicBody);

    // 转发到 OpenAI API
    const openaiResponse = await forwardToOpenAI(openaiBody, config, anthropicBody.stream === true);

    if (anthropicBody.stream) {
      // 流式响应
      handleStreamResponse(openaiResponse, res, config);
    } else {
      // 非流式响应
      const anthropicResponse = await convertOpenAIToAnthropicResponse(openaiResponse, anthropicBody.model);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(anthropicResponse));
    }
  } catch (error) {
    console.error('处理请求失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

/**
 * 处理 /v1/models 请求
 */
async function handleModelsListRequest(
  res: http.ServerResponse,
  config: RouterConfig
): Promise<void> {
  try {
    const upstreamResponse = await forwardToUpstream('/models', 'GET', undefined, config);
    const anthropicResponse = await convertOpenAIModelsToAnthropicList(upstreamResponse);
    res.writeHead(upstreamResponse.statusCode || 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(anthropicResponse));
  } catch (error) {
    console.error('获取模型列表失败:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch models' }));
  }
}

/**
 * 处理 /v1/models/{id} 请求
 */
async function handleModelRetrieveRequest(
  res: http.ServerResponse,
  config: RouterConfig,
  modelId: string
): Promise<void> {
  try {
    const upstreamResponse = await forwardToUpstream(`/models/${encodeURIComponent(modelId)}`, 'GET', undefined, config);
    const anthropicResponse = await convertOpenAIModelToAnthropic(upstreamResponse, modelId);
    res.writeHead(upstreamResponse.statusCode || 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(anthropicResponse));
  } catch (error) {
    console.error(`获取模型 ${modelId} 失败:`, error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch model' }));
  }
}

/**
 * 读取请求体
 */
function readRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

/**
 * Anthropic 请求转换为 OpenAI 请求
 */
function convertAnthropicToOpenAIRequest(anthropicBody: Record<string, any>): Record<string, any> {
  const openaiBody: Record<string, any> = {
    model: anthropicBody.model,
    messages: [],
  };

  // 处理 system 消息
  if (anthropicBody.system) {
    openaiBody.messages.push({
      role: 'system',
      content: anthropicBody.system,
    });
  }

  // 转换 messages
  if (Array.isArray(anthropicBody.messages)) {
    for (const msg of anthropicBody.messages) {
      const openaiMsg: Record<string, any> = {
        role: msg.role,
      };

      // 处理 content（Anthropic 可能是数组或字符串）
      if (Array.isArray(msg.content)) {
        // 转换所有内容块，保留非 text 类型的信息
        const parts: string[] = [];
        for (const block of msg.content) {
          if (block.type === 'text') {
            parts.push(block.text);
          } else if (block.type === 'tool_use') {
            parts.push(`[Tool: ${block.name}]`);
          } else if (block.type === 'tool_result') {
            parts.push('[Tool Result]');
          } else if (block.type === 'image') {
            parts.push('[Image]');
          } else {
            parts.push(`[${block.type || 'Content'}]`);
          }
        }
        openaiMsg.content = parts.join('\n');
      } else {
        openaiMsg.content = msg.content;
      }

      openaiBody.messages.push(openaiMsg);
    }
  }

  // 复制其他字段
  if (anthropicBody.max_tokens !== undefined) {
    openaiBody.max_tokens = anthropicBody.max_tokens;
  }
  if (anthropicBody.temperature !== undefined) {
    openaiBody.temperature = anthropicBody.temperature;
  }
  if (anthropicBody.top_p !== undefined) {
    openaiBody.top_p = anthropicBody.top_p;
  }
  if (anthropicBody.stream !== undefined) {
    openaiBody.stream = anthropicBody.stream;
  }
  if (anthropicBody.stop_sequences !== undefined) {
    openaiBody.stop = anthropicBody.stop_sequences;
  }

  return openaiBody;
}

/**
 * 转发请求到 OpenAI API
 */
function forwardToOpenAI(
  openaiBody: Record<string, any>,
  config: RouterConfig,
  stream: boolean
): Promise<http.IncomingMessage> {
  return forwardToUpstream('/chat/completions', 'POST', openaiBody, config);
}

/**
 * 转发请求到上游 OpenAI 兼容接口
 */
function forwardToUpstream(
  upstreamPath: string,
  method: 'GET' | 'POST',
  body: Record<string, any> | undefined,
  config: RouterConfig
): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const url = new URL(config.openaiBaseUrl);
    const normalizedPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
    const path = `${normalizedPath}${upstreamPath}${url.search}`;

    const requestOptions: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path,
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    };

    if (body) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Content-Type': 'application/json',
      };
    }

    // 使用 https 或 http 模块
    const clientModule = url.protocol === 'https:' ? require('https') : require('http');

    const proxyReq = clientModule.request(requestOptions, (proxyRes: http.IncomingMessage) => {
      resolve(proxyRes);
    });

    proxyReq.on('error', reject);
    if (body) {
      proxyReq.write(JSON.stringify(body));
    }
    proxyReq.end();
  });
}

/**
 * 读取响应体
 */
function readResponseBody(response: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    response.on('data', (chunk) => {
      body += chunk.toString();
    });
    response.on('end', () => {
      resolve(body);
    });
    response.on('error', reject);
  });
}

/**
 * OpenAI 响应转换为 Anthropic 响应（非流式）
 */
async function convertOpenAIToAnthropicResponse(
  openaiResponse: http.IncomingMessage,
  originalModel: string
): Promise<Record<string, any>> {
  const body = await readResponseBody(openaiResponse);
  const statusCode = openaiResponse.statusCode || 200;

  try {
    const openaiData = JSON.parse(body);

    // 处理错误响应
    if (openaiData.error) {
      return {
        id: `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        model: originalModel,
        content: [
          {
            type: 'text',
            text: `Error: ${openaiData.error.message || 'Unknown error'}`,
          },
        ],
        stop_reason: 'error',
        stop_sequence: null,
        usage: {
          input_tokens: 0,
          output_tokens: 0,
        },
        error: openaiData.error,
      };
    }

    // 提取内容
    let contentText = '';
    if (openaiData.choices && openaiData.choices[0]) {
      const choice = openaiData.choices[0];
      if (choice.message && choice.message.content) {
        contentText = choice.message.content;
      }
    }

    // 转换 finish_reason
    let stopReason: string | null = null;
    if (openaiData.choices && openaiData.choices[0]) {
      const finishReason = openaiData.choices[0].finish_reason;
      if (finishReason === 'stop') {
        stopReason = 'end_turn';
      } else if (finishReason === 'length') {
        stopReason = 'max_tokens';
      }
    }

    // 构建 Anthropic 格式响应
    return {
      id: `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: originalModel,
      content: [
        {
          type: 'text',
          text: contentText,
        },
      ],
      stop_reason: stopReason,
      stop_sequence: null,
      usage: {
        input_tokens: openaiData.usage?.prompt_tokens || 0,
        output_tokens: openaiData.usage?.completion_tokens || 0,
      },
    };
  } catch {
    // 解析失败返回基本结构
    return {
      id: `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: originalModel,
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };
  }
}

/**
 * OpenAI 模型列表转换为 Anthropic 模型列表格式
 */
async function convertOpenAIModelsToAnthropicList(
  openaiResponse: http.IncomingMessage
): Promise<Record<string, any>> {
  const body = await readResponseBody(openaiResponse);

  try {
    const openaiData = JSON.parse(body);
    const models = Array.isArray(openaiData.data) ? openaiData.data : [];
    const data = models.map((model: Record<string, any>) => convertModelRecord(model));

    return {
      data,
      first_id: data[0]?.id ?? null,
      has_more: false,
      last_id: data[data.length - 1]?.id ?? null,
    };
  } catch {
    return {
      data: [],
      first_id: null,
      has_more: false,
      last_id: null,
    };
  }
}

/**
 * OpenAI 单模型响应转换为 Anthropic 模型格式
 */
async function convertOpenAIModelToAnthropic(
  openaiResponse: http.IncomingMessage,
  fallbackModelId: string
): Promise<Record<string, any>> {
  const body = await readResponseBody(openaiResponse);

  try {
    const openaiData = JSON.parse(body);
    return convertModelRecord(openaiData, fallbackModelId);
  } catch {
    return convertModelRecord({ id: fallbackModelId }, fallbackModelId);
  }
}

function convertModelRecord(model: Record<string, any>, fallbackModelId?: string): Record<string, any> {
  const id = model.id || fallbackModelId || 'unknown';
  const createdAt = model.created
    ? new Date(Number(model.created) * 1000).toISOString()
    : '1970-01-01T00:00:00Z';

  return {
    id,
    type: 'model',
    display_name: model.display_name || id,
    created_at: model.created_at || createdAt,
  };
}

/**
 * 处理流式响应
 */
function handleStreamResponse(
  openaiResponse: http.IncomingMessage,
  res: http.ServerResponse,
  config: RouterConfig
): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let buffer = '';
  let messageId = `msg_${Date.now()}`;
  let model = '';

  // 发送 message_start 事件
  const messageStart = {
    type: 'message_start',
    message: {
      id: messageId,
      type: 'message',
      role: 'assistant',
      model: model || 'unknown',
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: 0, output_tokens: 1 },
    },
  };
  res.write(`event: message_start\ndata: ${JSON.stringify(messageStart)}\n\n`);

  // 发送 content_block_start 事件
  const contentBlockStart = {
    type: 'content_block_start',
    index: 0,
    content_block: { type: 'text', text: '' },
  };
  res.write(`event: content_block_start\ndata: ${JSON.stringify(contentBlockStart)}\n\n`);

  openaiResponse.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        if (data === '[DONE]') {
          // 流结束
          const contentBlockStop = {
            type: 'content_block_stop',
            index: 0,
          };
          res.write(`event: content_block_stop\ndata: ${JSON.stringify(contentBlockStop)}\n\n`);

          const messageDelta = {
            type: 'message_delta',
            delta: { stop_reason: 'end_turn', stop_sequence: null },
            usage: { output_tokens: 1 },
          };
          res.write(`event: message_delta\ndata: ${JSON.stringify(messageDelta)}\n\n`);

          const messageStop = { type: 'message_stop' };
          res.write(`event: message_stop\ndata: ${JSON.stringify(messageStop)}\n\n`);

          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(data);

          // 提取模型信息
          if (parsed.model && !model) {
            model = parsed.model;
          }

          // 处理 delta
          if (parsed.choices && parsed.choices[0]?.delta?.content) {
            const content = parsed.choices[0].delta.content;
            const delta = {
              type: 'content_block_delta',
              index: 0,
              delta: { type: 'text_delta', text: content },
            };
            res.write(`event: content_block_delta\ndata: ${JSON.stringify(delta)}\n\n`);
          }

          // 处理 finish_reason
          if (parsed.choices && parsed.choices[0]?.finish_reason) {
            const contentBlockStop = {
              type: 'content_block_stop',
              index: 0,
            };
            res.write(`event: content_block_stop\ndata: ${JSON.stringify(contentBlockStop)}\n\n`);

            const stopReason = parsed.choices[0].finish_reason === 'stop' ? 'end_turn' : 'max_tokens';
            const messageDelta = {
              type: 'message_delta',
              delta: { stop_reason: stopReason, stop_sequence: null },
              usage: { output_tokens: parsed.usage?.completion_tokens || 1 },
            };
            res.write(`event: message_delta\ndata: ${JSON.stringify(messageDelta)}\n\n`);

            const messageStop = { type: 'message_stop' };
            res.write(`event: message_stop\ndata: ${JSON.stringify(messageStop)}\n\n`);

            res.end();
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  });

  openaiResponse.on('end', () => {
    res.end();
  });

  openaiResponse.on('error', () => {
    res.end();
  });
}
