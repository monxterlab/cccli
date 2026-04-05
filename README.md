# CCCLI - Claude Code CLI 配置管理工具

<div align="center">

**简化 Claude CLI 配置管理，让多环境切换更轻松**

[![Version](https://img.shields.io/npm/v/@monxterlab/cccli)](https://www.npmjs.com/package/@monxterlab/cccli)

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 简介

CCCLI 是一个专为 Claude CLI 设计的配置管理工具，帮助开发者轻松管理多个 API 配置、快速切换环境，并提供便捷的快捷配置模板。

### 功能特性

- 🎯 **多环境配置管理** - 支持创建和管理多个独立的 API 配置
- ⚡ **快速切换配置** - 一键在不同配置之间切换
- 🚀 **预设模板支持** - 内置 Kimi、阿里、Poe、智谱等热门 AI 服务模板
- 🔄 **配置导出备份** - 支持将配置导出为 JSON 格式
- 🌐 **代理配置** - 方便地为不同配置设置代理
- 💻 **Shell 自动补全** - 提供命令行自动补全功能
- 🎨 **交互式配置** - 支持友好的交互式配置向导
- 🛣️ **API 路由服务** - 将 Anthropic 格式请求转换为 OpenAI 格式

### 安装

#### 全局安装

```bash
npm install -g @monxterlab/cccli
```

#### 本地安装

如果你希望在项目中本地安装，可以使用以下方式：

```bash
# 安装到当前项目
npm install --save-dev @monxterlab/cccli

# 通过 npx 运行
npx cccli <command>

# 或者通过 npm scripts 运行
npm run cccli -- <command>
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "cccli": "cccli",
    "cccli:set": "cccli set",
    "cccli:active": "cccli active",
    "cccli:list": "cccli list"
  }
}
```

然后运行：

```bash
npm run cccli:list
npm run cccli:set my-config ANTHROPIC_BASE_URL https://api.example.com
```

### 前置要求

- Node.js >= 16.0.0
- npm 或 yarn

### 快速开始

#### 1. 初始化配置模板

```bash
cccli q --init
```

#### 2. 创建你的第一个配置

```bash
# 使用快捷模板创建配置
cccli q zai your-zhipu-api-key
```

#### 3. 激活配置

```bash
cccli active zai
```

#### 4. 验证配置

```bash
cccli get zai
```

### 命令参考

#### 基础命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `list` | 列出所有配置 | `cccli list` |
| `get <name>` | 查看指定配置详情 | `cccli get zai` |
| `set <name> <key> <value>` | 设置配置项（支持Key快捷） | `cccli set myconfig TOKEN sk-xxxxx` |
| `unset <name> [key]` | 删除配置或配置项 | `cccli unset zai` |
| `active <name>` | 激活指定配置 | `cccli active zai` |

#### 测试命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `test <name>` | 测试配置连通性（验证 Anthropic API 规范） | `cccli test ali_coding` |

#### Claude Code 管理命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `cc install` | 安装 Claude Code | `cccli cc install` |
| `cc update` | 更新 Claude Code | `cccli cc update` |
| `cc upgrade` | 升级 Claude Code（claude update） | `cccli cc upgrade` |
| `cc version` | 查看 Claude Code 版本 | `cccli cc version` |

#### API 路由命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `router -n/--name <name> -u/--url <url|shortcut> -k/--key <key> [-p/--port <port>]` | 配置 OpenAI API 路由 | `cccli router -n openai -u openai -k sk-xxx` |
| `router start <name>` | 后台启动路由服务 | `cccli router start openai` |
| `router stop <name>` | 停止路由服务 | `cccli router stop openai` |
| `router restart <name>` | 重启路由服务 | `cccli router restart openai` |
| `router status` | 查看服务状态 | `cccli router status` |
| `router list` | 列出所有路由配置 | `cccli router list` |
| `router remove <name>` | 删除路由配置 | `cccli router remove openai` |

#### 快速配置命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `q <template> <auth_key> [model]` | 使用模板快速创建配置 | `cccli q zai sk-xxx claude-3-opus` |
| `q --list` | 列出所有可用模板 | `cccli q --list` |
| `q --init` | 初始化默认模板 | `cccli q --init` |

#### 导出命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `export json` | 导出所有配置为 JSON | `cccli export json` |

#### 代理配置

| 命令 | 说明 | 示例 |
|------|------|------|
| `proxy <name> <url>` | 为配置设置代理 | `cccli proxy zai http://127.0.0.1:7890` |
| `env <name> <key> <value>` | 设置环境变量 | `cccli env zai HTTP_PROXY http://proxy.com` |

#### 系统命令

| 命令 | 说明 |
|------|------|
| `upgrade` | 升级工具到最新版本 |
| `update` | 同 upgrade |
| `--version` | 显示版本信息 |
| `--help` | 显示帮助信息 |

### 可用模板

| 模板名称 | 服务提供商 | 基础 URL | 默认模型 |
|----------|----------|----------|----------|
| `kimi_coding` | 月之暗面 (Kimi) | https://api.kimi.com/coding | kimi-k2.5 |
| `kimi` | 月之暗面 (Moonshot) | https://api.moonshot.cn/anthropic | kimi-k2.5 |
| `ali_coding` | 阿里云 (通义千问) | https://coding.dashscope.aliyuncs.com/apps/anthropic | qwen3.5-plus |
| `poe` | Poe (Quora) | https://api.poe.com | claude-opus-4.6 |
| `zai` | 智谱AI (GLM) | https://open.bigmodel.cn/api/anthropic | glm-5 |
| `zai_coding` | 智谱AI (GLM) | https://open.bigmodel.cn/api/anthropic | glm-5 |
| `minimax` | MiniMax | https://api.minimaxi.com/anthropic | MiniMax-M2.7 |
| `minimax_coding` | MiniMax | https://api.minimaxi.com/anthropic | MiniMax-M2.7 |
| `ark` | 火山引擎 (字节跳动) | https://ark.cn-beijing.volces.com/api/compatible | doubao-seed-2-0-pro-260215 |
| `mimo` | 小米 (MiMo) | https://api.xiaomimimo.com/anthropic/v1/messages | mimo-v2-pro |
| `step_coding` | 阶跃星辰 (StepFun) | https://api.stepfun.com/step_plan | step-3.5-flash |
| `local` | 本地路由服务 | http://localhost:3000 | claude-3-5-sonnet-20241022 |

**注意:** `local` 模板用于配置本地路由服务（通过 `cccli router` 创建的服务）。如果使用了非默认端口（3000），创建配置后可用 `cccli set local URL http://localhost:3001` 修改。

### 配置文件位置

- **Windows**: `%USERPROFILE%\.cccli\config.json`
- **macOS/Linux**: `~/.cccli/config.json`

### 路由配置文件位置

- **Windows**: `%USERPROFILE%\.cccli\routers.json`
- **macOS/Linux**: `~/.cccli/routers.json`

### 使用示例

#### 场景 1：管理多个 AI 服务

```bash
# 配置 Kimi
cccli q kimi_coding sk-kimi-api-key
cccli active kimi_coding

# 切换到智谱AI
cccli q zai sk-zhipu-api-key
cccli active zai

# 使用模型参数创建配置
cccli q ali_coding sk-xxxxx claude-3-opus-20240229
cccli active ali_coding

# 配置小米 MiMo
cccli q mimo sk-mimo-api-key
cccli active mimo

# 配置阶跃星辰
cccli q step_coding sk-step-api-key
cccli active step_coding

# 配置本地路由服务（配合 cccli router 使用）
cccli router -n myopenai -u openai -k sk-openai-key
cccli router start myopenai
# router 只负责启动本地转换服务，请自行将 Claude Code 指向该地址
cccli q local sk-openai-key
cccli active local
```

#### 场景 2：使用本地路由服务

```bash
# 1. 先用 router 配置并启动本地路由服务
cccli router -n myopenai -u openai -k sk-your-openai-key
cccli router start myopenai

# 2. 使用 q local 快速配置 Claude Code 连接本地路由
# 如果路由端口不是 3000，请先修改 local 配置的 URL
cccli q local sk-your-openai-key
cccli active local

# 3. 现在 Claude Code 会通过本地路由访问 OpenAI API

# 4. 查看路由服务状态
cccli router status

# 5. 停止路由服务
cccli router stop myopenai
```

#### 场景 3：测试配置连通性

```bash
# 测试配置是否符合 Anthropic API 规范
cccli test ali_coding
```

测试会验证：
- API 地址是否可访问
- 认证信息是否正确
- 响应是否符合 Anthropic API 规范
- 显示可用模型列表

#### 场景 3：Claude Code 管理

```bash
# 安装 Claude Code
cccli cc install

# 更新 Claude Code
cccli cc update

# 升级 Claude Code
cccli cc upgrade

# 查看 Claude Code 版本
cccli cc version
```

#### 场景 4：使用快捷 Key 设置配置

```bash
# 使用快捷 Key 设置配置
cccli set myconfig TOKEN sk-xxxxx
cccli set myconfig URL https://api.example.com
cccli set myconfig MODEL claude-3-opus-20240229
cccli set myconfig HAIKU claude-3-haiku-20240307
cccli set myconfig OPUS claude-3-opus-20240229
cccli set myconfig SONNET claude-3-sonnet-20240229
cccli set myconfig REASON claude-3-opus-20240229
cccli set myconfig TEAMS true
```

**支持的 Key 快捷映射：**

| 快捷输入 | 完整配置项 |
|---------|-----------|
| `URL` | `ANTHROPIC_BASE_URL` |
| `TOKEN` | `ANTHROPIC_AUTH_TOKEN` |
| `KEY` | `ANTHROPIC_API_KEY` |
| `MODEL` | `ANTHROPIC_MODEL` |
| `HAIKU` | `ANTHROPIC_DEFAULT_HAIKU_MODEL` |
| `OPUS` | `ANTHROPIC_DEFAULT_OPUS_MODEL` |
| `SONNET` | `ANTHROPIC_DEFAULT_SONNET_MODEL` |
| `REASON` | `ANTHROPIC_REASONING_MODEL` |
| `TEAMS` | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |

#### 场景 5：导出配置备份

```bash
# 导出所有配置
cccli export json > backup.json

# 查看导出的配置
cat backup.json
```

#### 场景 6：使用代理

```bash
# 设置系统代理
cccli proxy http_proxy http://127.0.0.1:7890
cccli proxy https_proxy http://127.0.0.1:7890

# 清除代理
cccli proxy --unset http_proxy
```

#### 场景 7：使用 API 路由服务

通过 API 路由服务，你可以将 Anthropic 格式的请求转换为 OpenAI 格式，让 Claude Code 使用 OpenAI API。

```bash
# 1. 配置 OpenAI 官方路由（默认端口 3000）
# 支持 URL 快捷方式: openai, kimi, moonshot, zhipu, deepseek, ollama 等
cccli router -n openai -u openai -k sk-your-openai-key

# 2. 配置其他 OpenAI 兼容服务（如 Kimi，指定端口 3001）
cccli router -n kimi -u kimi -k sk-your-kimi-key -p 3001

# 3. 配置本地 Ollama 服务
cccli router -n local -u ollama -k dummy-key -p 11434

# 4. 查看已配置的路由
cccli router list

# 5. 后台启动路由服务
cccli router start openai

# 6. 查看运行中的服务状态
cccli router status

# 7. 停止路由服务
cccli router stop openai

# 8. 删除路由配置
cccli router remove openai
```

**URL 快捷方式列表：**

| 快捷方式 | 对应 URL |
|---------|---------|
| `openai` | `https://api.openai.com/v1` |
| `kimi`, `moonshot` | `https://api.moonshot.cn/v1` |
| `zhipu`, `glm` | `https://open.bigmodel.cn/api/anthropic` |
| `dashscope`, `ali`, `aliyun` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `minimax` | `https://api.minimaxi.com/anthropic` |
| `poe` | `https://api.poe.com` |
| `volcengine`, `ark`, `huoshan` | `https://ark.cn-beijing.volces.com/api/compatible` |
| `stepfun`, `step` | `https://api.stepfun.com/compatible-mode/v1` |
| `deepseek` | `https://api.deepseek.com/v1` |
| `baidu`, `qianfan` | `https://qianfan.baidubce.com/v2` |
| `siliconflow` | `https://api.siliconflow.cn/v1` |
| `xinference` | `http://localhost:9997/v1` |
| `ollama` | `http://localhost:11434/v1` |
| `lmstudio` | `http://localhost:1234/v1` |
| `vllm` | `http://localhost:8000/v1` |
| `textgen` | `http://localhost:5000/v1` |

**工作原理：**
- `router start` 只负责启动本地转换服务，不会修改 `~/.claude/settings.json`
- 路由服务会处理 Anthropic `/v1/messages`、`/v1/models`、`/v1/models/:id` 请求
- 路由服务将 Anthropic `/v1/messages` 请求转换为 OpenAI `/v1/chat/completions` 请求
- 支持流式响应（SSE）
- `model` 字段默认透传给上游服务

### Shell 自动补全

#### Bash
```bash
echo 'source <(cccli completion bash)' >> ~/.bashrc
source ~/.bashrc
```

#### Zsh
```bash
echo 'source <(cccli completion zsh)' >> ~/.zshrc
source ~/.zshrc
```

#### PowerShell
```powershell
Add-Content $PROFILE "Invoke-Expression (& { (cccli completion powershell | Out-String) })"
. $PROFILE
```

### 故障排除

#### 问题：命令未找到
```bash
# 确认全局安装路径
npm root -g

# 添加到 PATH（如果需要）
export PATH="$PATH:$(npm root -g)/.bin"
```

#### 问题：配置文件权限错误
```bash
# Linux/macOS
chmod 600 ~/.cccli/config.json
```

#### 查看详细错误信息
```bash
cccli --debug <command>
```

### 贡献

欢迎提交 Issue 和 Pull Request！

### 许可证

[MIT License](LICENSE)

---

## English

### Overview

CCCLI is a configuration management tool designed for Claude CLI, helping developers easily manage multiple API configurations and quickly switch between environments with convenient preset templates.

### Features

- 🎯 **Multi-environment configuration management** - Create and manage multiple independent API configurations
- ⚡ **Quick configuration switching** - One-click switching between different configurations
- 🚀 **Preset templates** - Built-in templates for Kimi, Alibaba, Poe, Zhipu and other popular AI services
- 🔄 **Configuration export and backup** - Export configurations to JSON format
- 🌐 **Proxy configuration** - Easily set up proxies for different configurations
- 💻 **Shell auto-completion** - Command-line auto-completion support
- 🎨 **Interactive configuration** - Friendly interactive configuration wizard
- 🛣️ **API Routing Service** - Convert Anthropic format requests to OpenAI format

### Installation

#### Global Installation

```bash
npm install -g @monxterlab/cccli
```

#### Local Installation

If you prefer to install locally in your project, you can use:

```bash
# Install to current project
npm install --save-dev @monxterlab/cccli

# Run via npx
npx cccli <command>

# Or run via npm scripts
npm run cccli -- <command>
```

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "cccli": "cccli",
    "cccli:set": "cccli set",
    "cccli:active": "cccli active",
    "cccli:list": "cccli list"
  }
}
```

Then run:

```bash
npm run cccli:list
npm run cccli:set my-config ANTHROPIC_BASE_URL https://api.example.com
```

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Quick Start

#### 1. Initialize configuration templates

```bash
cccli q --init
```

#### 2. Create your first configuration

```bash
# Create configuration using quick template
cccli q zai your-zhipu-api-key
```

#### 3. Activate configuration

```bash
cccli active zai
```

#### 4. Verify configuration

```bash
cccli get zai
```

### Command Reference

#### Basic Commands

| Command | Description | Example |
|---------|-------------|---------|
| `list` | List all configurations | `cccli list` |
| `get <name>` | View configuration details | `cccli get zai` |
| `set <name> <key> <value>` | Set configuration item (supports key shortcuts) | `cccli set myconfig TOKEN sk-xxxxx` |
| `unset <name> [key]` | Delete configuration or item | `cccli unset zai` |
| `active <name>` | Activate specified configuration | `cccli active zai` |

#### Test Command

| Command | Description | Example |
|---------|-------------|---------|
| `test <name>` | Test configuration connectivity (verify Anthropic API spec) | `cccli test ali_coding` |

#### Claude Code Management Commands

| Command | Description | Example |
|---------|-------------|---------|
| `cc install` | Install Claude Code | `cccli cc install` |
| `cc update` | Update Claude Code | `cccli cc update` |
| `cc upgrade` | Upgrade Claude Code (claude update) | `cccli cc upgrade` |
| `cc version` | Show Claude Code version | `cccli cc version` |

#### API Routing Commands

| Command | Description | Example |
|---------|-------------|---------|
| `router -n/--name <name> -u/--url <url|shortcut> -k/--key <key> [-p/--port <port>]` | Configure OpenAI API routing | `cccli router -n openai -u openai -k sk-xxx` |
| `router start <name>` | Start routing service in background | `cccli router start openai` |
| `router stop <name>` | Stop routing service | `cccli router stop openai` |
| `router restart <name>` | Restart routing service | `cccli router restart openai` |
| `router status` | Show service status | `cccli router status` |
| `router list` | List all routing configurations | `cccli router list` |
| `router remove <name>` | Remove routing configuration | `cccli router remove openai` |

#### Quick Configuration Commands

| Command | Description | Example |
|---------|-------------|---------|
| `q <template> <auth_key> [model]` | Create configuration using template | `cccli q zai sk-xxx claude-3-opus` |
| `q --list` | List all available templates | `cccli q --list` |
| `q --init` | Initialize default templates | `cccli q --init` |

#### Export Commands

| Command | Description | Example |
|---------|-------------|---------|
| `export json` | Export all configurations to JSON | `cccli export json` |

#### Proxy Configuration

| Command | Description | Example |
|---------|-------------|---------|
| `proxy <name> <url>` | Set proxy for configuration | `cccli proxy zai http://127.0.0.1:7890` |
| `env <name> <key> <value>` | Set environment variable | `cccli env zai HTTP_PROXY http://proxy.com` |

#### System Commands

| Command | Description |
|---------|-------------|
| `upgrade` | Upgrade tool to latest version |
| `update` | Same as upgrade |
| `--version` | Show version information |
| `--help` | Show help information |

### Available Templates

| Template Name | Service Provider | Base URL | Default Model |
|---------------|------------------|----------|---------------|
| `kimi_coding` | Moonshot (Kimi) | https://api.kimi.com/coding | kimi-k2.5 |
| `kimi` | Moonshot | https://api.moonshot.cn/anthropic | kimi-k2.5 |
| `ali_coding` | Alibaba Cloud (Qwen) | https://coding.dashscope.aliyuncs.com/apps/anthropic | qwen3.5-plus |
| `poe` | Poe (Quora) | https://api.poe.com | claude-opus-4.6 |
| `zai` | Zhipu AI (GLM) | https://open.bigmodel.cn/api/anthropic | glm-5 |
| `zai_coding` | Zhipu AI (GLM) | https://open.bigmodel.cn/api/anthropic | glm-5 |
| `minimax` | MiniMax | https://api.minimaxi.com/anthropic | MiniMax-M2.7 |
| `minimax_coding` | MiniMax | https://api.minimaxi.com/anthropic | MiniMax-M2.7 |
| `ark` | Volcano Engine (ByteDance) | https://ark.cn-beijing.volces.com/api/compatible | doubao-seed-2-0-pro-260215 |
| `mimo` | Xiaomi (MiMo) | https://api.xiaomimimo.com/anthropic/v1/messages | mimo-v2-pro |
| `step_coding` | StepFun | https://api.stepfun.com/step_plan | step-3.5-flash |
| `local` | Local Router Service | http://localhost:3000 | claude-3-5-sonnet-20241022 |

**Note:** The `local` template is used to configure a local router service (created via `cccli router`). If using a non-default port (3000), you can modify it after creation with `cccli set local URL http://localhost:3001`.

### Configuration File Location

- **Windows**: `%USERPROFILE%\.cccli\config.json`
- **macOS/Linux**: `~/.cccli/config.json`

### Routing Configuration File Location

- **Windows**: `%USERPROFILE%\.cccli\routers.json`
- **macOS/Linux**: `~/.cccli/routers.json`

### Usage Examples

#### Scenario 1: Manage multiple AI services

```bash
# Configure Kimi
cccli q kimi_coding sk-kimi-api-key
cccli active kimi_coding

# Switch to Zhipu AI
cccli q zai sk-zhipu-api-key
cccli active zai

# Configure Xiaomi MiMo
cccli q mimo sk-mimo-api-key
cccli active mimo

# Configure StepFun
cccli q step_coding sk-step-api-key
cccli active step_coding

# Configure local router service (for use with cccli router)
cccli router -n myopenai -u openai -k sk-openai-key
cccli router start myopenai
# The router only starts the local conversion service. Point Claude Code to it separately.
cccli q local sk-openai-key
cccli active local
```

#### Scenario 2: Using Local Router Service

```bash
# 1. First configure and start local router service
cccli router -n myopenai -u openai -k sk-your-openai-key
cccli router start myopenai

# 2. Use q local to quickly configure Claude Code to use the local router
# If the router port is not 3000, update the local config URL first
cccli q local sk-your-openai-key
cccli active local

# 3. Now Claude Code will access OpenAI API through the local router

# 4. Check router service status
cccli router status

# 5. Stop router service
cccli router stop myopenai
```

#### Scenario 3: Test configuration connectivity

```bash
# Test if configuration meets Anthropic API specification
cccli test ali_coding
```

Tests verify:
- API address is accessible
- Authentication is correct
- Response conforms to Anthropic API spec
- Displays available model list

#### Scenario 3: Claude Code Management

```bash
# Install Claude Code
cccli cc install

# Update Claude Code
cccli cc update

# Upgrade Claude Code
cccli cc upgrade

# Show Claude Code version
cccli cc version
```

#### Scenario 4: Use shortcut keys for configuration

```bash
# Use shortcut keys to set configuration
cccli set myconfig TOKEN sk-xxxxx
cccli set myconfig URL https://api.example.com
cccli set myconfig MODEL claude-3-opus-20240229
```

**Supported Key Shortcuts:**

| Shortcut | Full Configuration Key |
|---------|----------------------|
| `URL` | `ANTHROPIC_BASE_URL` |
| `TOKEN` | `ANTHROPIC_AUTH_TOKEN` |
| `KEY` | `ANTHROPIC_API_KEY` |
| `MODEL` | `ANTHROPIC_MODEL` |
| `HAIKU` | `ANTHROPIC_DEFAULT_HAIKU_MODEL` |
| `OPUS` | `ANTHROPIC_DEFAULT_OPUS_MODEL` |
| `SONNET` | `ANTHROPIC_DEFAULT_SONNET_MODEL` |
| `REASON` | `ANTHROPIC_REASONING_MODEL` |
| `TEAMS` | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |

#### Scenario 5: Export configuration backup

```bash
# Export all configurations
cccli export json > backup.json

# View exported configuration
cat backup.json
```

#### Scenario 6: Use proxy

```bash
# Set system proxy
cccli proxy http_proxy http://127.0.0.1:7890
cccli proxy https_proxy http://127.0.0.1:7890

# Clear proxy
cccli proxy --unset http_proxy
```

#### Scenario 7: Use API Routing Service

With the API routing service, you can convert Anthropic format requests to OpenAI format, allowing Claude Code to use OpenAI-compatible APIs.

```bash
# 1. Configure OpenAI official routing (default port 3000)
# Supports URL shortcuts: openai, kimi, moonshot, zhipu, deepseek, ollama, etc.
cccli router -n openai -u openai -k sk-your-openai-key

# 2. Configure other OpenAI-compatible services (e.g., Kimi with port 3001)
cccli router -n kimi -u kimi -k sk-your-kimi-key -p 3001

# 3. Configure local Ollama service
cccli router -n local -u ollama -k dummy-key -p 11434

# 4. List configured routes
cccli router list

# 5. Start routing service in background
cccli router start openai

# 6. Show running service status
cccli router status

# 7. Stop routing service
cccli router stop openai

# 8. Remove routing configuration
cccli router remove openai
```

**URL Shortcuts:**

| Shortcut | URL |
|---------|---------|
| `openai` | `https://api.openai.com/v1` |
| `kimi`, `moonshot` | `https://api.moonshot.cn/v1` |
| `zhipu`, `glm` | `https://open.bigmodel.cn/api/anthropic` |
| `dashscope`, `ali`, `aliyun` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `minimax` | `https://api.minimaxi.com/anthropic` |
| `poe` | `https://api.poe.com` |
| `volcengine`, `ark`, `huoshan` | `https://ark.cn-beijing.volces.com/api/compatible` |
| `stepfun`, `step` | `https://api.stepfun.com/compatible-mode/v1` |
| `deepseek` | `https://api.deepseek.com/v1` |
| `baidu`, `qianfan` | `https://qianfan.baidubce.com/v2` |
| `siliconflow` | `https://api.siliconflow.cn/v1` |
| `xinference` | `http://localhost:9997/v1` |
| `ollama` | `http://localhost:11434/v1` |
| `lmstudio` | `http://localhost:1234/v1` |
| `vllm` | `http://localhost:8000/v1` |
| `textgen` | `http://localhost:5000/v1` |

**How it works:**
- `router start` only starts the local conversion service; it does not modify `~/.claude/settings.json`
- The routing service handles Anthropic `/v1/messages`, `/v1/models`, and `/v1/models/:id`
- The routing service converts Anthropic `/v1/messages` requests to OpenAI `/v1/chat/completions` requests
- Supports streaming responses (SSE)
- The `model` field is passed through to the upstream service by default

### Shell Auto-completion

#### Bash
```bash
echo 'source <(cccli completion bash)' >> ~/.bashrc
source ~/.bashrc
```

#### Zsh
```bash
echo 'source <(cccli completion zsh)' >> ~/.zshrc
source ~/.zshrc
```

#### PowerShell
```powershell
Add-Content $PROFILE "Invoke-Expression (& { (cccli completion powershell | Out-String) })"
. $PROFILE
```

### Troubleshooting

#### Issue: Command not found
```bash
# Verify global installation path
npm root -g

# Add to PATH (if needed)
export PATH="$PATH:$(npm root -g)/.bin"
```

#### Issue: Configuration file permission error
```bash
# Linux/macOS
chmod 600 ~/.cccli/config.json
```

#### View detailed error messages
```bash
cccli --debug <command>
```

### Contributing

Issues and Pull Requests are welcome!

### License

[MIT License](LICENSE)
