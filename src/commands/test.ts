import { getConfig, configExists } from '../config/storage';

/**
 * Anthropic API 错误响应
 */
interface AnthropicError {
  error: {
    type: string;
    message: string;
  };
}

/**
 * Anthropic API 成功响应（简化版）
 */
interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model?: string;
  stop_reason: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * 测试配置是否符合 Anthropic API 规范
 */
export async function testCommand(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.error('错误: 请指定配置名称');
    console.error('');
    console.error('用法: cccli test <config_name>');
    console.error('');
    console.error('示例:');
    console.error('  cccli test ali_coding');
    process.exit(1);
  }

  const configName = args[0];

  // 检查配置是否存在
  if (!configExists(configName)) {
    console.error(`错误: 配置 "${configName}" 不存在`);
    console.error('使用 "cccli list" 查看所有可用配置');
    process.exit(1);
  }

  const config = getConfig(configName);
  if (!config) {
    console.error(`错误: 无法读取配置 "${configName}"`);
    process.exit(1);
  }

  // 获取必要的配置项
  const baseUrl = config.ANTHROPIC_BASE_URL;
  const authToken = config.ANTHROPIC_AUTH_TOKEN;
  const apiKey = config.ANTHROPIC_API_KEY;

  if (!baseUrl) {
    console.error(`错误: 配置 "${configName}" 缺少 ANTHROPIC_BASE_URL`);
    process.exit(1);
  }

  if (!authToken && !apiKey) {
    console.error(`错误: 配置 "${configName}" 缺少认证信息`);
    console.error('需要 ANTHROPIC_AUTH_TOKEN 或 ANTHROPIC_API_KEY');
    process.exit(1);
  }

  // 构建请求头（符合 Anthropic API 规范）
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  };

  // 优先使用 ANTHROPIC_AUTH_TOKEN（Anthropic 标准）
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    headers['x-api-key'] = authToken;
  } else if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['x-api-key'] = apiKey;
  }

  // 构建 API URL
  const apiUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const testUrl = `${apiUrl}v1/messages`;

  console.log(`正在测试配置 "${configName}" ...`);
  console.log(`API 地址: ${testUrl}`);
  console.log('');

  // 验证 Anthropic API 规范
  console.log('验证 Anthropic API 规范:');
  console.log(`  ✓ anthropic-version: ${headers['anthropic-version']}`);
  console.log(`  ✓ Content-Type: ${headers['Content-Type']}`);
  console.log(`  ✓ Authorization: Bearer ${authToken ? '***' : (apiKey ? '***' : '未设置')}`);
  console.log(`  ✓ x-api-key: ${authToken ? '***' : (apiKey ? '***' : '未设置')}`);
  console.log('');

  // 构建符合 Anthropic 规范的请求体
  const requestBody: Record<string, any> = {
    max_tokens: 1,
    messages: [
      {
        role: 'user',
        content: 'Hi',
      },
    ],
  };

  // 如果配置了模型，才添加到请求体
  if (config.ANTHROPIC_MODEL) {
    requestBody.model = config.ANTHROPIC_MODEL;
  }

  console.log('发送测试请求:');
  if (requestBody.model) {
    console.log(`  model: ${requestBody.model}`);
  } else {
    console.log(`  model: (未设置，由服务端决定)`);
  }
  console.log(`  max_tokens: ${requestBody.max_tokens}`);
  console.log(`  messages: ${JSON.stringify(requestBody.messages)}`);
  console.log('');

  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      // 设置 30 秒超时
      signal: AbortSignal.timeout(30000),
    });

    const responseData = await response.json() as AnthropicResponse | AnthropicError;

    if (response.ok) {
      const data = responseData as AnthropicResponse;
      console.log('✅ 测试成功！API 符合 Anthropic 规范');
      console.log('');
      console.log('响应信息:');
      console.log(`  状态码: ${response.status}`);
      console.log(`  响应类型: ${data.type}`);
      if (data.model) {
        console.log(`  模型: ${data.model}`);
      }
      console.log(`  角色: ${data.role}`);

      if (data.usage) {
        console.log(`  token使用: 输入 ${data.usage.input_tokens}, 输出 ${data.usage.output_tokens}`);
      }

      console.log('');
      console.log('配置验证通过 ✓');
    } else {
      const error = responseData as AnthropicError;
      console.error('❌ 测试失败！');
      console.error('');
      console.error(`状态码: ${response.status}`);

      if (error.error) {
        console.error(`错误类型: ${error.error.type}`);
        console.error(`错误信息: ${error.error.message}`);
      } else {
        console.error(`响应: ${JSON.stringify(responseData).substring(0, 500)}`);
      }

      // 根据 Anthropic 错误类型给出提示
      if (response.status === 401) {
        console.error('');
        console.error('可能原因:');
        console.error('  - API Key 无效或已过期');
        console.error('  - 认证信息不正确');
        console.error('  - x-api-key 或 Authorization 头设置不正确');
      } else if (response.status === 400) {
        console.error('');
        console.error('可能原因:');
        console.error('  - 请求参数不正确');
        console.error('  - model 参数无效');
        console.error('  - max_tokens 设置不正确');
      } else if (response.status === 404) {
        console.error('');
        console.error('可能原因:');
        console.error('  - API 地址不正确（ Anthropic API 应该是 /v1/messages）');
        console.error('  - BASE_URL 路径不正确');
      } else if (response.status === 429) {
        console.error('');
        console.error('可能原因:');
        console.error('  - 请求频率过高');
        console.error('  - 账户额度不足');
      } else if (response.status >= 500) {
        console.error('');
        console.error('可能原因:');
        console.error('  - 服务端错误');
        console.error('  - 模型服务暂时不可用');
      }

      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ 测试失败！');
    console.error('');

    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      console.error('错误: 请求超时');
      console.error('');
      console.error('可能原因:');
      console.error('  - 网络连接问题');
      console.error('  - 代理设置不正确');
      console.error('  - API 服务器无响应');
    } else if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
      console.error('错误: 无法解析域名');
      console.error('');
      console.error('可能原因:');
      console.error('  - API 地址不正确');
      console.error('  - DNS 解析失败');
      console.error('  - 网络连接问题');
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.error('错误: 连接被拒绝');
      console.error('');
      console.error('可能原因:');
      console.error('  - API 服务器未运行');
      console.error('  - 端口不正确');
      console.error('  - 防火墙阻止');
    } else {
      console.error(`错误: ${error.message || error}`);
    }

    process.exit(1);
  }
}
