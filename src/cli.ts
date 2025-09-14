#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Agent {
  name: string;
  filename: string;
  description: string;
  model?: string;
  color?: string;
  tags: string[];
  mcps?: string[];
}

interface Doc {
  name: string;
  filename: string;
  description: string;
  category?: string;
  color?: string;
  tags: string[];
}

interface McpServer {
  name: string;
  description: string;
  type: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  category: string;
  tags: string[];
}

interface McpRegistry {
  version: string;
  mcpServers: Record<string, McpServer>;
}

interface McpItem {
  name: string;
  description: string;
  package?: string;
  category: string;
  technologies?: string[];
  setup_guide?: string;
  auto_install?: boolean;
  required_by?: string[];
  color?: string;
  tags: string[];
  homepage?: string;
  installation?: {
    command: string;
    args: string[];
    config: {
      mcpServers: Record<string, any>;
    };
  };
}

interface McpItemRegistry {
  mcps: McpItem[];
}

interface LocalConfig {
  installPath: string;
  installedAgents: Array<{
    name: string;
    installedAt: string;
    location: string;
  }>;
  installedDocs: Array<{
    name: string;
    installedAt: string;
    location: string;
  }>;
  installedMcps?: Array<{
    name: string;
    installedAt: string;
    package?: string;
  }>;
}

const program = new Command();

async function getRegistry(): Promise<Agent[]> {
  try {
    // Read from local agents directory in the package
    const agentsDir = path.join(__dirname, '..', 'agents');
    const registryPath = path.join(agentsDir, 'registry.json');

    if (await fs.pathExists(registryPath)) {
      const registry = await fs.readJson(registryPath);
      return registry.agents;
    }

    // Fallback: scan directory for .md files
    if (await fs.pathExists(agentsDir)) {
      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter((f) => f.endsWith('.md'));

      const agents: Agent[] = [];
      for (const file of agentFiles) {
        const content = await fs.readFile(path.join(agentsDir, file), 'utf-8');
        const { data } = matter(content);

        if (data.name) {
          agents.push({
            name: data.name,
            filename: file,
            description: data.description || '',
            model: data.model,
            color: data.color,
            tags: data.tags || [],
            mcps: data.mcps || [],
          });
        }
      }
      return agents;
    }

    return [];
  } catch (error) {
    console.error(chalk.red('Failed to load agent registry:'), error);
    return [];
  }
}

async function getDocsRegistry(): Promise<Doc[]> {
  try {
    // Read from local docs directory in the package
    const docsDir = path.join(__dirname, '..', 'docs');
    const registryPath = path.join(docsDir, 'registry.json');

    if (await fs.pathExists(registryPath)) {
      const registry = await fs.readJson(registryPath);
      return registry.docs;
    }

    // Fallback: scan directory for .md files
    if (await fs.pathExists(docsDir)) {
      const files = await fs.readdir(docsDir);
      const docFiles = files.filter((f) => f.endsWith('.md'));

      const docs: Doc[] = [];
      for (const file of docFiles) {
        const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
        const { data } = matter(content);

        const name = file.replace('.md', '');
        docs.push({
          name: data.name || name,
          filename: file,
          description: data.description || 'Documentation guide',
          category: data.category,
          color: data.color || 'cyan',
          tags: data.tags || [],
        });
      }
      return docs;
    }

    return [];
  } catch (error) {
    console.error(chalk.red('Failed to load docs registry:'), error);
    return [];
  }
}

async function getLocalConfig(): Promise<LocalConfig> {
  const configPath = path.join(process.cwd(), '.aicraft', 'config.json');

  const defaultConfig: LocalConfig = {
    installPath: '.claude/agents/',
    installedAgents: [],
    installedDocs: [],
  };

  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
  } catch (error) {
    // Config doesn't exist or is invalid
  }

  return defaultConfig;
}

async function saveLocalConfig(config: LocalConfig): Promise<void> {
  const configPath = path.join(process.cwd(), '.aicraft', 'config.json');
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, config, { spaces: 2 });
}

async function getMcpRegistry(): Promise<McpRegistry> {
  try {
    const agentsDir = path.join(__dirname, '..', 'agents');
    const mcpRegistryPath = path.join(agentsDir, 'mcp-registry.json');

    if (await fs.pathExists(mcpRegistryPath)) {
      return await fs.readJson(mcpRegistryPath);
    }

    return { version: '1.0.0', mcpServers: {} };
  } catch (error) {
    console.error(chalk.red('Failed to load MCP registry:'), error);
    return { version: '1.0.0', mcpServers: {} };
  }
}

async function getMcpItemRegistry(): Promise<McpItem[]> {
  try {
    const mcpsDir = path.join(__dirname, '..', 'mcps');
    const registryPath = path.join(mcpsDir, 'registry.json');

    if (await fs.pathExists(registryPath)) {
      const registry: McpItemRegistry = await fs.readJson(registryPath);
      return registry.mcps || [];
    }

    return [];
  } catch (error) {
    console.error(chalk.red('Failed to load MCP items registry:'), error);
    return [];
  }
}

async function processApiKeys(mcpServer: McpServer, mcpName: string): Promise<McpServer> {
  // Function to extract variable placeholders like ${VARIABLE_NAME}
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\$\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(2, -1)) : [];
  };

  // Find all variables in env and args
  const envVariables = new Set<string>();
  const argsVariables = new Set<string>();

  // Check env variables
  Object.values(mcpServer.env).forEach(value => {
    if (typeof value === 'string') {
      extractVariables(value).forEach(variable => envVariables.add(variable));
    }
  });

  // Check args variables
  mcpServer.args.forEach(arg => {
    extractVariables(arg).forEach(variable => argsVariables.add(variable));
  });

  const allVariables = new Set([...envVariables, ...argsVariables]);

  if (allVariables.size === 0) {
    // No API keys required, return as-is
    return mcpServer;
  }

  console.log(chalk.yellow(`\n${mcpName} requires API key configuration:`));
  
  const apiKeyValues: Record<string, string> = {};

  // Prompt for each required variable
  for (const variable of allVariables) {
    const { value } = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message: `Enter ${variable}:`,
        mask: '*',
        validate: (input) => input.trim() !== '' || 'API key cannot be empty',
      },
    ]);
    apiKeyValues[variable] = value;
  }

  // Create a copy of the server config and replace placeholders
  const processedServer: McpServer = {
    ...mcpServer,
    env: { ...mcpServer.env },
    args: [...mcpServer.args],
  };

  // Replace variables in env
  Object.keys(processedServer.env).forEach(key => {
    if (typeof processedServer.env[key] === 'string') {
      Object.entries(apiKeyValues).forEach(([variable, value]) => {
        processedServer.env[key] = processedServer.env[key].replace(
          new RegExp(`\\$\\{${variable}\\}`, 'g'),
          value
        );
      });
    }
  });

  // Replace variables in args
  processedServer.args = processedServer.args.map(arg => {
    let processedArg = arg;
    Object.entries(apiKeyValues).forEach(([variable, value]) => {
      processedArg = processedArg.replace(
        new RegExp(`\\$\\{${variable}\\}`, 'g'),
        value
      );
    });
    return processedArg;
  });

  console.log(chalk.green(`✓ API keys configured for ${mcpName}`));
  return processedServer;
}

async function installMcps(mcpNames: string[]): Promise<void> {
  if (!mcpNames || mcpNames.length === 0) return;

  const mcpRegistry = await getMcpRegistry();
  const mcpConfigPath = path.join(process.cwd(), '.mcp.json');

  // Read existing MCP config or create new one
  let existingConfig: { mcpServers: Record<string, any> } = { mcpServers: {} };

  try {
    if (await fs.pathExists(mcpConfigPath)) {
      existingConfig = await fs.readJson(mcpConfigPath);
    }
  } catch (error) {
    // Config doesn't exist or is invalid
  }

  // Add new MCP servers
  for (const mcpName of mcpNames) {
    const mcpServer = mcpRegistry.mcpServers[mcpName];
    if (mcpServer) {
      // Process the MCP configuration and prompt for API keys if needed
      const processedConfig = await processApiKeys(mcpServer, mcpName);
      
      existingConfig.mcpServers[mcpName] = {
        type: processedConfig.type,
        command: processedConfig.command,
        args: processedConfig.args,
        env: processedConfig.env,
      };
    }
  }

  // Save updated config
  await fs.writeJson(mcpConfigPath, existingConfig, { spaces: 2 });

  // Update Claude settings to enable the new MCP servers
  await updateClaudeSettings(mcpNames);
}

async function updateClaudeSettings(mcpNames: string[]): Promise<void> {
  const settingsPath = path.join(process.cwd(), '.claude', 'settings.local.json');

  let settings = {
    enabledMcpjsonServers: [] as string[],
    enableAllProjectMcpServers: true,
  };

  try {
    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJson(settingsPath);
    }
  } catch (error) {
    // Settings file doesn't exist or is invalid
  }

  // Add new MCP servers to enabled list
  for (const mcpName of mcpNames) {
    if (!settings.enabledMcpjsonServers.includes(mcpName)) {
      settings.enabledMcpjsonServers.push(mcpName);
    }
  }

  // Ensure enableAllProjectMcpServers is set
  settings.enableAllProjectMcpServers = true;

  // Save updated settings
  await fs.ensureDir(path.dirname(settingsPath));
  await fs.writeJson(settingsPath, settings, { spaces: 2 });
}

async function appendDocToClaude(docName: string, docDescription: string): Promise<void> {
  const claudeFilePath = path.join(process.cwd(), 'CLAUDE.md');

  try {
    // Check if CLAUDE.md exists
    if (!(await fs.pathExists(claudeFilePath))) {
      console.log(chalk.yellow('CLAUDE.md not found. Run "npx aicraft init" to create it.'));
      return;
    }

    // Read current content
    let content = await fs.readFile(claudeFilePath, 'utf-8');

    // Check if Quick References section exists
    if (!content.includes('## Quick References')) {
      // Add Quick References section before the first ## section or at the end
      const firstSectionIndex = content.indexOf('\n## ');
      if (firstSectionIndex > -1) {
        content =
          content.slice(0, firstSectionIndex) +
          '\n## Quick References\n\nFor specific deployment tasks, check these documentation files:\n' +
          content.slice(firstSectionIndex);
      } else {
        content +=
          '\n\n## Quick References\n\nFor specific deployment tasks, check these documentation files:\n';
      }
    }

    // Find the Quick References section and add the doc reference
    const quickRefPattern = /## Quick References[\s\S]*?(?=\n## |\n$)/;
    const quickRefMatch = content.match(quickRefPattern);

    if (quickRefMatch) {
      const quickRefSection = quickRefMatch[0];
      const docReference = `\n- **${docName}**: Available in \`docs/${docName}.md\` - ${docDescription}`;

      // Check if doc is already referenced
      if (!quickRefSection.includes(`**${docName}**:`)) {
        const updatedSection = quickRefSection + docReference;
        content = content.replace(quickRefPattern, updatedSection);

        await fs.writeFile(claudeFilePath, content);
        console.log(chalk.green(`✓ Added ${docName} reference to CLAUDE.md`));
      } else {
        console.log(chalk.yellow(`${docName} is already referenced in CLAUDE.md`));
      }
    }
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update CLAUDE.md file'), error);
  }
}

async function addVisualDevelopmentSection(claudeFilePath: string): Promise<void> {
  try {
    let content = await fs.readFile(claudeFilePath, 'utf-8');
    
    // Check if Visual Development & Testing section already exists
    if (content.includes('## Visual Development & Testing')) {
      return;
    }

    const visualDevSection = `
## Visual Development & Testing

### Design System

The project follows S-Tier SaaS design standards inspired by Stripe, Airbnb, and Linear. All UI development must adhere to:

- **Design Principles**: \`/context/design-principles.md\` - Comprehensive checklist for world-class UI
- **Component Library**: NextUI with custom Tailwind configuration

### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use \`mcp__playwright__browser_navigate\` to visit each changed view
3. **Verify design compliance** - Compare against \`/context/design-principles.md\`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run \`mcp__playwright__browser_console_messages\` ⚠️

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

\`\`\`bash
# Option 1: Use the slash command
/design-review

# Option 2: Invoke the agent directly
@agent-design-review
\`\`\`

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

\`\`\`javascript
// Navigation & Screenshots
mcp__playwright__browser_navigate(url); // Navigate to page
mcp__playwright__browser_take_screenshot(); // Capture visual evidence
mcp__playwright__browser_resize(
  width,
  height
); // Test responsiveness

// Interaction Testing
mcp__playwright__browser_click(element); // Test clicks
mcp__playwright__browser_type(
  element,
  text
); // Test input
mcp__playwright__browser_hover(element); // Test hover states

// Validation
mcp__playwright__browser_console_messages(); // Check for errors
mcp__playwright__browser_snapshot(); // Accessibility check
mcp__playwright__browser_wait_for(
  text / element
); // Ensure loading
\`\`\`

### Design Compliance Checklist

When implementing UI features, verify:

- [ ] **Visual Hierarchy**: Clear focus flow, appropriate spacing
- [ ] **Consistency**: Uses design tokens, follows patterns
- [ ] **Responsiveness**: Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Accessibility**: Keyboard navigable, proper contrast, semantic HTML
- [ ] **Performance**: Fast load times, smooth animations (150-300ms)
- [ ] **Error Handling**: Clear error states, helpful messages
- [ ] **Polish**: Micro-interactions, loading states, empty states

## When to Use Automated Visual Testing

### Use Quick Visual Check for

- Every front-end change, no matter how small
- After implementing new components or features
- When modifying existing UI elements
- After fixing visual bugs
- Before committing UI changes

### Use Comprehensive Design Review for

- Major feature implementations
- Before creating pull requests with UI changes
- When refactoring component architecture
- After significant design system updates
- When accessibility compliance is critical

### Skip Visual Testing for

- Backend-only changes (API, database)
- Configuration file updates
- Documentation changes
- Test file modifications
- Non-visual utility functions

## Additional Context

- Design review agent configuration: \`/.claude/agents/design-review-agent.md\`
- Design principles checklist: \`/context/design-principles.md\`
- Custom slash commands: \`/context/design-review-slash-command.md\`

`;

    // Add the section before the first ## section or at the end
    const firstSectionIndex = content.indexOf('\n## ', content.indexOf('## Installed Agents') + 1);
    if (firstSectionIndex > -1) {
      content = content.slice(0, firstSectionIndex) + visualDevSection + content.slice(firstSectionIndex);
    } else {
      content += visualDevSection;
    }

    await fs.writeFile(claudeFilePath, content);
    console.log(chalk.green('✓ Added Visual Development & Testing section to CLAUDE.md'));
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not add Visual Development section to CLAUDE.md'), error);
  }
}

async function manageClaudeFile(
  installedAgents: string[],
  installedDocs: string[] = []
): Promise<void> {
  const claudeFilePath = path.join(process.cwd(), 'CLAUDE.md');
  const templatePath = path.join(__dirname, '..', 'agents', 'CLAUDE.md.template');

  try {
    // Read the template
    const template = await fs.readFile(templatePath, 'utf-8');

    // Get project info
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let projectName = path.basename(process.cwd());
    let projectDescription = 'Your project description here.';

    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        projectName = packageJson.name || projectName;
        projectDescription = packageJson.description || projectDescription;
      } catch (error) {
        // Use defaults if package.json can't be read
      }
    }

    // Generate sub agents section
    const subAgentsContent = installedAgents
      .map((agentName) => {
        const mcps = getAgentMcps(agentName);
        return `### ${agentName}
- **Usage**: Specialized in ${getAgentDescription(agentName)}
- **MCPs**: ${mcps.join(', ') || 'None'}
- **Context**: Always pass session context file \`.claude/tasks/context_session_x.md\`
- **Follow-up**: Read agent documentation in \`.claude/doc/\` before implementation`;
      })
      .join('\n\n');

    // Generate installed agents section
    const installedAgentsContent = installedAgents
      .map((agent) => `- **${agent}**: Installed`)
      .join('\n');

    // Generate installed docs section
    const installedDocsContent = installedDocs
      .map((doc) => `- **${doc}**: Available in \`docs/${doc}.md\``)
      .join('\n');

    // Replace template variables
    let content = template
      .replace('{{PROJECT_NAME}}', projectName)
      .replace('{{PROJECT_DESCRIPTION}}', projectDescription)
      .replace(
        '{{SUB_AGENTS}}',
        subAgentsContent ||
          'No agents installed yet. Run `npx aicraft install [agent-name]` to add agents.'
      )
      .replace('{{INSTALLED_AGENTS}}', installedAgentsContent || 'No agents installed yet.')
      .replace('{{INSTALLED_DOCS}}', installedDocsContent || 'No documentation installed yet.');

    // Write or update CLAUDE.md
    await fs.writeFile(claudeFilePath, content);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not manage CLAUDE.md file'), error);
  }
}

function getAgentDescription(agentName: string): string {
  const descriptions: Record<string, string> = {
    'shadcn-ui-expert':
      'building and modifying user interfaces using shadcn/ui components and blocks',
    'neo4j-expert':
      'Neo4j graph databases, Cypher queries, data modeling, and performance optimization',
    'api-designer': 'designing, architecting, and optimizing REST and GraphQL APIs',
    'docker-expert': 'containerizing applications and designing container orchestration strategies',
    'react-architect':
      'designing and optimizing React applications with modern patterns and Next.js',
    'design-review': 'conducting comprehensive design reviews on front-end pull requests or UI changes with automated testing',
  };
  return descriptions[agentName] || 'specialized tasks';
}

function getAgentMcps(agentName: string): string[] {
  const mcpMap: Record<string, string[]> = {
    'shadcn-ui-expert': ['shadcn-components', 'shadcn-themes'],
    'neo4j-expert': ['neo4j-database'],
    'api-designer': [],
    'docker-expert': [],
    'react-architect': [],
    'design-review': ['playwright'],
  };
  return mcpMap[agentName] || [];
}

async function listAgents() {
  const spinner = ora('Loading available agents and docs...').start();
  const [agents, docs] = await Promise.all([getRegistry(), getDocsRegistry()]);
  spinner.stop();

  const colorMap: Record<string, any> = {
    green: chalk.green,
    blue: chalk.blue,
    yellow: chalk.yellow,
    red: chalk.red,
    magenta: chalk.magenta,
    cyan: chalk.cyan,
    orange: chalk.rgb(255, 165, 0),
  };

  // Show agents
  if (agents.length > 0) {
    console.log(chalk.cyan('\n📦 Available Agents:\n'));

    agents.forEach((agent) => {
      const color = agent.color && colorMap[agent.color] ? colorMap[agent.color] : chalk.green;
      console.log(`  ${color('•')} ${chalk.bold(agent.name)}`);
      console.log(`    ${chalk.gray(agent.description)}`);
      if (agent.model) {
        console.log(`    ${chalk.dim('Model:')} ${agent.model}`);
      }
      if (agent.mcps && agent.mcps.length > 0) {
        console.log(
          `    ${chalk.dim('MCPs:')} ${agent.mcps.map((mcp: string) => chalk.magenta(mcp)).join(', ')}`
        );
      }
      if (agent.tags && agent.tags.length > 0) {
        console.log(
          `    ${chalk.dim('Tags:')} ${agent.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ')}`
        );
      }
    });
  }

  // Show documentation
  if (docs.length > 0) {
    console.log(chalk.cyan('\n📚 Available Documentation:\n'));

    docs.forEach((doc) => {
      const color = doc.color && colorMap[doc.color] ? colorMap[doc.color] : chalk.cyan;
      console.log(`  ${color('•')} ${chalk.bold(doc.name)}`);
      console.log(`    ${chalk.gray(doc.description)}`);
      if (doc.category) {
        console.log(`    ${chalk.dim('Category:')} ${doc.category}`);
      }
      if (doc.tags && doc.tags.length > 0) {
        console.log(
          `    ${chalk.dim('Tags:')} ${doc.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ')}`
        );
      }
      console.log(`    ${chalk.dim('Usage:')} npx aicraft docs ${doc.name}`);
    });
  }

  if (agents.length === 0 && docs.length === 0) {
    console.log(chalk.yellow('No agents or documentation available'));
  }
}

async function installAgent(agentName?: string) {
  const spinner = ora('Loading registry...').start();
  const [agents, docs] = await Promise.all([getRegistry(), getDocsRegistry()]);
  spinner.stop();

  if (agents.length === 0 && docs.length === 0) {
    console.log(chalk.red('No agents or docs available'));
    return;
  }

  let selectedItem: Agent | Doc;
  let itemType: 'agent' | 'doc';

  if (agentName) {
    // Check agents first
    const agent = agents.find((a) => a.name === agentName);
    if (agent) {
      selectedItem = agent;
      itemType = 'agent';
    } else {
      // Check docs
      const doc = docs.find((d) => d.name === agentName);
      if (doc) {
        selectedItem = doc;
        itemType = 'doc';
      } else {
        console.log(chalk.red(`Agent or documentation "${agentName}" not found`));
        return;
      }
    }
  } else {
    // Interactive selection
    const choices = [
      ...agents.map((a) => ({
        name: `🤖 ${a.name} - ${a.description}`,
        value: { item: a, type: 'agent' as const },
      })),
      ...docs.map((d) => ({
        name: `📚 ${d.name} - ${d.description}`,
        value: { item: d, type: 'doc' as const },
      })),
    ];

    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: 'Select an agent or documentation to install:',
        choices,
      },
    ]);
    selectedItem = selection.item;
    itemType = selection.type;
  }

  const config = await getLocalConfig();

  if (itemType === 'agent') {
    return await installAgentLogic(selectedItem as Agent, config);
  } else {
    return await installDocLogic(selectedItem as Doc, config);
  }
}

async function installAgentLogic(selectedAgent: Agent, config: LocalConfig) {
  // Check if already installed
  const existing = config.installedAgents.find((a) => a.name === selectedAgent.name);
  if (existing) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Agent "${selectedAgent.name}" is already installed. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      return;
    }
  }

  // Always install to .claude/agents/
  const installPath = '.claude/agents/';
  const agentFileName = `${selectedAgent.name}.md`;
  const agentPath = path.join(process.cwd(), installPath, agentFileName);

  const downloadSpinner = ora(`Installing ${selectedAgent.name}...`).start();

  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(agentPath));

    // Copy agent file from package
    const sourceFile = path.join(__dirname, '..', 'agents', selectedAgent.filename);

    if (await fs.pathExists(sourceFile)) {
      await fs.copyFile(sourceFile, agentPath);
    } else {
      throw new Error(`Agent file not found: ${selectedAgent.filename}`);
    }

    // Install MCP dependencies if the agent has any
    if (selectedAgent.mcps && selectedAgent.mcps.length > 0) {
      downloadSpinner.text = `Installing MCP dependencies for ${selectedAgent.name}...`;
      await installMcps(selectedAgent.mcps);
      console.log(chalk.green(`✓ Installed MCP servers: ${selectedAgent.mcps.join(', ')}`));
    }

    // Update local config
    const updatedConfig = await getLocalConfig();
    updatedConfig.installedAgents = updatedConfig.installedAgents.filter(
      (a) => a.name !== selectedAgent.name
    );
    updatedConfig.installedAgents.push({
      name: selectedAgent.name,
      installedAt: new Date().toISOString(),
      location: agentPath,
    });
    await saveLocalConfig(updatedConfig);

    downloadSpinner.succeed(chalk.green(`✓ Agent "${selectedAgent.name}" installed successfully!`));
    console.log(chalk.dim(`Location: ${agentPath}`));
    if (selectedAgent.mcps && selectedAgent.mcps.length > 0) {
      console.log(chalk.dim(`MCPs: ${selectedAgent.mcps.join(', ')}`));
    }

    // Update CLAUDE.md with new agent
    const currentlyInstalled = updatedConfig.installedAgents.map((a) => a.name);
    const currentlyInstalledDocs = updatedConfig.installedDocs.map((d) => d.name);
    await manageClaudeFile(currentlyInstalled, currentlyInstalledDocs);
    console.log(chalk.green('✓ Updated CLAUDE.md with agent configuration'));

    // Add Visual Development & Testing section if design-review agent is installed
    if (selectedAgent.name === 'design-review') {
      const claudeFilePath = path.join(process.cwd(), 'CLAUDE.md');
      await addVisualDevelopmentSection(claudeFilePath);
    }
  } catch (error) {
    downloadSpinner.fail(chalk.red(`Failed to install agent "${selectedAgent.name}"`));
    console.error(error);
  }
}

async function installDocLogic(selectedDoc: Doc, config: LocalConfig) {
  // Check if already installed
  const existing = config.installedDocs.find((d) => d.name === selectedDoc.name);
  if (existing) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Documentation "${selectedDoc.name}" is already installed. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      return;
    }
  }

  // Install to docs directory
  const installPath = 'docs/';
  const docFileName = `${selectedDoc.name}.md`;
  const docPath = path.join(process.cwd(), installPath, docFileName);

  const downloadSpinner = ora(`Installing ${selectedDoc.name} documentation...`).start();

  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(docPath));

    // Copy doc file from package
    const sourceFile = path.join(__dirname, '..', 'docs', selectedDoc.filename);

    if (await fs.pathExists(sourceFile)) {
      await fs.copyFile(sourceFile, docPath);
    } else {
      throw new Error(`Documentation file not found: ${selectedDoc.filename}`);
    }

    // Update local config
    const updatedConfig = await getLocalConfig();
    updatedConfig.installedDocs = updatedConfig.installedDocs.filter(
      (d) => d.name !== selectedDoc.name
    );
    updatedConfig.installedDocs.push({
      name: selectedDoc.name,
      installedAt: new Date().toISOString(),
      location: docPath,
    });
    await saveLocalConfig(updatedConfig);

    downloadSpinner.succeed(
      chalk.green(`✓ Documentation "${selectedDoc.name}" installed successfully!`)
    );
    console.log(chalk.dim(`Location: ${docPath}`));
    console.log(chalk.dim(`Category: ${selectedDoc.category || 'general'}`));

    // Update CLAUDE.md with new doc reference (only append, don't refactor)
    await appendDocToClaude(selectedDoc.name, selectedDoc.description);
  } catch (error) {
    downloadSpinner.fail(chalk.red(`Failed to install documentation "${selectedDoc.name}"`));
    console.error(error);
  }
}

async function initProject() {
  console.log(chalk.cyan('🚀 Initialize AICraft Project\n'));

  const spinner = ora('Creating CLAUDE.md...').start();

  try {
    const config = await getLocalConfig();
    const installedAgents = config.installedAgents.map((a) => a.name);

    await manageClaudeFile(installedAgents);
    await copyDocsToProject();

    spinner.succeed(chalk.green('✓ CLAUDE.md and documentation created successfully!'));
    console.log(chalk.dim('Location: ./CLAUDE.md'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Review the CLAUDE.md file and customize as needed');
    console.log('2. Install agents with: npx aicraft install [agent-name]');
    console.log('3. Start using Claude Code with your configured agents');
  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize project'));
    console.error(error);
  }
}

async function createAgent() {
  console.log(chalk.cyan('🚀 Create New Agent\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Agent name:',
      validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Name must be lowercase with hyphens only',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Agent description:',
    },
    {
      type: 'list',
      name: 'model',
      message: 'Model preference:',
      choices: ['sonnet', 'opus', 'haiku', 'gpt-4', 'any'],
      default: 'sonnet',
    },
    {
      type: 'list',
      name: 'color',
      message: 'Theme color:',
      choices: ['green', 'blue', 'yellow', 'red', 'magenta', 'cyan'],
      default: 'green',
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags (comma-separated):',
    },
  ]);

  const agentFileName = `${answers.name}.md`;
  const agentPath = path.join(process.cwd(), '.claude/agents/', agentFileName);

  const spinner = ora('Creating agent...').start();

  try {
    await fs.ensureDir(path.dirname(agentPath));

    const tags = answers.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const agentContent = `---
name: ${answers.name}
description: ${answers.description}
model: ${answers.model}
color: ${answers.color}
${tags.length > 0 ? `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]` : ''}
---

# ${answers.name} Agent

${answers.description}

## Instructions

Add your agent-specific instructions here.

## Core Expertise

Describe the agent's core areas of expertise.

## Guidelines

- Add specific guidelines for this agent
- Include best practices
- Define response format

## Examples

Provide examples of how this agent should respond to common queries.
`;

    await fs.writeFile(agentPath, agentContent);

    spinner.succeed(chalk.green(`✓ Agent "${answers.name}" created successfully!`));
    console.log(chalk.dim(`Location: ${agentPath}`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Edit the agent file to add detailed instructions');
    console.log('2. Test the agent in your Claude environment');
    console.log('3. Submit a PR to share your agent with the community');
  } catch (error) {
    spinner.fail(chalk.red('Failed to create agent'));
    console.error(error);
  }
}

async function showDocs(docName?: string) {
  const docsPath = path.join(__dirname, '..', 'docs');

  if (!docName) {
    // List available docs
    try {
      const docFiles = await fs.readdir(docsPath);
      const markdownFiles = docFiles.filter((f) => f.endsWith('.md'));

      if (markdownFiles.length === 0) {
        console.log(chalk.yellow('No documentation files found'));
        return;
      }

      console.log(chalk.cyan('\n📚 Available Documentation:\n'));
      for (const file of markdownFiles) {
        const docKey = path.basename(file, '.md');
        console.log(`  • ${docKey}`);
      }
      console.log(chalk.dim('\nUsage: npx aicraft docs [doc-name]'));
    } catch (error) {
      console.log(chalk.red('Could not access documentation directory'));
    }
    return;
  }

  // Show specific doc
  const docFile = `${docName}.md`;
  const docFilePath = path.join(docsPath, docFile);

  try {
    if (!(await fs.pathExists(docFilePath))) {
      console.log(chalk.red(`Documentation "${docName}" not found`));
      console.log(chalk.dim('Run "npx aicraft docs" to see available docs'));
      return;
    }

    const content = await fs.readFile(docFilePath, 'utf-8');
    console.log(content);
  } catch (error) {
    console.log(chalk.red(`Could not read documentation: ${docName}`));
  }
}

async function copyDocsToProject() {
  const docsSourcePath = path.join(__dirname, '..', 'docs');
  const docsTargetPath = path.join(process.cwd(), 'docs');

  try {
    if (await fs.pathExists(docsSourcePath)) {
      await fs.copy(docsSourcePath, docsTargetPath);
      console.log(chalk.green('✓ Documentation copied to ./docs/'));
    }
  } catch (error) {
    console.log(chalk.yellow('Warning: Could not copy documentation files'));
  }
}

async function installMcpItem(mcpItem: McpItem): Promise<void> {
  const config = await getLocalConfig();

  // Check if already installed
  const installedMcps = config.installedMcps || [];
  const existing = installedMcps.find((m) => m.name === mcpItem.name);

  if (existing) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `MCP server "${mcpItem.name}" is already installed. Reinstall?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      return;
    }
  }

  const spinner = ora(`Installing MCP server ${mcpItem.name}...`).start();

  try {
    // Get the MCP configuration from mcp-registry.json
    const mcpRegistry = await getMcpRegistry();
    const mcpServer = mcpRegistry.mcpServers[mcpItem.name];

    if (!mcpServer) {
      throw new Error(`MCP server configuration not found for ${mcpItem.name}`);
    }

    // Read existing MCP config or create new one
    const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
    let existingConfig: { mcpServers: Record<string, any> } = { mcpServers: {} };

    try {
      if (await fs.pathExists(mcpConfigPath)) {
        existingConfig = await fs.readJson(mcpConfigPath);
      }
    } catch (error) {
      // Config doesn't exist or is invalid
    }

    // Process the MCP configuration and prompt for API keys if needed
    spinner.stop();
    const processedConfig = await processApiKeys(mcpServer, mcpItem.name);
    spinner.start(`Installing MCP server ${mcpItem.name}...`);
    
    // Add MCP server configuration
    existingConfig.mcpServers[mcpItem.name] = {
      type: processedConfig.type,
      command: processedConfig.command,
      args: processedConfig.args,
      env: processedConfig.env,
    };

    // Save updated MCP config
    await fs.writeJson(mcpConfigPath, existingConfig, { spaces: 2 });

    // Update Claude settings
    await updateClaudeSettings([mcpItem.name]);

    // Update local config
    const updatedConfig = await getLocalConfig();
    updatedConfig.installedMcps = updatedConfig.installedMcps || [];
    updatedConfig.installedMcps = updatedConfig.installedMcps.filter(
      (m) => m.name !== mcpItem.name
    );
    updatedConfig.installedMcps.push({
      name: mcpItem.name,
      installedAt: new Date().toISOString(),
      package: mcpItem.package,
    });
    await saveLocalConfig(updatedConfig);

    spinner.succeed(chalk.green(`✓ MCP server "${mcpItem.name}" installed successfully!`));
    console.log(chalk.dim(`Category: ${mcpItem.category}`));
    if (mcpItem.tags && mcpItem.tags.length > 0) {
      console.log(chalk.dim(`Tags: ${mcpItem.tags.join(', ')}`));
    }
    if (mcpItem.homepage) {
      console.log(chalk.dim(`Homepage: ${mcpItem.homepage}`));
    }

    // Copy setup guide if available
    if (mcpItem.setup_guide) {
      const guideSource = path.join(__dirname, '..', 'mcps', mcpItem.setup_guide);
      const guideDest = path.join(process.cwd(), 'docs', `mcp-${mcpItem.name}.md`);

      if (await fs.pathExists(guideSource)) {
        await fs.ensureDir(path.dirname(guideDest));
        await fs.copyFile(guideSource, guideDest);
        console.log(chalk.green(`✓ Setup guide copied to docs/mcp-${mcpItem.name}.md`));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install MCP server "${mcpItem.name}"`));
    console.error(error);
  }
}

async function showInstalledAgents() {
  const config = await getLocalConfig();

  if (config.installedAgents.length === 0) {
    console.log(chalk.yellow('No agents installed'));
    return;
  }

  console.log(chalk.cyan('\n📦 Installed Agents:\n'));

  for (const agent of config.installedAgents) {
    // Try to read the agent file to get more details
    try {
      if (await fs.pathExists(agent.location)) {
        const content = await fs.readFile(agent.location, 'utf-8');
        const { data } = matter(content);

        const colorMap: Record<string, any> = {
          green: chalk.green,
          blue: chalk.blue,
          yellow: chalk.yellow,
          red: chalk.red,
          magenta: chalk.magenta,
          cyan: chalk.cyan,
        };
        const color = data.color && colorMap[data.color] ? colorMap[data.color] : chalk.green;
        console.log(`${color('•')} ${chalk.bold(agent.name)}`);
        if (data.description) {
          console.log(`  ${chalk.gray(data.description)}`);
        }
        console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
        console.log(
          `  ${chalk.dim('Installed:')} ${new Date(agent.installedAt).toLocaleDateString()}`
        );
      } else {
        console.log(`${chalk.red('•')} ${chalk.bold(agent.name)} ${chalk.dim('(file missing)')}`);
        console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
      }
    } catch (error) {
      console.log(`${chalk.green('•')} ${chalk.bold(agent.name)}`);
      console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
      console.log(
        `  ${chalk.dim('Installed:')} ${new Date(agent.installedAt).toLocaleDateString()}`
      );
    }
  }
}

program
  .name('aicraft')
  .description('AI Agent Package Manager for Claude')
  .version('0.1.0')
  .option('-l, --list', 'List all available agents');

program.command('list').alias('ls').description('List all available agents').action(listAgents);

program
  .command('install [agent]')
  .alias('i')
  .description('Install an agent to .claude/agents/')
  .action(installAgent);

program.command('create').alias('new').description('Create a new agent').action(createAgent);

program
  .command('installed')
  .alias('status')
  .description('Show installed agents')
  .action(showInstalledAgents);

program
  .command('init')
  .description('Initialize CLAUDE.md for Claude Code workflow')
  .action(initProject);

program
  .command('docs [doc-name]')
  .description('Show documentation (list all or display specific doc)')
  .action(showDocs);

// MCP commands
const mcpCommand = program
  .command('mcp')
  .description('Manage MCP (Model Context Protocol) servers');

mcpCommand
  .command('list')
  .alias('ls')
  .description('List all available MCP servers')
  .action(async () => {
    const spinner = ora('Loading MCP servers...').start();
    const mcpItems = await getMcpItemRegistry();
    spinner.stop();

    if (mcpItems.length === 0) {
      console.log(chalk.yellow('No MCP servers available'));
      return;
    }

    const colorMap: Record<string, any> = {
      green: chalk.green,
      blue: chalk.blue,
      yellow: chalk.yellow,
      red: chalk.red,
      magenta: chalk.magenta,
      cyan: chalk.cyan,
      purple: chalk.magenta,
      orange: chalk.rgb(255, 165, 0),
    };

    console.log(chalk.cyan('\n🔌 Available MCP Servers:\n'));

    mcpItems.forEach((mcp) => {
      const color = mcp.color && colorMap[mcp.color] ? colorMap[mcp.color] : chalk.blue;
      console.log(`  ${color('•')} ${chalk.bold(mcp.name)}`);
      console.log(`    ${chalk.gray(mcp.description)}`);
      console.log(`    ${chalk.dim('Category:')} ${mcp.category}`);
      if (mcp.technologies && mcp.technologies.length > 0) {
        console.log(`    ${chalk.dim('Technologies:')} ${mcp.technologies.join(', ')}`);
      }
      if (mcp.tags && mcp.tags.length > 0) {
        console.log(
          `    ${chalk.dim('Tags:')} ${mcp.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ')}`
        );
      }
      if (mcp.required_by && mcp.required_by.length > 0) {
        console.log(
          `    ${chalk.dim('Required by:')} ${mcp.required_by.map((a: string) => chalk.yellow(a)).join(', ')}`
        );
      }
    });
  });

mcpCommand
  .command('install [mcp-name]')
  .alias('i')
  .description('Install an MCP server')
  .action(async (mcpName?: string) => {
    const spinner = ora('Loading MCP registry...').start();
    const mcpItems = await getMcpItemRegistry();
    spinner.stop();

    if (mcpItems.length === 0) {
      console.log(chalk.red('No MCP servers available'));
      return;
    }

    let selectedMcp: McpItem;

    if (mcpName) {
      const mcp = mcpItems.find((m) => m.name === mcpName);
      if (!mcp) {
        console.log(chalk.red(`MCP server "${mcpName}" not found`));
        console.log(chalk.dim('Run "npx aicraft mcp list" to see available MCP servers'));
        return;
      }
      selectedMcp = mcp;
    } else {
      // Interactive selection
      const choices = mcpItems.map((m) => ({
        name: `🔌 ${m.name} - ${m.description}`,
        value: m,
      }));

      const { selection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: 'Select an MCP server to install:',
          choices,
        },
      ]);
      selectedMcp = selection;
    }

    await installMcpItem(selectedMcp);
  });

mcpCommand
  .command('status')
  .alias('installed')
  .description('Show installed MCP servers')
  .action(async () => {
    const config = await getLocalConfig();
    const installedMcps = config.installedMcps || [];

    if (installedMcps.length === 0) {
      console.log(chalk.yellow('No MCP servers installed'));
      return;
    }

    console.log(chalk.cyan('\n🔌 Installed MCP Servers:\n'));

    // Also read the .mcp.json to get current configuration
    const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
    let mcpConfig: { mcpServers: Record<string, any> } = { mcpServers: {} };

    try {
      if (await fs.pathExists(mcpConfigPath)) {
        mcpConfig = await fs.readJson(mcpConfigPath);
      }
    } catch (error) {
      // Config doesn't exist or is invalid
    }

    for (const mcp of installedMcps) {
      console.log(`${chalk.blue('•')} ${chalk.bold(mcp.name)}`);
      if (mcp.package) {
        console.log(`  ${chalk.dim('Package:')} ${mcp.package}`);
      }
      console.log(`  ${chalk.dim('Installed:')} ${new Date(mcp.installedAt).toLocaleDateString()}`);

      // Show configuration if available
      if (mcpConfig.mcpServers[mcp.name]) {
        const config = mcpConfig.mcpServers[mcp.name];
        console.log(`  ${chalk.dim('Command:')} ${config.command} ${config.args?.join(' ') || ''}`);
      }
    }
  });

mcpCommand
  .command('remove [mcp-name]')
  .alias('rm')
  .description('Remove an installed MCP server')
  .action(async (mcpName?: string) => {
    const config = await getLocalConfig();
    const installedMcps = config.installedMcps || [];

    if (installedMcps.length === 0) {
      console.log(chalk.yellow('No MCP servers installed'));
      return;
    }

    let selectedMcp: string;

    if (mcpName) {
      const mcp = installedMcps.find((m) => m.name === mcpName);
      if (!mcp) {
        console.log(chalk.red(`MCP server "${mcpName}" is not installed`));
        return;
      }
      selectedMcp = mcpName;
    } else {
      // Interactive selection
      const choices = installedMcps.map((m) => ({
        name: m.name,
        value: m.name,
      }));

      const { selection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: 'Select an MCP server to remove:',
          choices,
        },
      ]);
      selectedMcp = selection;
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove MCP server "${selectedMcp}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      return;
    }

    const spinner = ora(`Removing MCP server ${selectedMcp}...`).start();

    try {
      // Remove from .mcp.json
      const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
      if (await fs.pathExists(mcpConfigPath)) {
        const mcpConfig = await fs.readJson(mcpConfigPath);
        delete mcpConfig.mcpServers[selectedMcp];
        await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
      }

      // Remove from Claude settings
      const settingsPath = path.join(process.cwd(), '.claude', 'settings.local.json');
      if (await fs.pathExists(settingsPath)) {
        const settings = await fs.readJson(settingsPath);
        settings.enabledMcpjsonServers = settings.enabledMcpjsonServers.filter(
          (s: string) => s !== selectedMcp
        );
        await fs.writeJson(settingsPath, settings, { spaces: 2 });
      }

      // Update local config
      const updatedConfig = await getLocalConfig();
      updatedConfig.installedMcps = (updatedConfig.installedMcps || []).filter(
        (m) => m.name !== selectedMcp
      );
      await saveLocalConfig(updatedConfig);

      spinner.succeed(chalk.green(`✓ MCP server "${selectedMcp}" removed successfully!`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to remove MCP server "${selectedMcp}"`));
      console.error(error);
    }
  });

// Default action - show interactive menu or handle global options
program.action(async (options) => {
  // Handle global --list option
  if (options.list) {
    await listAgents();
    return;
  }

  console.log(chalk.cyan.bold('\n🤖 AICraft - AI Agent Manager\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🚀 Initialize project', value: 'init' },
        { name: '📦 Browse available agents', value: 'list' },
        { name: '⬇️  Install an agent', value: 'install' },
        { name: '🔌 Manage MCP servers', value: 'mcp' },
        { name: '✨ Create new agent', value: 'create' },
        { name: '📋 Show installed agents', value: 'installed' },
        { name: '📚 Show documentation', value: 'docs' },
        { name: '❌ Exit', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'init':
      await initProject();
      break;
    case 'list':
      await listAgents();
      break;
    case 'install':
      await installAgent();
      break;
    case 'mcp':
      // Show MCP submenu
      const { mcpAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'mcpAction',
          message: 'MCP Server Management:',
          choices: [
            { name: '📋 List available MCP servers', value: 'list' },
            { name: '⬇️  Install MCP server', value: 'install' },
            { name: '🔍 Show installed MCP servers', value: 'status' },
            { name: '🗑️  Remove MCP server', value: 'remove' },
            { name: '⬅️  Back to main menu', value: 'back' },
          ],
        },
      ]);

      if (mcpAction !== 'back') {
        switch (mcpAction) {
          case 'list': {
            const mcpItems = await getMcpItemRegistry();
            if (mcpItems.length === 0) {
              console.log(chalk.yellow('No MCP servers available'));
              break;
            }

            const colorMap: Record<string, any> = {
              green: chalk.green,
              blue: chalk.blue,
              yellow: chalk.yellow,
              red: chalk.red,
              magenta: chalk.magenta,
              cyan: chalk.cyan,
              purple: chalk.magenta,
            };

            console.log(chalk.cyan('\n🔌 Available MCP Servers:\n'));

            mcpItems.forEach((mcp) => {
              const color = mcp.color && colorMap[mcp.color] ? colorMap[mcp.color] : chalk.blue;
              console.log(`  ${color('•')} ${chalk.bold(mcp.name)}`);
              console.log(`    ${chalk.gray(mcp.description)}`);
              console.log(`    ${chalk.dim('Category:')} ${mcp.category}`);
              if (mcp.tags && mcp.tags.length > 0) {
                console.log(
                  `    ${chalk.dim('Tags:')} ${mcp.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ')}`
                );
              }
            });
            break;
          }
          case 'install': {
            const mcpItems = await getMcpItemRegistry();
            if (mcpItems.length > 0) {
              const choices = mcpItems.map((m) => ({
                name: `🔌 ${m.name} - ${m.description}`,
                value: m,
              }));

              const { selection } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'selection',
                  message: 'Select an MCP server to install:',
                  choices,
                },
              ]);
              await installMcpItem(selection);
            } else {
              console.log(chalk.red('No MCP servers available'));
            }
            break;
          }
          case 'status': {
            const config = await getLocalConfig();
            const installedMcps = config.installedMcps || [];

            if (installedMcps.length === 0) {
              console.log(chalk.yellow('No MCP servers installed'));
              break;
            }

            console.log(chalk.cyan('\n🔌 Installed MCP Servers:\n'));

            for (const mcp of installedMcps) {
              console.log(`${chalk.blue('•')} ${chalk.bold(mcp.name)}`);
              if (mcp.package) {
                console.log(`  ${chalk.dim('Package:')} ${mcp.package}`);
              }
              console.log(
                `  ${chalk.dim('Installed:')} ${new Date(mcp.installedAt).toLocaleDateString()}`
              );
            }
            break;
          }
          case 'remove': {
            const config = await getLocalConfig();
            const installedMcps = config.installedMcps || [];

            if (installedMcps.length === 0) {
              console.log(chalk.yellow('No MCP servers installed'));
              break;
            }

            const choices = installedMcps.map((m) => ({
              name: m.name,
              value: m.name,
            }));

            const { selection } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selection',
                message: 'Select an MCP server to remove:',
                choices,
              },
            ]);

            const { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to remove MCP server "${selection}"?`,
                default: false,
              },
            ]);

            if (confirm) {
              const spinner = ora(`Removing MCP server ${selection}...`).start();
              try {
                // Remove from .mcp.json
                const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
                if (await fs.pathExists(mcpConfigPath)) {
                  const mcpConfig = await fs.readJson(mcpConfigPath);
                  delete mcpConfig.mcpServers[selection];
                  await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
                }

                // Remove from Claude settings
                const settingsPath = path.join(process.cwd(), '.claude', 'settings.local.json');
                if (await fs.pathExists(settingsPath)) {
                  const settings = await fs.readJson(settingsPath);
                  settings.enabledMcpjsonServers = settings.enabledMcpjsonServers.filter(
                    (s: string) => s !== selection
                  );
                  await fs.writeJson(settingsPath, settings, { spaces: 2 });
                }

                // Update local config
                const updatedConfig = await getLocalConfig();
                updatedConfig.installedMcps = (updatedConfig.installedMcps || []).filter(
                  (m) => m.name !== selection
                );
                await saveLocalConfig(updatedConfig);

                spinner.succeed(chalk.green(`✓ MCP server "${selection}" removed successfully!`));
              } catch (error) {
                spinner.fail(chalk.red(`Failed to remove MCP server "${selection}"`));
                console.error(error);
              }
            }
            break;
          }
        }
      }
      break;
    case 'create':
      await createAgent();
      break;
    case 'installed':
      await showInstalledAgents();
      break;
    case 'docs':
      await showDocs();
      break;
    case 'exit':
      console.log(chalk.gray('Goodbye!'));
      break;
  }
});

program.parse();
