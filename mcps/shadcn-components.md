# shadcn-components MCP

## Overview
The shadcn-components MCP provides direct access to shadcn/ui components and blocks within Claude Code, enabling rapid UI development with pre-built, customizable components.

## Description
Access the complete shadcn/ui component library including buttons, forms, navigation, data display components, and complex blocks like dashboards and authentication pages.

## Installation

### Automatic
This MCP is automatically installed when you install the `shadcn-ui-expert` agent:
```bash
npx aicraft install shadcn-ui-expert
```

### Manual
```bash
# Install the MCP package globally
npm install -g @anthropic-ai/shadcn-components

# Or install via aicraft
npx aicraft install mcp shadcn-components
```

## Configuration

### Claude Desktop
Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "shadcn-components": {
      "command": "npx",
      "args": ["@anthropic-ai/shadcn-components"]
    }
  }
}
```

### Claude Code
The MCP will be automatically configured when installed via aicraft.

## Features

### Available Components
- **Form Elements**: Button, Input, Textarea, Select, Checkbox, Radio
- **Navigation**: Navbar, Sidebar, Breadcrumb, Pagination
- **Data Display**: Table, Card, Badge, Avatar, Progress
- **Feedback**: Alert, Dialog, Popover, Tooltip, Loading
- **Layout**: Container, Grid, Flex, Separator

### Available Blocks
- **Authentication**: Login, Register, Forgot Password pages
- **Dashboard**: Analytics, CRM, E-commerce dashboards
- **Landing Pages**: Hero sections, Feature grids, Testimonials
- **Forms**: Contact, Checkout, Survey forms

## Usage Examples

### Adding a Button Component
```typescript
// Claude can generate this with the MCP
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <Button variant="default" size="lg">
      Click me
    </Button>
  )
}
```

### Creating a Dashboard Block
```bash
# Ask Claude to create a dashboard
"Create a dashboard with sidebar navigation using shadcn/ui components"
```

## Troubleshooting

### Common Issues

**❌ "MCP server not found"**
```bash
# Solution: Install the package globally
npm install -g @anthropic-ai/shadcn-components
```

**❌ "Components not loading in Claude"**
```bash
# Solution: Restart Claude Desktop after configuration
# Check that the config file path is correct
```

**❌ "Package not found during installation"**
```bash
# The package might not be published yet
# Use aicraft to install instead:
npx aicraft install mcp shadcn-components
```

### Debugging
```bash
# Test MCP connection
npx @anthropic-ai/shadcn-components --version

# Check Claude Code MCP status
npx aicraft doctor mcp shadcn-components
```

## Compatible Agents
- **shadcn-ui-expert**: Primary agent that uses this MCP
- **react-architect**: Can leverage components for React apps

## Related MCPs
- **shadcn-themes**: For theme management and customization
- **filesystem**: For file operations when creating components

## Support
- Report issues: [GitHub Issues](https://github.com/anthropics/mcp-shadcn/issues)
- Documentation: [shadcn/ui docs](https://ui.shadcn.com)
- Community: [Discord](https://discord.gg/shadcn)