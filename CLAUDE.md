# aicraft

AI Agent Package Manager for Claude - Install and manage AI agents

## Rules

- Before you do any work, MUST view files in `.claude/tasks/context_session_x.md` file to get the full context (x being the id of the session we are operating, if file doesn't exist, then create one)
- `context_session_x.md` should contain most of context of what we did, overall plan, and sub agents will continuously add context to the file
- After you finish the work, MUST update the `.claude/tasks/context_session_x.md` file to make sure others can get full context of what you did

## Sub Agents

You have access to specialized sub agents:

No agents installed yet. Run `npx aicraft install [agent-name]` to add agents.

## Quick References

For specific deployment tasks, check these documentation files:

- **vastai-deployment**: Available in `docs/vastai-deployment.md`
- **docusaurus-setup**: Available in `docs/docusaurus-setup.md`

## Context Session Management

### Session File Format
Location: `.claude/tasks/context_session_[id].md`

```markdown
# Session [ID]: [Task Name]

## Overview
Brief description of the main task or project goal.

## Progress Log
- [Timestamp] [Agent]: [Action taken]
- [Timestamp] Main: [Implementation completed]

## Current State
What has been accomplished and what remains.

## Sub Agent Reports
Links to documentation created by sub agents:
- [Agent]: [.claude/doc/file.md] - [Summary]

## Next Steps
What should be done next.

## Context for Future Agents
Key information that other agents need to know.
```

### Session Workflow

1. **Start**: Check for existing context session or create new one
2. **Research**: Delegate research to appropriate sub agents with context
3. **Planning**: Read sub agent documentation and create implementation plan
4. **Execute**: Implement the solution based on research and planning
5. **Update**: Update context session with completed work and outcomes

## Agent Installation Commands

```bash
# Install specific agent
npx aicraft install [agent-name]

# List available agents
npx aicraft list

# Create new agent
npx aicraft create

# Initialize Claude workflow
npx aicraft init
```

## Installed Agents

No agents installed yet.