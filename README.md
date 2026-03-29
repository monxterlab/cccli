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
| `set <name> <key> <value>` | 设置配置项 | `cccli set zhhipu ANTHROPIC_BASE_URL https://api.example.com` |
| `unset <name> [key]` | 删除配置或配置项 | `cccli unset zhhipu` |
| `active <name>` | 激活指定配置 | `cccli active zhhipu` |

#### 快速配置命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `q <template> <key>` | 使用模板快速创建配置 | `cccli q zhhipu sk-xxx` |
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
| `zhhipu` | 智谱AI | https://open.bigmodel.cn/api/anthropic |

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
cccli q zhhipu sk-zhipu-api-key
cccli active zhhipu
```

#### 场景 2：导出配置备份

```bash
# 导出所有配置
cccli export json > backup.json

# 查看导出的配置
cat backup.json
```

#### 场景 3：使用代理

```bash
# 为特定配置设置代理
cccli proxy zhhipu http://127.0.0.1:7890
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
| `set <name> <key> <value>` | Set configuration item | `cccli set zhhipu ANTHROPIC_BASE_URL https://api.example.com` |
| `unset <name> [key]` | Delete configuration or item | `cccli unset zhhipu` |
| `active <name>` | Activate specified configuration | `cccli active zhhipu` |

#### Quick Configuration Commands

| Command | Description | Example |
|---------|-------------|---------|
| `q <template> <key>` | Create configuration using template | `cccli q zhhipu sk-xxx` |
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
| `zhhipu` | Zhipu AI | https://open.bigmodel.cn/api/anthropic |

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
cccli q zhhipu sk-zhipu-api-key
cccli active zhhipu
```

#### Scenario 2: Export configuration backup

```bash
# Export all configurations
cccli export json > backup.json

# View exported configuration
cat backup.json
```

#### Scenario 3: Use proxy

```bash
# Set proxy for specific configuration
cccli proxy zhhipu http://127.0.0.1:7890
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
