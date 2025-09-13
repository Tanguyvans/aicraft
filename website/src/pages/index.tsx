import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function MainContent() {
  const { siteConfig } = useDocusaurusContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showcaseFilter, setShowcaseFilter] = useState('all');

  // Installation Documentation (from /docs/ directory)
  const docs = [
    { type: 'doc', subtype: 'install-doc', name: 'docusaurus-setup', emoji: '📖', desc: 'Docusaurus Setup Guide', file: 'docs/docusaurus-setup.md' },
    { type: 'doc', subtype: 'install-doc', name: 'vastai-deployment', emoji: '🚀', desc: 'Vast.AI Deployment Guide', file: 'docs/vastai-deployment.md' },
  ];

  const allContent = [
    // Agents
    { type: 'agent', name: 'shadcn-ui-expert', description: 'Build beautiful UIs with shadcn/ui', emoji: '🎨' },
    { type: 'agent', name: 'design-review', description: 'Automated design testing', emoji: '🔍' },
    { type: 'agent', name: 'neo4j-expert', description: 'Graph database expertise', emoji: '🕸️' },
    // MCPs
    { type: 'mcp', name: 'shadcn-components', description: 'shadcn/ui components MCP', emoji: '🎨' },
    { type: 'mcp', name: 'playwright', description: 'Browser automation MCP', emoji: '🎪' },
    { type: 'mcp', name: 'ide', description: 'IDE integration MCP', emoji: '💻' },
    // Documentation
    ...docs.map(doc => ({ ...doc, description: doc.desc })),
  ];

  const agents = [
    { type: 'agent', name: 'shadcn-ui-expert', emoji: '🎨', desc: 'UI Components' },
    { type: 'agent', name: 'design-review', emoji: '🔍', desc: 'Design QA' },
    { type: 'agent', name: 'neo4j-expert', emoji: '🕸️', desc: 'Graph DB' },
    { type: 'agent', name: 'react-native', emoji: '📱', desc: 'Mobile Apps' },
    { type: 'agent', name: 'nextjs-expert', emoji: '⚡', desc: 'Next.js' },
    { type: 'agent', name: 'api-designer', emoji: '🔌', desc: 'REST APIs' },
    { type: 'agent', name: 'database-expert', emoji: '💾', desc: 'SQL/NoSQL' },
    { type: 'agent', name: 'devops-expert', emoji: '🚀', desc: 'CI/CD' },
    { type: 'agent', name: 'security-audit', emoji: '🔒', desc: 'Security' },
    { type: 'agent', name: 'performance', emoji: '⚡', desc: 'Optimization' },
    { type: 'agent', name: 'testing-expert', emoji: '🧪', desc: 'Test Automation' },
    { type: 'agent', name: 'tailwind-expert', emoji: '🎨', desc: 'Tailwind CSS' },
  ];

  const mcps = [
    { type: 'mcp', name: 'playwright', emoji: '🎪', desc: 'Browser Testing' },
    { type: 'mcp', name: 'shadcn-components', emoji: '🎨', desc: 'UI Library' },
    { type: 'mcp', name: 'ide', emoji: '💻', desc: 'IDE Integration' },
    { type: 'mcp', name: 'github', emoji: '🐙', desc: 'GitHub API' },
    { type: 'mcp', name: 'docker', emoji: '🐳', desc: 'Containers' },
    { type: 'mcp', name: 'aws', emoji: '☁️', desc: 'AWS Services' },
    { type: 'mcp', name: 'firebase', emoji: '🔥', desc: 'Firebase' },
    { type: 'mcp', name: 'stripe', emoji: '💳', desc: 'Payments' },
    { type: 'mcp', name: 'slack', emoji: '💬', desc: 'Slack API' },
    { type: 'mcp', name: 'notion', emoji: '📝', desc: 'Notion API' },
    { type: 'mcp', name: 'vercel', emoji: '▲', desc: 'Deployment' },
    { type: 'mcp', name: 'supabase', emoji: '⚡', desc: 'Backend' },
  ];



  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value || activeFilter !== 'all') {
      let filtered = allContent;
      
      // Filter by type
      if (activeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === activeFilter);
      }
      
      // Filter by search term
      if (value) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      }
      
      setSearchResults(filtered.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowcaseFilter(filter); // Also filter the showcase
    handleSearch(searchTerm);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    // Copy command to clipboard
    let command = '';
    if (item.type === 'agent') {
      command = `npx aicraft install ${item.name}`;
    } else if (item.type === 'mcp') {
      command = `npx aicraft add-mcp ${item.name}`;
    } else if (item.type === 'doc' && item.subtype === 'install-doc') {
      command = `npx aicraft docs ${item.name}`;
    }
    
    if (command) {
      navigator.clipboard.writeText(command);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.asciiArt}>
          <pre>{`
 █████╗ ██╗ ██████╗██████╗  █████╗ ███████╗████████╗
██╔══██╗██║██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
███████║██║██║     ██████╔╝███████║█████╗     ██║   
██╔══██║██║██║     ██╔══██╗██╔══██║██╔══╝     ██║   
██║  ██║██║╚██████╗██║  ██║██║  ██║██║        ██║   
╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   
          `}</pre>
        </div>
        <p className={styles.tagline}>{siteConfig.tagline}</p>

        {/* Terminal Install Section */}
        <div className={styles.terminalInstall}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.terminalButton} style={{ backgroundColor: '#ff5f57' }}></span>
              <span className={styles.terminalButton} style={{ backgroundColor: '#ffbd2e' }}></span>
              <span className={styles.terminalButton} style={{ backgroundColor: '#28ca42' }}></span>
            </div>
            <div className={styles.terminalTitle}>quick install</div>
          </div>
          <div className={styles.terminalBody}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>$</span>
              <span className={styles.command}>npm install -g aicraft</span>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText('npm install -g aicraft')}
                title="Copy command"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section with Filters */}
      <section className={styles.searchSection}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            🌟 All
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'agent' ? styles.active : ''}`}
            onClick={() => handleFilterChange('agent')}
          >
            🤖 Agents
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'mcp' ? styles.active : ''}`}
            onClick={() => handleFilterChange('mcp')}
          >
            🔌 MCPs
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'doc' ? styles.active : ''}`}
            onClick={() => handleFilterChange('doc')}
          >
            📚 Docs
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search agents, MCPs, and docs..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 300)}
            />
          </div>

          {searchResults.length > 0 && searchFocused && (
            <div className={styles.searchDropdown}>
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className={styles.searchResult}
                  onClick={() => {
                    if (result.url) {
                      window.location.href = result.url;
                    } else if (result.type === 'agent') {
                      navigator.clipboard.writeText(`npx aicraft install ${result.name}`);
                    }
                  }}
                >
                  <span className={styles.resultEmoji}>{result.emoji}</span>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{result.name}</span>
                    <span className={styles.resultDesc}>{result.description}</span>
                  </div>
                  <span
                    className={styles.resultType}
                    data-type={result.type}
                  >
                    {result.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Showcase Grid */}
      <section className={styles.showcaseSection}>
        {/* Command Modal */}
        {selectedItem && (
          <div className={styles.commandModal} onClick={() => setSelectedItem(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <span className={styles.modalEmoji}>{selectedItem.emoji}</span>
                <h3>{selectedItem.name}</h3>
                <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalDesc}>{selectedItem.desc}</p>
                <div className={styles.commandBox}>
                  <span className={styles.prompt}>$</span>
                  <code className={styles.commandText}>
                    {selectedItem.type === 'agent' 
                      ? `npx aicraft install ${selectedItem.name}`
                      : selectedItem.type === 'mcp'
                      ? `npx aicraft add-mcp ${selectedItem.name}`
                      : selectedItem.subtype === 'install-doc'
                      ? `npx aicraft docs ${selectedItem.name}`
                      : `# Navigate to ${selectedItem.name} documentation`}
                  </code>
                  <button 
                    className={styles.copyBtnModal}
                    onClick={() => {
                      let cmd = '';
                      if (selectedItem.type === 'agent') {
                        cmd = `npx aicraft install ${selectedItem.name}`;
                      } else if (selectedItem.type === 'mcp') {
                        cmd = `npx aicraft add-mcp ${selectedItem.name}`;
                      } else if (selectedItem.subtype === 'install-doc') {
                        cmd = `npx aicraft docs ${selectedItem.name}`;
                      }
                      if (cmd) navigator.clipboard.writeText(cmd);
                    }}
                  >
                    📋
                  </button>
                </div>
                <p className={styles.copiedNote}>✅ Command copied to clipboard!</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.showcaseGrid}>
          {/* Column 1 - Agents */}
          {(showcaseFilter === 'all' || showcaseFilter === 'agent') && (
            <div className={styles.showcaseColumn}>
              <h3 className={styles.columnTitle}>🤖 Agents</h3>
              <div className={styles.scrollContent}>
                {agents.map((item, idx) => (
                  <div 
                    key={`agent-${idx}`}
                    className={styles.showcaseItem}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemDesc}>{item.desc}</div>
                    </div>
                    <span className={styles.itemType} data-type={item.type}>
                      agent
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column 2 - MCPs */}
          {(showcaseFilter === 'all' || showcaseFilter === 'mcp') && (
            <div className={styles.showcaseColumn}>
              <h3 className={styles.columnTitle}>🔌 MCPs</h3>
              <div className={`${styles.scrollContent} ${styles.scrollReverse}`}>
                {mcps.map((item, idx) => (
                  <div 
                    key={`mcp-${idx}`}
                    className={styles.showcaseItem}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemDesc}>{item.desc}</div>
                    </div>
                    <span className={styles.itemType} data-type={item.type}>
                      mcp
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column 3 - Docs */}
          {(showcaseFilter === 'all' || showcaseFilter === 'doc') && (
            <div className={styles.showcaseColumn}>
              <h3 className={styles.columnTitle}>📚 Docs</h3>
              <div className={styles.scrollContent}>
                {docs.map((item, idx) => (
                  <div 
                    key={`doc-${idx}`}
                    className={styles.showcaseItem}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemDesc}>{item.desc}</div>
                    </div>
                    <span className={styles.itemType} data-type="doc">
                      doc
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} - AI Agent Package Manager`}
      description="Install and manage specialized AI agents for Claude Code. Supercharge your development workflow with pre-configured experts."
    >
      <MainContent />
    </Layout>
  );
}