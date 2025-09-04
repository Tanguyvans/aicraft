import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroContent}>
        <div className={styles.brandingText}>
          CLAUDE CODE AGENTS
        </div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link 
            className={clsx("button button--primary button--lg", styles.primaryButton)} 
            to="/docs/intro"
          >
            Get Started
          </Link>
          <Link
            className={clsx("button button--secondary button--lg", styles.secondaryButton)}
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
  const commands = [
    { command: 'npm install -g aicraft', description: 'Install AICraft globally' },
    { command: 'npx aicraft list', description: 'View available agents' },
    { command: 'npx aicraft install neo4j-expert', description: 'Install specialized agent' }
  ];

  return (
    <section className={styles.terminalSection}>
      <div className="container">
        <div className={styles.terminalWrapper}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.terminalButton} style={{backgroundColor: '#ff5f57'}}></span>
              <span className={styles.terminalButton} style={{backgroundColor: '#ffbd2e'}}></span>
              <span className={styles.terminalButton} style={{backgroundColor: '#28ca42'}}></span>
            </div>
            <div className={styles.terminalTitle}>AICraft Commands</div>
          </div>
          <div className={styles.terminalContent}>
            {commands.map((cmd, idx) => (
              <div key={idx} className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>$</span>
                <span className={styles.terminalCommand}>{cmd.command}</span>
                <div className={styles.terminalComment}># {cmd.description}</div>
              </div>
            ))}
          </div>
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
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
