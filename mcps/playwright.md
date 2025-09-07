# playwright MCP

## Overview
The playwright MCP provides browser automation and testing capabilities within Claude Code, enabling web scraping, UI testing, and automated browser interactions.

## Description
Automate Chromium, Firefox, and Safari browsers for testing, scraping, and interaction tasks. Create screenshots, PDFs, test user interfaces, and perform complex browser automation workflows.

## Installation

### Manual Installation
```bash
# Install the MCP package globally
npm install -g @anthropic-ai/mcp-playwright

# Or install via aicraft
npx aicraft install mcp playwright

# Install browser binaries (required)
npx playwright install
```

### Browser Requirements
Playwright requires browser binaries to be installed:
```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Configuration

### Claude Desktop
Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-playwright"]
    }
  }
}
```

### Claude Code
The MCP will be automatically configured when installed via aicraft.

## Features

### Browser Automation
- **Multi-Browser Support**: Chromium, Firefox, Safari/WebKit
- **Page Navigation**: Go to URLs, handle redirects, wait for loads
- **Element Interaction**: Click, type, scroll, hover actions
- **Form Handling**: Fill forms, submit data, handle file uploads

### Content Extraction
- **Text Extraction**: Get page content, specific elements
- **Screenshot Capture**: Full page or element screenshots
- **PDF Generation**: Convert pages to PDF documents
- **Data Scraping**: Extract structured data from websites

### Testing Capabilities
- **UI Testing**: Verify page elements, content, behavior
- **Performance Testing**: Measure load times, resource usage
- **Accessibility Testing**: Check ARIA labels, keyboard navigation
- **Visual Regression**: Compare screenshots across versions

### Advanced Features
- **Network Interception**: Monitor requests, mock responses
- **Mobile Emulation**: Test responsive designs, touch interactions
- **Geolocation**: Test location-based features
- **Authentication**: Handle login flows, cookies, sessions

## Usage Examples

### Basic Navigation
```javascript
// Navigate to a page and take screenshot
await page.goto('https://example.com');
await page.screenshot({ path: 'example.png' });
```

### Data Extraction
```bash
# Ask Claude to scrape data
"Extract all product names and prices from this e-commerce site"
"Get the latest news headlines from this website"
"Capture a screenshot of the pricing table"
```

### UI Testing
```bash
# Test user interactions
"Test the login form with valid credentials"
"Verify that the search functionality works"
"Check if the mobile menu opens correctly"
```

### Automation Tasks
```bash
# Automated workflows
"Fill out this contact form with test data"
"Generate PDFs of all product pages"
"Monitor this website for changes daily"
```

## Browser Configuration

### Headless vs Headed Mode
```javascript
// Headless (default) - no UI
const browser = await playwright.chromium.launch({ headless: true });

// Headed - with browser UI
const browser = await playwright.chromium.launch({ headless: false });
```

### Browser Options
```javascript
const browser = await playwright.chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/path/to/browser', // Custom browser path
});
```

## Troubleshooting

### Common Issues

**❌ "Browser executable not found"**
```bash
# Solution: Install browser binaries
npx playwright install chromium

# Check installed browsers
npx playwright install --help
```

**❌ "Permission denied errors"**
```bash
# Linux: Install dependencies
sudo apt-get install -y \
  libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libgtk-3-0 libgbm1 libasound2

# macOS: Allow browser in Security Settings
# Windows: Run as administrator if needed
```

**❌ "Timeout errors"**
```bash
# Increase timeouts
await page.waitForSelector('#element', { timeout: 30000 });

# Check network connectivity
# Verify target website is accessible
```

**❌ "Element not found"**
```bash
# Use more robust selectors
await page.waitForSelector('[data-testid="submit-button"]');

# Check if element is in iframe
const frame = page.frame('frameName');
await frame.click('#button');
```

### Debugging Tips
```bash
# Run with debug logging
DEBUG=pw:api npx @anthropic-ai/mcp-playwright

# Use slow motion for debugging
const browser = await playwright.chromium.launch({ 
  headless: false, 
  slowMo: 1000 
});

# Enable tracing
await context.tracing.start({ screenshots: true, snapshots: true });
```

## Performance Optimization

### Resource Management
```javascript
// Close contexts and browsers
await context.close();
await browser.close();

// Disable images for faster loading
await context.route('**/*.{png,jpg,jpeg}', route => route.abort());
```

### Parallel Execution
```javascript
// Run multiple pages in parallel
const promises = urls.map(url => 
  browser.newPage().then(page => page.goto(url))
);
await Promise.all(promises);
```

## Security Considerations
- Be respectful of websites' robots.txt and rate limits
- Don't scrape copyrighted content without permission
- Use appropriate delays between requests
- Consider using proxies for large-scale operations
- Be aware of anti-bot measures (CAPTCHA, rate limiting)

## Docker Usage
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package.json .
RUN npm install
RUN npx playwright install

COPY . .
CMD ["node", "script.js"]
```

## Compatible Use Cases
- **Web Scraping**: Extract data from websites
- **UI Testing**: Automated testing of web applications
- **Report Generation**: Create PDFs from web content
- **Monitoring**: Check website availability and changes
- **Data Collection**: Gather information from multiple sources

## Related MCPs
- **filesystem**: For saving screenshots, PDFs, and scraped data
- **web-search**: For finding URLs to automate or test

## Support
- Playwright Documentation: [playwright.dev](https://playwright.dev)
- API Reference: [playwright.dev/docs/api](https://playwright.dev/docs/api)
- GitHub Issues: [github.com/microsoft/playwright](https://github.com/microsoft/playwright)