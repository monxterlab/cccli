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
cccli q zhhipu your-zhipu-api-key
```

#### 3. 激活配置

```bash
cccli active zhhipu
```

#### 4. 验证配置

```bash
cccli get zhhipu
```

### 命令参考

#### 基础命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `list` | 列出所有配置 | `cccli list` |
| `get <name>` | 查看指定配置详情 | `cccli get zhhipu` |
| `set <name> <key> <value>` | 设置配置项（支持Key快捷） | `cccli set myconfig TOKEN sk-xxxxx` |
| `unset <name> [key]` | 删除配置或配置项 | `cccli unset zhhipu` |
| `active <name>` | 激活指定配置 | `cccli active zhhipu` |

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
| `proxy <name> <url>` | 为配置设置代理 | `cccli proxy zhhipu http://127.0.0.1:7890` |
| `env <name> <key> <value>` | 设置环境变量 | `cccli env zhhipu HTTP_PROXY http://proxy.com` |

#### 系统命令

| 命令 | 说明 |
|------|------|
| `upgrade` | 升级工具到最新版本 |
| `--version` | 显示版本信息 |
| `--help` | 显示帮助信息 |

### 可用模板

| 模板名称 | 服务提供商 | 基础 URL |
|----------|----------|----------|
| `kimi_coding` | Kimi | https://api.kimi.com/coding |
| `kimi` | Moonshot | https://api.moonshot.cn/anthropic |
| `ali_coding` | 阿里云 | https://coding.dashscope.aliyuncs.com/apps/anthropic |
| `poe` | Poe | https://api.poe.com |
| `zai` | 智谱AI | https://open.bigmodel.cn/api/anthropic |
| `zai_coding` | 智谱AI Coding | https://open.bigmodel.cn/api/anthropic |
| `minimax` | MiniMax | https://api.minimaxi.com/anthropic |
| `minimax_coding` | MiniMax Coding | https://api.minimaxi.com/anthropic |
| `ark` | 火山方舟 | https://ark.cn-beijing.volces.com/api/compatible |

### 配置文件位置

- **Windows**: `%USERPROFILE%\.cccli\config.json`
- **macOS/Linux**: `~/.cccli/config.json`

### 使用示例

#### 场景 1：管理多个 AI 服务

```bash
# 配置 Kimi
cccli q kimi sk-kimi-api-key
cccli active kimi

# 切换到智谱AI
cccli q zai sk-zhipu-api-key
cccli active zai

# 使用模型参数创建配置
cccli q ali_coding sk-xxxxx claude-3-opus-20240229
cccli active ali_coding
```

#### 场景 2：测试配置连通性

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
cccli q zhhipu your-zhipu-api-key
```

#### 3. Activate configuration

```bash
cccli active zhhipu
```

#### 4. Verify configuration

```bash
cccli get zhhipu
```

### Command Reference

#### Basic Commands

| Command | Description | Example |
|---------|-------------|---------|
| `list` | List all configurations | `cccli list` |
| `get <name>` | View configuration details | `cccli get zhhipu` |
| `set <name> <key> <value>` | Set configuration item (supports key shortcuts) | `cccli set myconfig TOKEN sk-xxxxx` |
| `unset <name> [key]` | Delete configuration or item | `cccli unset zhhipu` |
| `active <name>` | Activate specified configuration | `cccli active zhhipu` |

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
| `proxy <name> <url>` | Set proxy for configuration | `cccli proxy zhhipu http://127.0.0.1:7890` |
| `env <name> <key> <value>` | Set environment variable | `cccli env zhhipu HTTP_PROXY http://proxy.com` |

#### System Commands

| Command | Description |
|---------|-------------|
| `upgrade` | Upgrade tool to latest version |
| `--version` | Show version information |
| `--help` | Show help information |

### Available Templates

| Template Name | Service Provider | Base URL |
|---------------|------------------|----------|
| `kimi_coding` | Kimi | https://api.kimi.com/coding |
| `kimi` | Moonshot | https://api.moonshot.cn/anthropic |
| `ali_coding` | Alibaba Cloud | https://coding.dashscope.aliyuncs.com/apps/anthropic |
| `poe` | Poe | https://api.poe.com |
| `zai` | Zhipu AI | https://open.bigmodel.cn/api/anthropic |
| `zai_coding` | Zhipu AI Coding | https://open.bigmodel.cn/api/anthropic |
| `minimax` | MiniMax | https://api.minimaxi.com/anthropic |
| `minimax_coding` | MiniMax Coding | https://api.minimaxi.com/anthropic |
| `ark` | Volcano Ark | https://ark.cn-beijing.volces.com/api/compatible |

### Configuration File Location

- **Windows**: `%USERPROFILE%\.cccli\config.json`
- **macOS/Linux**: `~/.cccli/config.json`

### Usage Examples

#### Scenario 1: Manage multiple AI services

```bash
# Configure Kimi
cccli q kimi sk-kimi-api-key
cccli active kimi

# Switch to Zhipu AI
cccli q zai sk-zhipu-api-key
cccli active zai
```

#### Scenario 2: Test configuration connectivity

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
