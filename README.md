# AICraft

AI Agent Package Manager for Claude - Install and manage AI agents for your Claude projects.

## Features

- 📦 **Agent Registry**: Browse and install curated AI agents
- 🎯 **Claude Integration**: Agents install directly to `.claude/agents/`
- ✨ **Interactive CLI**: Easy-to-use commands for managing agents
- 🔧 **Agent Creation**: Create and share your own agents
- 📚 **Documentation**: Built-in docs for deployment patterns and guides
- 🏷️ **Frontmatter Format**: Simple markdown format with metadata

## Quick Start

Install an agent directly:

```bash
npx aicraft install shadcn-ui-expert
```

Or use the interactive CLI:

```bash
npx aicraft
```

## Available Agents

- **shadcn-ui-expert**: Build and modify user interfaces using shadcn/ui components and blocks
- **neo4j-expert**: Neo4j graph database specialist for Cypher queries and data modeling
- **api-designer**: Design, architect, and optimize REST and GraphQL APIs
- **docker-expert**: Containerize applications and design container orchestration
- **react-architect**: Design and optimize React applications with modern patterns

## Commands

```bash
npx aicraft                    # Interactive menu
npx aicraft init               # Initialize project with CLAUDE.md and docs
npx aicraft list               # List all available agents
npx aicraft install <agent>    # Install a specific agent
npx aicraft create             # Create a new agent
npx aicraft installed          # Show installed agents
npx aicraft docs               # List available documentation
npx aicraft docs <doc-name>    # Show specific documentation
```

## Agent Format

Agents are markdown files with frontmatter:

```markdown
---
name: my-agent
description: Agent description
model: sonnet
color: green
tags: ['tag1', 'tag2']
---

# My Agent

Agent instructions and system prompt go here...
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Format code
npm run format
```

### Publishing

This package uses Changesets for version management. To create a new release:

1. Create a changeset:

   ```bash
   npm run changeset
   ```

2. Version the package:

   ```bash
   npm run version
   ```

3. Publish to npm:
   ```bash
   npm run release
   ```

## License

MIT
