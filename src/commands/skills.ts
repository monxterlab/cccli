import { readdirSync, readFileSync, existsSync, statSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as readline from 'readline';

interface SkillInfo {
  name: string;
  level: 'system' | 'project';
  description: string;
  projectPath?: string;
  path?: string;  // skill 目录的完整路径
}

/**
 * 获取 Claude 系统级 skills 目录路径
 * Windows: %USERPROFILE%\.claude\skills
 * macOS/Linux: ~/.claude/skills
 */
function getSystemSkillsDir(): string {
  const homeDir = homedir();
  if (!homeDir) {
    throw new Error('无法获取用户主目录，请确保 HOME (macOS/Linux) 或 USERPROFILE (Windows) 环境变量已设置');
  }
  return join(homeDir, '.claude', 'skills');
}

/**
 * 获取 Claude 配置 JSON 文件路径
 * Windows: %USERPROFILE%\.claude.json
 * macOS/Linux: ~/.claude.json
 */
function getClaudeJsonPath(): string {
  const homeDir = homedir();
  if (!homeDir) {
    throw new Error('无法获取用户主目录，请确保 HOME (macOS/Linux) 或 USERPROFILE (Windows) 环境变量已设置');
  }
  return join(homeDir, '.claude.json');
}

/**
 * 从 SKILL.md 文件中提取描述
 */
function extractDescription(skillMdPath: string): string {
  if (!existsSync(skillMdPath)) {
    return '无描述';
  }

  try {
    const content = readFileSync(skillMdPath, 'utf-8');

    // 解析 YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];

      // 提取 description 字段
      const descMatch = frontmatter.match(/description:\s*\|?\s*([\s\S]*?)(?=\n\w+:|\n---|$)/);
      if (descMatch) {
        let description = descMatch[1].trim();
        // 处理多行描述，只取第一行摘要
        const lines = description.split('\n');
        // 取第一行非空行作为描述
        const firstLine = lines.find(line => line.trim().length > 0);
        return firstLine ? firstLine.trim() : '无描述';
      }
    }

    return '无描述';
  } catch {
    return '无描述';
  }
}

/**
 * 获取指定目录下的所有 skills
 */
function getSkillsFromDirectory(dir: string, level: 'system' | 'project', projectPath?: string): SkillInfo[] {
  const skills: SkillInfo[] = [];

  if (!existsSync(dir)) {
    return skills;
  }

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const skillPath = join(dir, entry);
      const skillMdPath = join(skillPath, 'SKILL.md');

      // 只处理目录，并且目录下有 SKILL.md 文件
      try {
        const stat = statSync(skillPath);
        if (stat.isDirectory()) {
          const description = extractDescription(skillMdPath);
          skills.push({
            name: entry,
            level,
            description,
            projectPath,
            path: skillPath  // 记录完整路径
          });
        }
      } catch {
        // 忽略无法访问的目录
      }
    }
  } catch {
    // 忽略无法读取的目录
  }

  return skills;
}

/**
 * 获取系统级 skills
 */
function getSystemSkills(): SkillInfo[] {
  try {
    const systemSkillsDir = getSystemSkillsDir();
    return getSkillsFromDirectory(systemSkillsDir, 'system');
  } catch (error: any) {
    console.error(`获取系统级 skills 失败: ${error.message}`);
    return [];
  }
}

/**
 * 获取项目级 skills
 */
function getProjectSkills(): SkillInfo[] {
  const skills: SkillInfo[] = [];

  try {
    const claudeJsonPath = getClaudeJsonPath();

    if (!existsSync(claudeJsonPath)) {
      return skills;
    }

    const content = readFileSync(claudeJsonPath, 'utf-8');
    const claudeConfig = JSON.parse(content);

    if (!claudeConfig.projects) {
      return skills;
    }

    // 获取所有项目路径
    const projectPaths = Object.keys(claudeConfig.projects);

    for (const projectPath of projectPaths) {
      // 项目路径在 JSON 中可能是绝对路径，直接使用
      // path.join 会自动处理不同操作系统的路径分隔符
      const projectSkillsDir = join(projectPath, '.claude', 'skills');
      const projectSkills = getSkillsFromDirectory(projectSkillsDir, 'project', projectPath);
      skills.push(...projectSkills);
    }
  } catch (error: any) {
    console.error(`获取项目级 skills 失败: ${error.message}`);
  }

  return skills;
}

/**
 * 获取所有 skills（包含完整路径信息）
 */
function getAllSkills(): SkillInfo[] {
  const systemSkills = getSystemSkills();
  const projectSkills = getProjectSkills();
  return [...systemSkills, ...projectSkills];
}

/**
 * 查找指定名称的所有 skills
 */
function findSkillsByName(name: string): SkillInfo[] {
  const allSkills = getAllSkills();
  return allSkills.filter(skill => skill.name === name);
}

/**
 * 删除指定路径的 skill
 */
function deleteSkill(skill: SkillInfo): boolean {
  if (!skill.path) {
    console.error('无法删除: skill 路径信息缺失');
    return false;
  }

  try {
    rmSync(skill.path, { recursive: true, force: true });
    return true;
  } catch (error: any) {
    console.error(`删除失败: ${error.message}`);
    return false;
  }
}

/**
 * 创建 readline 接口用于用户交互
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 提示用户选择要删除的 skill
 */
async function promptUserSelection(skills: SkillInfo[]): Promise<number | null> {
  const rl = createReadlineInterface();

  console.log('');
  console.log(`发现 ${skills.length} 个同名 skill "${skills[0].name}":`);
  console.log('');

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const levelText = skill.level === 'system' ? '系统级' : '项目级';
    const projectText = skill.projectPath ? ` (${skill.projectPath})` : '';
    console.log(`  ${i + 1}. [${levelText}]${projectText}`);
    console.log(`     描述: ${skill.description}`);
    console.log(`     路径: ${skill.path}`);
    console.log('');
  }

  console.log(`  0. 取消删除`);
  console.log('');

  return new Promise((resolve) => {
    rl.question('请选择要删除的 skill (输入数字): ', (answer) => {
      rl.close();

      const choice = parseInt(answer.trim(), 10);

      if (choice === 0) {
        resolve(null);  // 用户取消
      } else if (choice >= 1 && choice <= skills.length) {
        resolve(choice - 1);  // 返回索引
      } else {
        console.error('无效的选择');
        resolve(null);
      }
    });
  });
}

/**
 * 确认删除
 */
async function confirmDelete(skill: SkillInfo): Promise<boolean> {
  const rl = createReadlineInterface();

  const levelText = skill.level === 'system' ? '系统级' : '项目级';
  const projectText = skill.projectPath ? ` (${skill.projectPath})` : '';

  console.log('');
  console.log(`即将删除 [${levelText}]${projectText} skill "${skill.name}"`);
  console.log(`路径: ${skill.path}`);
  console.log('');

  return new Promise((resolve) => {
    rl.question('确认删除? (y/n): ', (answer) => {
      rl.close();

      const confirmed = answer.trim().toLowerCase() === 'y';
      resolve(confirmed);
    });
  });
}

/**
 * 删除 skill 的主逻辑
 */
async function removeSkill(skillName: string): Promise<void> {
  const skills = findSkillsByName(skillName);

  if (skills.length === 0) {
    console.log(`未找到 skill "${skillName}"`);
    return;
  }

  // 如果只有一个，直接确认删除
  if (skills.length === 1) {
    const confirmed = await confirmDelete(skills[0]);

    if (!confirmed) {
      console.log('已取消删除');
      return;
    }

    const success = deleteSkill(skills[0]);

    if (success) {
      console.log(`✅ 已成功删除 skill "${skillName}"`);
    } else {
      console.log(`❌ 删除失败`);
    }
    return;
  }

  // 多个同名 skill，让用户选择
  const selectedIndex = await promptUserSelection(skills);

  if (selectedIndex === null) {
    console.log('已取消删除');
    return;
  }

  const selectedSkill = skills[selectedIndex];
  const confirmed = await confirmDelete(selectedSkill);

  if (!confirmed) {
    console.log('已取消删除');
    return;
  }

  const success = deleteSkill(selectedSkill);

  if (success) {
    console.log(`✅ 已成功删除 skill "${skillName}"`);
  } else {
    console.log(`❌ 删除失败`);
  }
}

/**
 * 列出所有 skills
 */
function listSkills(): void {
  const systemSkills = getSystemSkills();
  const projectSkills = getProjectSkills();
  const allSkills = [...systemSkills, ...projectSkills];

  if (allSkills.length === 0) {
    console.log('暂无 skills');
    console.log('');
    console.log('系统级 skills 目录: ~/.claude/skills/');
    console.log('项目级 skills 目录: <项目路径>/.claude/skills/');
    return;
  }

  console.log('Claude Skills 列表:');
  console.log('');

  // 显示系统级 skills
  if (systemSkills.length > 0) {
    console.log('系统级 Skills:');
    for (const skill of systemSkills) {
      console.log(`  - ${skill.name}`);
      console.log(`    描述: ${skill.description}`);
    }
    console.log('');
  }

  // 显示项目级 skills
  if (projectSkills.length > 0) {
    console.log('项目级 Skills:');
    for (const skill of projectSkills) {
      console.log(`  - ${skill.name}`);
      console.log(`    描述: ${skill.description}`);
      console.log(`    项目: ${skill.projectPath}`);
    }
    console.log('');
  }

  console.log(`共 ${allSkills.length} 个 skills`);
}

export async function skillsCommand(args: string[]): Promise<void> {
  // 删除 skill
  if (args[0] === '--remove' || args[0] === '-r') {
    if (args.length < 2) {
      console.error('用法: cccli skills --remove <skill-name>');
      console.error('       cccli skills -r <skill-name>');
      process.exit(1);
    }

    const skillName = args[1];
    await removeSkill(skillName);
    return;
  }

  // 列出 skills
  if (args.length === 0 || args[0] === '--list' || args[0] === '-l' || args[0] === 'list') {
    listSkills();
    return;
  }

  console.error('用法: cccli skills --list');
  console.error('       cccli skills -l');
  console.error('       cccli skills list');
  console.error('       cccli skills --remove <skill-name>');
  console.error('       cccli skills -r <skill-name>');
  process.exit(1);
}