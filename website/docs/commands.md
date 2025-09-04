# CLI Commands

Complete reference for all AICraft commands.

## Interactive Menu

```bash
npx aicraft
```

Opens an interactive menu with all options:
- 🚀 Initialize project
- 📦 Browse available agents  
- ⬇️ Install an agent
- ✨ Create new agent
- 📋 Show installed agents
- 📚 Show documentation

## Project Setup

### Initialize Project
```bash
npx aicraft init
```
Creates `CLAUDE.md` with context session rules and copies documentation to `./docs/`

## Agent Management

### List Available Agents
```bash
npx aicraft list
npx aicraft ls              # alias
npx aicraft --list          # global flag
npx aicraft -l              # short flag
```

### Install Agent
```bash
npx aicraft install <agent-name>
npx aicraft i <agent-name>           # alias
npx aicraft install                  # interactive selection
```

Examples:
```bash
npx aicraft install neo4j-expert
npx aicraft install api-designer
npx aicraft install react-architect
npx aicraft install docker-expert
```

### Show Installed Agents
```bash
npx aicraft installed
npx aicraft status          # alias
```

## Documentation

### List Documentation
```bash
npx aicraft docs
```

### Show Specific Documentation
```bash
npx aicraft docs <doc-name>
```

Examples:
```bash
npx aicraft docs vastai-deployment
```

## Agent Creation

### Create New Agent
```bash
npx aicraft create
npx aicraft new             # alias
```

Interactive prompts for:
- Agent name
- Description
- Model preference
- Theme color
- Tags

## Global Options

```bash
npx aicraft --help          # Show help
npx aicraft --version       # Show version
```