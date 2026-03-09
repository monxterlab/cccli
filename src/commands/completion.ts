import { listConfigs } from '../config/storage';
import { getTemplateNames } from '../config/quick-config';

/**
 * 生成 Bash 补全脚本
 */
function generateBashCompletion(): string {
  const configs = listConfigs().join(' ');
  const templates = getTemplateNames().join(' ');

  return `# cccli Bash Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.bashrc 或 ~/.bash_profile:
#      source <(cc completion bash)
#   2. 或者保存到文件并 source:
#      cc completion bash > /etc/bash_completion.d/cc

_cccli_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    # 主命令列表
    local commands="set active list get env proxy help completion q unset ?"

    # 配置名称列表
    local configs="${configs}"

    # 模板列表
    local templates="${templates}"

    case \${COMP_CWORD} in
        1)
            # 第一个参数：主命令
            COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) )
            ;;
        2)
            # 第二个参数：根据命令补全
            case \${prev} in
                set|get|active|unset)
                    # 补全配置名称
                    COMPREPLY=( $(compgen -W "\${configs}" -- \${cur}) )
                    ;;
                q)
                    # 补全模板名称
                    COMPREPLY=( $(compgen -W "\${templates} --list --init --help" -- \${cur}) )
                    ;;
                env)
                    COMPREPLY=( $(compgen -W "proxy" -- \${cur}) )
                    ;;
                proxy)
                    COMPREPLY=( $(compgen -W "http_proxy https_proxy --unset" -- \${cur}) )
                    ;;
                completion)
                    COMPREPLY=( $(compgen -W "bash zsh fish" -- \${cur}) )
                    ;;
                *)
                    COMPREPLY=()
                    ;;
            esac
            ;;
        3)
            # 第三个参数
            local cmd="\${COMP_WORDS[1]}"
            case \${cmd} in
                set)
                    # set 命令的 key 补全
                    COMPREPLY=( $(compgen -W "ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY ANTHROPIC_BASE_URL CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS ANTHROPIC_MODEL ANTHROPIC_DEFAULT_HAIKU_MODEL ANTHROPIC_DEFAULT_OPUS_MODEL ANTHROPIC_DEFAULT_SONNET_MODEL ANTHROPIC_REASONING_MODEL" -- \${cur}) )
                    ;;
                proxy)
                    # proxy 命令的 proxy_name 补全
                    COMPREPLY=( $(compgen -W "http_proxy https_proxy" -- \${cur}) )
                    ;;
                unset)
                    # unset 命令的 --force 补全
                    COMPREPLY=( $(compgen -W "--force" -- \${cur}) )
                    ;;
                *)
                    COMPREPLY=()
                    ;;
            esac
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _cccli_completion cc
`;
}

/**
 * 生成 Zsh 补全脚本
 */
function generateZshCompletion(): string {
  const configs = listConfigs();
  const configsArray = configs.map(c => `        "${c}"`).join('\n');

  return `# cccli Zsh Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.zshrc:
#      source <(cc completion zsh)
#   2. 或者保存到 fpath 目录:
#      cc completion zsh > "\${fpath[1]}/_cc"

#compdef cc

_cccli() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'set:设置配置项'
        'active:激活指定配置'
        'list:列出所有配置'
        'get:查看配置详情'
        'env:查看环境变量配置'
        'proxy:设置代理环境变量'
        'completion:生成 Shell 补全脚本'
        'q:快速配置环境'
        'unset:删除指定配置'
        'help:显示帮助信息'
        '?:显示帮助信息'
    )

    _arguments -C \\\\
        '1: :>command' \\\\
        '2: :>config' \\\\
        '3: :>key' \\\\
        '*:: :>args'

    case "$state" in
        command)
            _describe -t commands 'cc commands' commands
            ;;
        config)
            case $line[1] in
                set|get|active|unset)
                    local -a configs
                    configs=(
${configsArray}
                    )
                    _describe -t configs 'configs' configs
                    ;;
                q)
                    local -a templates
                    templates=(${getTemplateNames().map(t => `"${t}"`).join(' ')})
                    _describe -t templates 'templates' templates
                    ;;
                env)
                    _values 'env options' 'proxy'
                    ;;
                proxy)
                    _values 'proxy options' 'http_proxy' 'https_proxy' '--unset'
                    ;;
                completion)
                    _values 'shell' 'bash' 'zsh' 'fish'
                    ;;
            esac
            ;;
        key)
            case $line[1] in
                set)
                    _values 'keys' \\\\
                        'ANTHROPIC_AUTH_TOKEN' \\\\
                        'ANTHROPIC_API_KEY' \\\\
                        'ANTHROPIC_BASE_URL' \\\\
                        'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS' \\\\
                        'ANTHROPIC_MODEL' \\\\
                        'ANTHROPIC_DEFAULT_HAIKU_MODEL' \\\\
                        'ANTHROPIC_DEFAULT_OPUS_MODEL' \\\\
                        'ANTHROPIC_DEFAULT_SONNET_MODEL' \\\\
                        'ANTHROPIC_REASONING_MODEL'
                    ;;
                proxy)
                    _values 'proxy names' 'http_proxy' 'https_proxy'
                    ;;
                unset)
                    _values 'unset options' '--force'
                    ;;
            esac
            ;;
    esac
}

_cccli "$@"
`;
}

/**
 * 生成 Fish 补全脚本
 */
function generateFishCompletion(): string {
  return `# cccli Fish Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.config/fish/completions/cc.fish:
#      cc completion fish > ~/.config/fish/completions/cc.fish

# 主命令补全
complete -c cc -f
complete -c cc -n '__fish_use_subcommand' -a 'set' -d '设置配置项'
complete -c cc -n '__fish_use_subcommand' -a 'active' -d '激活指定配置'
complete -c cc -n '__fish_use_subcommand' -a 'list' -d '列出所有配置'
complete -c cc -n '__fish_use_subcommand' -a 'get' -d '查看配置详情'
complete -c cc -n '__fish_use_subcommand' -a 'env' -d '查看环境变量配置'
complete -c cc -n '__fish_use_subcommand' -a 'proxy' -d '设置代理环境变量'
complete -c cc -n '__fish_use_subcommand' -a 'completion' -d '生成 Shell 补全脚本'
complete -c cc -n '__fish_use_subcommand' -a 'q' -d '快速配置环境'
complete -c cc -n '__fish_use_subcommand' -a 'unset' -d '删除指定配置'
complete -c cc -n '__fish_use_subcommand' -a 'help' -d '显示帮助信息'
complete -c cc -n '__fish_use_subcommand' -a '?' -d '显示帮助信息'

# 配置名称补全 (set, get, active, unset)
complete -c cc -n '__fish_seen_subcommand_from set get active unset' -a '(cc list 2>/dev/null | string replace "  - " "")' -d '配置名称'

# unset 命令的 --force 补全
complete -c cc -n '__fish_seen_subcommand_from unset' -a '--force' -d '强制删除'

# q 命令的模板补全
complete -c cc -n '__fish_seen_subcommand_from q' -a '(cc q --list 2>/dev/null | grep "^  " | string replace "  " "")' -d '模板名称'

# env 子命令补全
complete -c cc -n '__fish_seen_subcommand_from env' -a 'proxy' -d '查看系统代理'

# proxy 子命令补全
complete -c cc -n '__fish_seen_subcommand_from proxy' -a 'http_proxy https_proxy --unset' -d '代理变量'

# completion 子命令补全
complete -c cc -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish' -d 'Shell 类型'

# set 命令的 key 补全
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_AUTH_TOKEN' -d '认证令牌'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_API_KEY' -d 'API 密钥'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_BASE_URL' -d '基础 URL'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS' -d '实验性功能'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_MODEL' -d '模型'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_HAIKU_MODEL' -d 'Haiku 默认模型'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_OPUS_MODEL' -d 'Opus 默认模型'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_SONNET_MODEL' -d 'Sonnet 默认模型'
complete -c cc -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_REASONING_MODEL' -d '推理模型'
`;
}

/**
 * 显示补全脚本安装帮助
 */
function showInstallHelp(): void {
  console.log('Shell 补全脚本安装方法:');
  console.log('');
  console.log('Bash:');
  console.log('  临时使用 (当前会话):');
  console.log('    source <(cc completion bash)');
  console.log('');
  console.log('  永久生效 (推荐):');
  console.log('    cc completion bash >> ~/.bashrc');
  console.log('    # 或保存到系统目录:');
  console.log('    cc completion bash | sudo tee /etc/bash_completion.d/cc > /dev/null');
  console.log('');
  console.log('Zsh:');
  console.log('  临时使用 (当前会话):');
  console.log('    source <(cc completion zsh)');
  console.log('');
  console.log('  永久生效 (推荐):');
  console.log('    cc completion zsh >> ~/.zshrc');
  console.log('    # 或使用 fpath:');
  console.log('    cc completion zsh > "${fpath[1]}/_cc"');
  console.log('');
  console.log('Fish:');
  console.log('  直接保存到 completions 目录:');
  console.log('    cc completion fish > ~/.config/fish/completions/cc.fish');
  console.log('');
  console.log('Windows (PowerShell):');
  console.log('  PowerShell 补全暂不支持，建议使用 Git Bash 或 WSL');
  console.log('');
}

/**
 * completion 命令入口
 */
export function completionCommand(args: string[]): void {
  if (args.length === 0 || args[0] === '--help' || args[0] === 'help') {
    console.log('生成 Shell 自动补全脚本');
    console.log('');
    console.log('用法:');
    console.log('  cc completion <shell>        生成指定 Shell 的补全脚本');
    console.log('  cc completion --install      显示安装说明');
    console.log('');
    console.log('支持的 Shell:');
    console.log('  bash    生成 Bash 补全脚本');
    console.log('  zsh     生成 Zsh 补全脚本');
    console.log('  fish    生成 Fish 补全脚本');
    console.log('');
    console.log('示例:');
    console.log('  cc completion bash           # 输出 Bash 补全脚本');
    console.log('  cc completion zsh            # 输出 Zsh 补全脚本');
    console.log('  cc completion --install      # 显示安装说明');
    console.log('');
    console.log('快速安装:');
    console.log('  source <(cc completion bash) # Bash 临时启用');
    console.log('  source <(cc completion zsh)  # Zsh 临时启用');
    return;
  }

  const shell = args[0].toLowerCase();

  switch (shell) {
    case 'bash':
      console.log(generateBashCompletion());
      break;
    case 'zsh':
      console.log(generateZshCompletion());
      break;
    case 'fish':
      console.log(generateFishCompletion());
      break;
    case '--install':
      showInstallHelp();
      break;
    default:
      console.error(`错误: 不支持的 Shell "${shell}"`);
      console.error('');
      console.error('支持的 Shell: bash, zsh, fish');
      process.exit(1);
  }
}
