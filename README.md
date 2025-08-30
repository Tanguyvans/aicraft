# AICraft

A TypeScript npm package for AI crafting utilities.

## Installation

```bash
npm install aicraft
```

## Usage

```typescript
import { add, multiply, greet } from 'aicraft';

// Math functions
console.log(add(2, 3)); // 5
console.log(multiply(3, 4)); // 12

// String functions
console.log(greet('World')); // Hello, World!
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
