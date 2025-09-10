import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroContent}>
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
        <p className="hero__subtitle">{siteConfig.tagline}</p>

        {/* Metadata badges */}
        <div className={styles.metadataBadges}>
          <a href="https://www.npmjs.com/package/aicraft" className={styles.badge}>
            <img src="https://img.shields.io/npm/v/aicraft?style=flat-square&color=6366f1" alt="npm version" />
          </a>
          <a href="https://www.npmjs.com/package/aicraft" className={styles.badge}>
            <img src="https://img.shields.io/npm/dm/aicraft?style=flat-square&color=10b981" alt="downloads" />
          </a>
          <a href="https://github.com/Tanguyvans/aicraft" className={styles.badge}>
            <img src="https://img.shields.io/github/stars/Tanguyvans/aicraft?style=flat-square&color=8b5cf6" alt="stars" />
          </a>
          <a href="https://github.com/Tanguyvans/aicraft/blob/main/LICENSE" className={styles.badge}>
            <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license" />
          </a>
        </div>

        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary button--lg', styles.primaryButton)}
            to="/docs/intro"
          >
            📚 Documentation
          </Link>
          <Link
            className={clsx('button button--secondary button--lg', styles.secondaryButton)}
            href="https://www.npmjs.com/package/aicraft"
          >
            📦 Install
          </Link>
        </div>

        {/* Quick install */}
        <div className={styles.quickInstall}>
          <div className={styles.installPrompt}>
            <span className={styles.promptSymbol}>❯</span>
            <code>npm install -g aicraft</code>
            <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText('npm install -g aicraft')}>📋</button>
          </div>
        </div>
      </div>
    </header>
  );
}


function AgentBrowser({ searchTerm, setSearchTerm, activeCategory, setActiveCategory }) {
  const categories = [
    { emoji: '🤖', name: 'agents' },
    { emoji: '⚡', name: 'commands' },
    { emoji: '🔌', name: 'mcps' },
    { emoji: '📚', name: 'docs' }
  ];

  return (
    <section className={styles.browserSection}>
      <div className="container">
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <span className={styles.searchPrompt}>&gt;</span>
            <input
              type="text"
              placeholder="Find agents, commands, and tools..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton} onClick={() => setSearchTerm('')}>🔍</button>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={clsx(styles.categoryButton, {
                [styles.activeCategory]: activeCategory === category.name
              })}
              onClick={() => setActiveCategory(activeCategory === category.name ? 'all' : category.name)}
            >
              <span className={styles.categoryEmoji}>{category.emoji}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function TerminalCommands() {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const commands = [
    {
      command: 'npm install -g aicraft',
      description: 'Install AICraft globally',
      output: '✅ AICraft installed successfully',
    },
    {
      command: 'npx aicraft list',
      description: 'View available agents',
      output: 'Available agents:\n  • shadcn-ui-expert\n  • design-review',
    },
    {
      command: 'npx aicraft install shadcn-ui-expert',
      description: 'Install shadcn/ui expert agent',
      output: '✅ shadcn-ui-expert installed',
    },
    {
      command: 'npx aicraft create my-agent',
      description: 'Create custom agent',
      output: '🎯 Creating new agent scaffold...',
    },
    {
      command: 'npx aicraft init',
      description: 'Initialize Claude workflow',
      output: '🚀 Workspace initialized with Claude integration',
    },
  ];

  useEffect(() => {
    if (!isTyping) return;

    const currentCommand = commands[currentCommandIndex];
    const fullText = currentCommand.command;

    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentCommandIndex((prev) => (prev + 1) % commands.length);
        setDisplayedText('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, currentCommandIndex, isTyping, commands]);

  return (
    <section className={styles.terminalSection}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2" className={styles.sectionTitle}>
            Get Started in Seconds
          </Heading>
          <p className={styles.sectionSubtitle}>
            Install and manage AI agents with simple CLI commands
          </p>
        </div>

        <div className={styles.terminalWrapper}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.terminalButton} style={{ backgroundColor: '#ff5f57' }}></span>
              <span className={styles.terminalButton} style={{ backgroundColor: '#ffbd2e' }}></span>
              <span className={styles.terminalButton} style={{ backgroundColor: '#28ca42' }}></span>
            </div>
            <div className={styles.terminalTitle}>terminal — aicraft</div>
          </div>
          <div className={styles.terminalContent}>
            <div className={styles.terminalLine}>
              <span className={styles.terminalPrompt}>❯</span>
              <span className={styles.terminalCommand}>
                {displayedText}
                <span className={styles.cursor}>|</span>
              </span>
            </div>

            {displayedText === commands[currentCommandIndex]?.command && (
              <div className={styles.terminalOutput}>
                {commands[currentCommandIndex].output.split('\n').map((line, idx) => (
                  <div key={idx} className={styles.terminalOutputLine}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.commandGrid}>
          {commands.map((cmd, idx) => (
            <div
              key={idx}
              className={clsx(styles.commandCard, {
                [styles.active]: idx === currentCommandIndex,
              })}
              onClick={() => {
                setCurrentCommandIndex(idx);
                setDisplayedText('');
                setIsTyping(true);
              }}
            >
              <div className={styles.commandCardHeader}>
                <code className={styles.commandCardCommand}>{cmd.command}</code>
              </div>
              <p className={styles.commandCardDescription}>{cmd.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrowseContent({ searchTerm, activeCategory }) {
  const agents = [
    {
      name: 'shadcn-ui-expert',
      description: 'Build beautiful UIs with shadcn/ui components and blocks',
      icon: '🎨',
      tags: ['React', 'UI/UX', 'Components'],
      category: 'agents',
    },
    {
      name: 'design-review',
      description: 'Comprehensive design reviews with automated testing',
      icon: '🔍',
      tags: ['Design', 'Testing', 'Playwright'],
      category: 'agents',
    },
  ];

  const commands = [
    { name: 'npx aicraft list', description: 'List all available agents', icon: '📋' },
    { name: 'npx aicraft install [name]', description: 'Install a specific agent', icon: '📦' },
    { name: 'npx aicraft create [name]', description: 'Create a new agent', icon: '✨' },
    { name: 'npx aicraft init', description: 'Initialize Claude workflow', icon: '🚀' },
  ];

  const mcps = [
    { name: 'shadcn-components', description: 'shadcn/ui components and blocks MCP', icon: '🎨' },
    { name: 'shadcn-themes', description: 'Theme management for shadcn projects', icon: '🎭' },
    { name: 'playwright', description: 'Browser automation and testing MCP', icon: '🎪' },
  ];

  const docs = [
    { name: 'Getting Started', description: 'Quick start guide for aicraft', icon: '🚀', url: '/docs/intro' },
    { name: 'Available Agents', description: 'Browse all available agents', icon: '🤖', url: '/docs/agents' },
    { name: 'CLI Commands', description: 'Complete command reference', icon: '⚡', url: '/docs/commands' },
    { name: 'Creating Agents', description: 'Build your own custom agents', icon: '🛠️', url: '/docs/create' },
  ];

  const renderAgents = () => {
    const filteredAgents = agents.filter(agent => 
      (searchTerm === '' ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (activeCategory === 'all' || activeCategory === 'agents' || activeCategory === agent.category)
    );

    return (
      <div className={styles.agentGrid}>
        {filteredAgents.map((agent, idx) => (
          <div key={idx} className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <div className={styles.agentIcon}>{agent.icon}</div>
            </div>
            <h3 className={styles.agentName}>{agent.name}</h3>
            <p className={styles.agentDescription}>{agent.description}</p>
            <div className={styles.agentTags}>
              {agent.tags.map((tag, tagIdx) => (
                <span key={tagIdx} className={styles.agentTag}>{tag}</span>
              ))}
            </div>
            <div className={styles.agentActions}>
              <div className={styles.installCommand}>
                <span className={styles.promptSymbol}>$</span>
                <code>npx aicraft install {agent.name}</code>
                <button
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(`npx aicraft install ${agent.name}`)}
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCommands = () => {
    const filteredCommands = commands.filter(cmd => 
      (searchTerm === '' ||
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeCategory === 'all' || activeCategory === 'commands')
    );

    return (
      <div className={styles.agentGrid}>
        {filteredCommands.map((cmd, idx) => (
          <div key={idx} className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <div className={styles.agentIcon}>{cmd.icon}</div>
            </div>
            <h3 className={styles.agentName}>{cmd.name}</h3>
            <p className={styles.agentDescription}>{cmd.description}</p>
            <div className={styles.agentActions}>
              <div className={styles.installCommand}>
                <span className={styles.promptSymbol}>$</span>
                <code>{cmd.name}</code>
                <button
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(cmd.name)}
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMCPs = () => {
    const filteredMCPs = mcps.filter(mcp => 
      (searchTerm === '' ||
      mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcp.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeCategory === 'all' || activeCategory === 'mcps')
    );

    return (
      <div className={styles.agentGrid}>
        {filteredMCPs.map((mcp, idx) => (
          <div key={idx} className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <div className={styles.agentIcon}>{mcp.icon}</div>
            </div>
            <h3 className={styles.agentName}>{mcp.name}</h3>
            <p className={styles.agentDescription}>{mcp.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderDocs = () => {
    const filteredDocs = docs.filter(doc => 
      (searchTerm === '' ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeCategory === 'all' || activeCategory === 'docs')
    );

    return (
      <div className={styles.agentGrid}>
        {filteredDocs.map((doc, idx) => (
          <div key={idx} className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <div className={styles.agentIcon}>{doc.icon}</div>
            </div>
            <h3 className={styles.agentName}>{doc.name}</h3>
            <p className={styles.agentDescription}>{doc.description}</p>
            <div className={styles.agentActions}>
              <Link 
                to={doc.url} 
                className={`button button--primary ${styles.docButton}`}
              >
                View Documentation
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getCategoryTitle = () => {
    const baseTitle = (() => {
      switch(activeCategory) {
        case 'agents': return 'Available Agents';
        case 'commands': return 'CLI Commands'; 
        case 'mcps': return 'MCP Servers';
        case 'docs': return 'Documentation';
        default: return 'Explore AICraft';
      }
    })();

    if (searchTerm) {
      return `${baseTitle} - "${searchTerm}"`;
    }
    return baseTitle;
  };

  const getCategorySubtitle = () => {
    const getResultCount = () => {
      if (activeCategory === 'agents') {
        const filteredCount = agents.filter(agent => 
          (searchTerm === '' ||
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
          (activeCategory === 'all' || activeCategory === 'agents' || activeCategory === agent.category)
        ).length;
        return searchTerm ? ` (${filteredCount} found)` : '';
      }
      return '';
    };

    const baseSubtitle = (() => {
      switch(activeCategory) {
        case 'agents': return 'Pre-configured experts for specific domains and technologies';
        case 'commands': return 'Command-line interface for managing agents';
        case 'mcps': return 'Model Context Protocol servers available'; 
        case 'docs': return 'Documentation and guides for AICraft';
        default: return 'Search and discover agents, commands, and resources';
      }
    })();

    return baseSubtitle + getResultCount();
  };

  const renderContent = () => {
    switch(activeCategory) {
      case 'agents': return renderAgents();
      case 'commands': return renderCommands();
      case 'mcps': return renderMCPs();
      case 'docs': return renderDocs();
      default: return (
        <div className={styles.allContent}>
          {renderAgents()}
          <div style={{marginTop: '3rem'}}>
            <h3 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--ifm-color-emphasis-800)'}}>CLI Commands</h3>
            {renderCommands()}
          </div>
          <div style={{marginTop: '3rem'}}>
            <h3 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--ifm-color-emphasis-800)'}}>MCP Servers</h3>
            {renderMCPs()}
          </div>
          <div style={{marginTop: '3rem'}}>
            <h3 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--ifm-color-emphasis-800)'}}>Documentation</h3>
            {renderDocs()}
          </div>
        </div>
      );
    }
  };

  return (
    <section className={styles.agentSection}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2" className={styles.sectionTitle}>
            {getCategoryTitle()}
          </Heading>
          <p className={styles.sectionSubtitle}>
            {getCategorySubtitle()}
          </p>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}


export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <Layout
      title={`${siteConfig.title} - AI Agent Package Manager`}
      description="Install and manage specialized AI agents for Claude Code. Supercharge your development workflow with pre-configured experts."
    >
      <HomepageHeader />
      <main>
        <AgentBrowser
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <BrowseContent
          searchTerm={searchTerm}
          activeCategory={activeCategory}
        />
        <TerminalCommands />
      </main>
    </Layout>
  );
}
