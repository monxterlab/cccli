import { listConfigs } from '../config/storage';
import { getTemplateNames } from '../config/quick-config';
import { listRouterConfigs } from '../config/router-storage';

/**
 * 生成 Bash 补全脚本
 */
function generateBashCompletion(): string {
  const configs = listConfigs().join(' ');
  const templates = getTemplateNames().join(' ');
  const routers = listRouterConfigs().map(r => r.name).join(' ');
  const urlShortcuts = 'openai kimi moonshot zhipu glm dashscope ali aliyun minimax poe volcengine ark huoshan stepfun step deepseek baidu qianfan siliconflow xinference ollama lmstudio vllm textgen';

  return `# cccli Bash Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.bashrc 或 ~/.bash_profile:
#      source <(cccli completion bash)
#   2. 或者保存到文件并 source:
#      cccli completion bash > /etc/bash_completion.d/cccli

_cccli_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    # 主命令列表
    local commands="set active list get env proxy help completion q unset test upgrade update cc skills router ?"

    # 配置名称列表
    local configs="${configs}"

    # 模板列表
    local templates="${templates}"

    # 路由列表
    local routers="${routers}"

    case \${COMP_CWORD} in
        1)
            # 第一个参数：主命令
            COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) )
            ;;
        2)
            # 第二个参数：根据命令补全
            case \${prev} in
                set|get|active|unset|test)
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
                cc)
                    COMPREPLY=( $(compgen -W "install update upgrade version" -- \${cur}) )
                    ;;
                skills)
                    COMPREPLY=( $(compgen -W "--list -l list --remove -r" -- \${cur}) )
                    ;;
                router)
                    COMPREPLY=( $(compgen -W "start stop restart status list remove -n --name -u --url -k --key -p --port" -- \${cur}) )
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
                router)
                    # router 命令的子命令补全（start/stop/restart/status/remove 后的路由名称）
                    local router_subcmd="\${COMP_WORDS[2]}"
                    case "\${router_subcmd}" in
                        start|stop|restart|remove)
                            COMPREPLY=( $(compgen -W "${routers}" -- \${cur}) )
                            ;;
                        -u|--url)
                            COMPREPLY=( $(compgen -W "${urlShortcuts}" -- \${cur}) )
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
            ;;
        4)
            # 第四个参数
            local cmd="\${COMP_WORDS[1]}"
            case \${cmd} in
                router)
                    local prev_arg="\${COMP_WORDS[COMP_CWORD-1]}"
                    case "\${prev_arg}" in
                        -u|--url)
                            COMPREPLY=( $(compgen -W "${urlShortcuts}" -- \${cur}) )
                            ;;
                        start|stop|restart|remove)
                            COMPREPLY=( $(compgen -W "${routers}" -- \${cur}) )
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
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _cccli_completion cccli
`;
}

/**
 * 生成 Zsh 补全脚本
 */
function generateZshCompletion(): string {
  const configs = listConfigs();
  const configsArray = configs.map(c => `        "${c}"`).join('\n');
  const urlShortcuts = 'openai kimi moonshot zhipu glm dashscope ali aliyun minimax poe volcengine ark huoshan stepfun step deepseek baidu qianfan siliconflow xinference ollama lmstudio vllm textgen';

  return `# cccli Zsh Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.zshrc:
#      source <(cccli completion zsh)
#   2. 或者保存到 fpath 目录:
#      cccli completion zsh > "\${fpath[1]}/_cccli"

#compdef cccli

_cccli() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'set:设置配置项'
        'active:激活指定配置'
        'list:列出所有配置'
        'get:查看配置详情'
        'test:测试配置连通性'
        'cc:Claude Code 管理'
        'skills:列出所有 skills'
        'env:查看环境变量配置'
        'proxy:设置代理环境变量'
        'completion:生成 Shell 补全脚本'
        'q:快速配置环境'
        'unset:删除指定配置'
        'upgrade:更新到最新版本'
        'update:同 upgrade'
        'router:API 路由服务'
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
            _describe -t commands 'cccli commands' commands
            ;;
        config)
            case $line[1] in
                set|get|active|unset|test)
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
                cc)
                    _values 'subcommand' 'install' 'update' 'upgrade' 'version'
                    ;;
                skills)
                    _values 'skills options' '--list' '-l' 'list' '--remove' '-r'
                    ;;
                router)
                    _values 'router options' 'start' 'stop' 'restart' 'status' 'list' 'remove' '-n[路由名称]' '--name[路由名称]' '-u[上游 URL 或快捷方式]' '--url[上游 URL 或快捷方式]' '-k[API Key]' '--key[API Key]' '-p[监听端口]' '--port[监听端口]'
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
                router)
                    case $line[2] in
                        -u|--url)
                            _values 'router url shortcuts' ${urlShortcuts}
                            ;;
                    esac
                    ;;
            esac
            ;;
        router)
            # router 命令的子命令
            case $line[2] in
                start|stop|restart|remove)
                    local -a routers
                    routers=(${listRouterConfigs().map(r => `"${r.name}"`).join(' ')})
                    _describe -t routers 'routers' routers
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
  const urlShortcuts = 'openai kimi moonshot zhipu glm dashscope ali aliyun minimax poe volcengine ark huoshan stepfun step deepseek baidu qianfan siliconflow xinference ollama lmstudio vllm textgen';
  return `# cccli Fish Completion
# 安装方法:
#   1. 将以下内容添加到 ~/.config/fish/completions/cccli.fish:
#      cccli completion fish > ~/.config/fish/completions/cccli.fish

# 主命令补全
complete -c cccli -f
complete -c cccli -n '__fish_use_subcommand' -a 'set' -d '设置配置项'
complete -c cccli -n '__fish_use_subcommand' -a 'active' -d '激活指定配置'
complete -c cccli -n '__fish_use_subcommand' -a 'list' -d '列出所有配置'
complete -c cccli -n '__fish_use_subcommand' -a 'get' -d '查看配置详情'
complete -c cccli -n '__fish_use_subcommand' -a 'test' -d '测试配置连通性'
complete -c cccli -n '__fish_use_subcommand' -a 'cc' -d 'Claude Code 管理'
complete -c cccli -n '__fish_use_subcommand' -a 'skills' -d '列出所有 skills'
complete -c cccli -n '__fish_use_subcommand' -a 'env' -d '查看环境变量配置'
complete -c cccli -n '__fish_use_subcommand' -a 'proxy' -d '设置代理环境变量'
complete -c cccli -n '__fish_use_subcommand' -a 'completion' -d '生成 Shell 补全脚本'
complete -c cccli -n '__fish_use_subcommand' -a 'q' -d '快速配置环境'
complete -c cccli -n '__fish_use_subcommand' -a 'unset' -d '删除指定配置'
complete -c cccli -n '__fish_use_subcommand' -a 'upgrade' -d '更新到最新版本'
complete -c cccli -n '__fish_use_subcommand' -a 'update' -d '同 upgrade'
complete -c cccli -n '__fish_use_subcommand' -a 'router' -d 'API 路由服务'
complete -c cccli -n '__fish_use_subcommand' -a 'help' -d '显示帮助信息'
complete -c cccli -n '__fish_use_subcommand' -a '?' -d '显示帮助信息'

# router 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'start' -d '启动路由服务'
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'stop' -d '停止路由服务'
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'restart' -d '重启路由服务'
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'status' -d '查看路由状态'
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'list' -d '列出所有路由'
complete -c cccli -n '__fish_seen_subcommand_from router' -a 'remove' -d '删除路由配置'
complete -c cccli -n '__fish_seen_subcommand_from router' -s n -l name -d '路由名称'
complete -c cccli -n '__fish_seen_subcommand_from router' -s u -l url -a '${urlShortcuts}' -d '上游 URL 或快捷方式'
complete -c cccli -n '__fish_seen_subcommand_from router' -s k -l key -d 'OpenAI API Key'
complete -c cccli -n '__fish_seen_subcommand_from router' -s p -l port -d '监听端口'

# router start/remove 后面的路由名称补全
complete -c cccli -n '__fish_seen_subcommand_from router; and __fish_seen_subcommand_from start stop restart remove' -a '(cccli router list 2>/dev/null | grep "^  " | string replace "  " "" | string split " " -f 1)' -d '路由名称'

# 配置名称补全 (set, get, active, unset, test)
complete -c cccli -n '__fish_seen_subcommand_from set get active unset test' -a '(cccli list 2>/dev/null | string replace "  - " "")' -d '配置名称'

# unset 命令的 --force 补全
complete -c cccli -n '__fish_seen_subcommand_from unset' -a '--force' -d '强制删除'

# q 命令的模板补全
complete -c cccli -n '__fish_seen_subcommand_from q' -a '(cccli q --list 2>/dev/null | grep "^  " | string replace "  " "")' -d '模板名称'

# env 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from env' -a 'proxy' -d '查看系统代理'

# proxy 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from proxy' -a 'http_proxy https_proxy --unset' -d '代理变量'

# completion 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish' -d 'Shell 类型'

# cc 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from cc' -a 'install' -d '安装 Claude Code'
complete -c cccli -n '__fish_seen_subcommand_from cc' -a 'update' -d '更新 Claude Code'
complete -c cccli -n '__fish_seen_subcommand_from cc' -a 'upgrade' -d '升级 Claude Code'
complete -c cccli -n '__fish_seen_subcommand_from cc' -a 'version' -d '查看 Claude Code 版本'

# skills 子命令补全
complete -c cccli -n '__fish_seen_subcommand_from skills' -a '--list' -d '列出所有 skills'
complete -c cccli -n '__fish_seen_subcommand_from skills' -a '-l' -d '列出所有 skills'
complete -c cccli -n '__fish_seen_subcommand_from skills' -a 'list' -d '列出所有 skills'
complete -c cccli -n '__fish_seen_subcommand_from skills' -a '--remove' -d '删除指定 skill'
complete -c cccli -n '__fish_seen_subcommand_from skills' -a '-r' -d '删除指定 skill'

# skills --remove/-r 后面补全 skill 名称
complete -c cccli -n '__fish_seen_subcommand_from skills; and __fish_seen_subcommand_from --remove -r' -a '(cccli skills --list 2>/dev/null | grep "^  - " | string replace "  - " "" | string replace "    描述:.*" "")' -d 'skill 名称'

# set 命令的 key 补全
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_AUTH_TOKEN' -d '认证令牌'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_API_KEY' -d 'API 密钥'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_BASE_URL' -d '基础 URL'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS' -d '实验性功能'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_MODEL' -d '模型'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_HAIKU_MODEL' -d 'Haiku 默认模型'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_OPUS_MODEL' -d 'Opus 默认模型'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_DEFAULT_SONNET_MODEL' -d 'Sonnet 默认模型'
complete -c cccli -n '__fish_seen_subcommand_from set' -a 'ANTHROPIC_REASONING_MODEL' -d '推理模型'
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
  console.log('    source <(cccli completion bash)');
  console.log('');
  console.log('  永久生效 (推荐):');
  console.log('    cccli completion bash >> ~/.bashrc');
  console.log('    # 或保存到系统目录:');
  console.log('    cccli completion bash | sudo tee /etc/bash_completion.d/cccli > /dev/null');
  console.log('');
  console.log('Zsh:');
  console.log('  临时使用 (当前会话):');
  console.log('    source <(cccli completion zsh)');
  console.log('');
  console.log('  永久生效 (推荐):');
  console.log('    cccli completion zsh >> ~/.zshrc');
  console.log('    # 或使用 fpath:');
  console.log('    cccli completion zsh > "${fpath[1]}/_cccli"');
  console.log('');
  console.log('Fish:');
  console.log('  直接保存到 completions 目录:');
  console.log('    cccli completion fish > ~/.config/fish/completions/cccli.fish');
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
    console.log('  cccli completion <shell>        生成指定 Shell 的补全脚本');
    console.log('  cccli completion --install      显示安装说明');
    console.log('');
    console.log('支持的 Shell:');
    console.log('  bash    生成 Bash 补全脚本');
    console.log('  zsh     生成 Zsh 补全脚本');
    console.log('  fish    生成 Fish 补全脚本');
    console.log('');
    console.log('示例:');
    console.log('  cccli completion bash           # 输出 Bash 补全脚本');
    console.log('  cccli completion zsh            # 输出 Zsh 补全脚本');
    console.log('  cccli completion --install      # 显示安装说明');
    console.log('');
    console.log('快速安装:');
    console.log('  source <(cccli completion bash) # Bash 临时启用');
    console.log('  source <(cccli completion zsh)  # Zsh 临时启用');
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
