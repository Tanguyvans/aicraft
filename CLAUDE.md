# aicraft

AI Agent Package Manager for Claude - Install and manage AI agents

## Rules

- Before you do any work, MUST view files in `.claude/tasks/context_session_x.md` file to get the full context (x being the id of the session we are operating, if file doesn't exist, then create one)
- `context_session_x.md` should contain most of context of what we did, overall plan, and sub agents will continuously add context to the file
- After you finish the work, MUST update the `.claude/tasks/context_session_x.md` file to make sure others can get full context of what you did

## Sub Agents

You have access to specialized sub agents:

### shadcn-ui-expert

- **Usage**: Specialized in building and modifying user interfaces using shadcn/ui components and blocks
- **MCPs**: shadcn-components, shadcn-themes
- **Context**: Always pass session context file `.claude/tasks/context_session_x.md`
- **Follow-up**: Read agent documentation in `.claude/doc/` before implementation

### design-review

- **Usage**: Conduct comprehensive design reviews on front-end pull requests or UI changes with automated testing
- **MCPs**: playwright
- **Context**: Requires live preview environment for testing
- **Follow-up**: Provides categorized feedback (Blockers/High/Medium/Nitpicks)

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

- **shadcn-ui-expert**: Installed
- **design-review**: Installed

## Visual Development & Testing

### Design System

The project follows S-Tier SaaS design standards inspired by Stripe, Airbnb, and Linear. All UI development must adhere to:

- **Design Principles**: `/context/design-principles.md` - Comprehensive checklist for world-class UI
- **Component Library**: NextUI with custom Tailwind configuration

### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages` ⚠️

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

```bash
# Option 1: Use the slash command
/design-review

# Option 2: Invoke the agent directly
@agent-design-review
```

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

```javascript
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
```

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

- Design review agent configuration: `/.claude/agents/design-review-agent.md`
- Design principles checklist: `/context/design-principles.md`
- Custom slash commands: `/context/design-review-slash-command.md`
