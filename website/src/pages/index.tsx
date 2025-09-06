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
        <div className={styles.brandingText}>CLAUDE CODE AGENTS</div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary button--lg', styles.primaryButton)}
            to="/docs/intro"
          >
            Get Started
          </Link>
          <Link
            className={clsx('button button--secondary button--lg', styles.secondaryButton)}
            href="https://www.npmjs.com/package/aicraft"
          >
            Install
          </Link>
        </div>
      </div>
    </header>
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
      output:
        'Available agents:\n  • shadcn-ui-expert\n  • react-architect\n  • neo4j-expert\n  • docker-expert',
    },
    {
      command: 'npx aicraft install neo4j-expert',
      description: 'Install specialized agent',
      output: '✅ neo4j-expert installed',
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

function AgentShowcase() {
  const agents = [
    {
      name: 'shadcn-ui-expert',
      description: 'Build beautiful UIs with shadcn/ui components',
      icon: '🎨',
      tags: ['React', 'UI/UX', 'Components'],
    },
    {
      name: 'react-architect',
      description: 'Design scalable React application architectures',
      icon: '🏗️',
      tags: ['React', 'Architecture', 'Next.js'],
    },
    {
      name: 'neo4j-expert',
      description: 'Master graph databases and Cypher queries',
      icon: '🔗',
      tags: ['Database', 'Graph', 'Cypher'],
    },
    {
      name: 'docker-expert',
      description: 'Containerization and orchestration specialist',
      icon: '🐳',
      tags: ['Docker', 'DevOps', 'Containers'],
    },
  ];

  return (
    <section className={styles.agentSection}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2" className={styles.sectionTitle}>
            Specialized AI Agents
          </Heading>
          <p className={styles.sectionSubtitle}>
            Pre-configured experts for specific domains and technologies
          </p>
        </div>

        <div className={styles.agentGrid}>
          {agents.map((agent, idx) => (
            <div key={idx} className={styles.agentCard}>
              <div className={styles.agentIcon}>{agent.icon}</div>
              <h3 className={styles.agentName}>{agent.name}</h3>
              <p className={styles.agentDescription}>{agent.description}</p>
              <div className={styles.agentTags}>
                {agent.tags.map((tag, tagIdx) => (
                  <span key={tagIdx} className={styles.agentTag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.agentActions}>
                <button className={styles.installButton}>npx aicraft install {agent.name}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <TerminalCommands />
        <AgentShowcase />
      </main>
    </Layout>
  );
}
