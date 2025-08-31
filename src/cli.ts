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
}

interface LocalConfig {
  installPath: string;
  installedAgents: Array<{
    name: string;
    installedAt: string;
    location: string;
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
      const agentFiles = files.filter(f => f.endsWith('.md'));
      
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
            tags: data.tags || []
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

async function getLocalConfig(): Promise<LocalConfig> {
  const configPath = path.join(process.cwd(), '.aicraft', 'config.json');
  
  const defaultConfig: LocalConfig = {
    installPath: '.claude/agents/',
    installedAgents: []
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

async function listAgents() {
  const spinner = ora('Loading available agents...').start();
  const agents = await getRegistry();
  spinner.stop();

  if (agents.length === 0) {
    console.log(chalk.yellow('No agents available'));
    return;
  }

  console.log(chalk.cyan('\n📦 Available Agents:\n'));
  
  agents.forEach(agent => {
    const colorMap: Record<string, any> = {
      green: chalk.green,
      blue: chalk.blue,
      yellow: chalk.yellow,
      red: chalk.red,
      magenta: chalk.magenta,
      cyan: chalk.cyan
    };
    const color = agent.color && colorMap[agent.color] ? colorMap[agent.color] : chalk.green;
    console.log(`  ${color('•')} ${chalk.bold(agent.name)}`);
    console.log(`    ${chalk.gray(agent.description)}`);
    if (agent.model) {
      console.log(`    ${chalk.dim('Model:')} ${agent.model}`);
    }
    if (agent.tags && agent.tags.length > 0) {
      console.log(`    ${chalk.dim('Tags:')} ${agent.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ')}`);
    }
  });
}

async function installAgent(agentName?: string) {
  const spinner = ora('Loading agent registry...').start();
  const agents = await getRegistry();
  spinner.stop();

  if (agents.length === 0) {
    console.log(chalk.red('No agents available'));
    return;
  }

  let selectedAgent: Agent;

  if (agentName) {
    const agent = agents.find(a => a.name === agentName);
    if (!agent) {
      console.log(chalk.red(`Agent "${agentName}" not found`));
      return;
    }
    selectedAgent = agent;
  } else {
    // Interactive selection
    const { agent } = await inquirer.prompt([
      {
        type: 'list',
        name: 'agent',
        message: 'Select an agent to install:',
        choices: agents.map(a => ({
          name: `${a.name} - ${a.description}`,
          value: a
        }))
      }
    ]);
    selectedAgent = agent;
  }

  const config = await getLocalConfig();
  
  // Check if already installed
  const existing = config.installedAgents.find(a => a.name === selectedAgent.name);
  if (existing) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Agent "${selectedAgent.name}" is already installed. Overwrite?`,
        default: false
      }
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
    
    // Update local config
    const updatedConfig = await getLocalConfig();
    updatedConfig.installedAgents = updatedConfig.installedAgents.filter(a => a.name !== selectedAgent.name);
    updatedConfig.installedAgents.push({
      name: selectedAgent.name,
      installedAt: new Date().toISOString(),
      location: agentPath
    });
    await saveLocalConfig(updatedConfig);
    
    downloadSpinner.succeed(chalk.green(`✓ Agent "${selectedAgent.name}" installed successfully!`));
    console.log(chalk.dim(`Location: ${agentPath}`));
  } catch (error) {
    downloadSpinner.fail(chalk.red(`Failed to install agent "${selectedAgent.name}"`));
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
      validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Name must be lowercase with hyphens only'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Agent description:'
    },
    {
      type: 'list',
      name: 'model',
      message: 'Model preference:',
      choices: ['sonnet', 'opus', 'haiku', 'gpt-4', 'any'],
      default: 'sonnet'
    },
    {
      type: 'list',
      name: 'color',
      message: 'Theme color:',
      choices: ['green', 'blue', 'yellow', 'red', 'magenta', 'cyan'],
      default: 'green'
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags (comma-separated):'
    }
  ]);

  const agentFileName = `${answers.name}.md`;
  const agentPath = path.join(process.cwd(), '.claude/agents/', agentFileName);
  
  const spinner = ora('Creating agent...').start();
  
  try {
    await fs.ensureDir(path.dirname(agentPath));
    
    const tags = answers.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    
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
          cyan: chalk.cyan
        };
        const color = data.color && colorMap[data.color] ? colorMap[data.color] : chalk.green;
        console.log(`${color('•')} ${chalk.bold(agent.name)}`);
        if (data.description) {
          console.log(`  ${chalk.gray(data.description)}`);
        }
        console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
        console.log(`  ${chalk.dim('Installed:')} ${new Date(agent.installedAt).toLocaleDateString()}`);
      } else {
        console.log(`${chalk.red('•')} ${chalk.bold(agent.name)} ${chalk.dim('(file missing)')}`);
        console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
      }
    } catch (error) {
      console.log(`${chalk.green('•')} ${chalk.bold(agent.name)}`);
      console.log(`  ${chalk.dim('Location:')} ${agent.location}`);
      console.log(`  ${chalk.dim('Installed:')} ${new Date(agent.installedAt).toLocaleDateString()}`);
    }
  }
}

program
  .name('aicraft')
  .description('AI Agent Package Manager for Claude')
  .version('0.0.1');

program
  .command('list')
  .alias('ls')
  .description('List all available agents')
  .action(listAgents);

program
  .command('install [agent]')
  .alias('i')
  .description('Install an agent to .claude/agents/')
  .action(installAgent);

program
  .command('create')
  .alias('new')
  .description('Create a new agent')
  .action(createAgent);

program
  .command('installed')
  .alias('status')
  .description('Show installed agents')
  .action(showInstalledAgents);

// Default action - show interactive menu
program.action(async () => {
  console.log(chalk.cyan.bold('\n🤖 AICraft - AI Agent Manager\n'));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📦 Browse available agents', value: 'list' },
        { name: '⬇️  Install an agent', value: 'install' },
        { name: '✨ Create new agent', value: 'create' },
        { name: '📋 Show installed agents', value: 'installed' },
        { name: '❌ Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (action) {
    case 'list':
      await listAgents();
      break;
    case 'install':
      await installAgent();
      break;
    case 'create':
      await createAgent();
      break;
    case 'installed':
      await showInstalledAgents();
      break;
    case 'exit':
      console.log(chalk.gray('Goodbye!'));
      break;
  }
});

program.parse();