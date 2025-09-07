# neo4j-database MCP

## Overview
The neo4j-database MCP enables Claude to connect to and interact with Neo4j graph databases, providing capabilities for Cypher query execution, graph analysis, and data manipulation.

## Description
Connect to Neo4j instances (local or cloud) to perform graph operations, run Cypher queries, analyze relationships, and manage graph data structures directly from Claude.

## Installation

### Automatic
This MCP is automatically installed when you install the `neo4j-expert` agent:
```bash
npx aicraft install neo4j-expert
```

### Manual
```bash
# Install the MCP package globally
npm install -g @anthropic-ai/mcp-neo4j

# Or install via aicraft
npx aicraft install mcp neo4j-database
```

## Prerequisites

### Neo4j Database
You need a running Neo4j instance:

**Option 1: Local Neo4j**
```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**Option 2: Neo4j AuraDB** (Cloud)
1. Create account at [neo4j.com/aura](https://neo4j.com/aura)
2. Create a new database instance
3. Note the connection URI and credentials

**Option 3: Neo4j Desktop**
1. Download from [neo4j.com/download](https://neo4j.com/download)
2. Create a new project and database
3. Start the database instance

## Configuration

### Environment Variables
Set your Neo4j connection details:

```bash
# .env file or environment
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# For AuraDB (cloud)
NEO4J_URI=neo4j+s://your-instance.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

### Claude Desktop Configuration
Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "neo4j": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-neo4j"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USERNAME": "neo4j",
        "NEO4J_PASSWORD": "password"
      }
    }
  }
}
```

### Claude Code
The MCP will be automatically configured when installed via aicraft. You'll be prompted for connection details during setup.

## Features

### Database Operations
- **Connection Management**: Connect to local or cloud Neo4j instances
- **Query Execution**: Run Cypher queries and get formatted results
- **Schema Analysis**: Explore database structure and relationships
- **Data Import/Export**: Load data from CSV, JSON, or other formats

### Graph Analysis
- **Path Finding**: Shortest paths, all paths between nodes
- **Centrality Analysis**: PageRank, betweenness, closeness centrality
- **Community Detection**: Label propagation, Louvain algorithm
- **Graph Statistics**: Node/relationship counts, degree distribution

### Data Visualization
- **Query Results**: Formatted table output for Cypher queries
- **Graph Structure**: ASCII art visualization of small graphs
- **Relationship Mapping**: Show connections between entities

## Usage Examples

### Basic Queries
```cypher
// Find all Person nodes
MATCH (p:Person) RETURN p.name, p.age LIMIT 10

// Create a relationship
MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS]->(b)
```

### Graph Analysis
```bash
# Ask Claude to analyze your graph
"What are the most connected nodes in my social network?"
"Find the shortest path between Alice and Bob"
"Show me clusters of related products"
```

### Data Loading
```bash
# Load data from CSV
"Import this CSV file into Neo4j as Person nodes"
"Create relationships from this transaction data"
```

## Troubleshooting

### Common Issues

**❌ "Cannot connect to Neo4j"**
```bash
# Check if Neo4j is running
docker ps | grep neo4j

# Test connection manually
neo4j-shell -host localhost -port 1337
```

**❌ "Authentication failed"**
```bash
# Reset Neo4j password
docker exec -it neo4j cypher-shell
# Change password in Neo4j browser: http://localhost:7474
```

**❌ "MCP timeout errors"**
```bash
# Increase timeout in Claude configuration
# Check Neo4j server logs for performance issues
```

### Connection Testing
```bash
# Test MCP connection
npx @anthropic-ai/mcp-neo4j --test-connection

# Check Neo4j status
npx aicraft doctor mcp neo4j-database
```

## Performance Tips

### Query Optimization
- Use `EXPLAIN` and `PROFILE` to analyze query performance
- Create indexes on frequently queried properties
- Limit result sets with `LIMIT` clause
- Use parameters for repeated queries

### Memory Management
- Monitor heap usage in Neo4j
- Use `PERIODIC COMMIT` for large data imports
- Configure appropriate JVM heap size

## Security Notes
- Never commit credentials to version control
- Use environment variables for sensitive data
- Consider using Neo4j's role-based access control
- Enable SSL/TLS for production connections

## Compatible Agents
- **neo4j-expert**: Primary agent for graph database work
- **data-analyst**: Can use for data analysis tasks

## Related MCPs
- **filesystem**: For data import/export operations
- **web-search**: For enriching graph data with external sources

## Support
- Neo4j Documentation: [neo4j.com/docs](https://neo4j.com/docs)
- Cypher Reference: [neo4j.com/cypher](https://neo4j.com/cypher)
- Community Forum: [community.neo4j.com](https://community.neo4j.com)