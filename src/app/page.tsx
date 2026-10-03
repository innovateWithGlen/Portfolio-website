'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import portfolioData from '@/data/portfolio.json';
import type { PortfolioData } from '@/data/types';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SkillsBento from '@/components/SkillsBento';
import ProjectsGrid from '@/components/ProjectsGrid';
import BookCallButton from '@/components/BookCallButton';
import TechDock from '@/components/TechDock';
import AnimatedBackground from '@/components/AnimatedBackground';
import InteractionEffects from '@/components/InteractionEffects';
import ScrollReveal from '@/components/ScrollReveal';

const data = portfolioData as PortfolioData;
const THEME_EVENT = 'glenweb-theme-change';

function subscribeToTheme(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

type Theme = 'dark' | 'light';

function getThemeSnapshot(): Theme {
  return window.localStorage.getItem('glenweb-theme') === 'light' ? 'light' : 'dark';
}

function getServerThemeSnapshot(): Theme {
  return 'dark';
}

export default function PortfolioPage() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const darkMode = theme === 'dark';
  const { ui, services, projects } = data;
  const portrait = ui.portrait;

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.body.style.colorScheme = theme;
    document.body.style.backgroundColor = darkMode ? '#030304' : '#f5f6f8';
  }, [theme, darkMode]);

  const toggleTheme = () => {
    window.localStorage.setItem('glenweb-theme', darkMode ? 'light' : 'dark');
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <div className={`site-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <AnimatedBackground />
      <Navbar name={ui.name} bookingUrl={ui.bookingUrl} darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main>
        <Hero ui={ui} theme={theme} />

        <div className="value-strip" aria-label="How I work">
          <div className="site-container value-strip-inner">
            <span>Web & mobile apps</span>
            <span>Business systems & e-commerce</span>
            <span>Digital visibility & growth</span>
          </div>
        </div>

        <TechDock />

        <section id="about" className="section about-section">
          <div className="site-container about-grid">
            <div className="portrait-card">
              <div className={`portrait-photo${portrait ? ' portrait-photo-original' : ''}`} style={portrait ? { aspectRatio: `${portrait.width} / ${portrait.height}` } : undefined}>
                <Image
                  src={portrait?.src ?? '/images/glen-portrait.jpg'}
                  alt={`Portrait of ${ui.name}`}
                  width={portrait?.width ?? 896}
                  height={portrait?.height ?? 1200}
                  unoptimized
                />
              </div>
              <div className="portrait-caption portrait-caption-detailed">
                <strong>{ui.name}</strong>
                <span>{ui.role}</span>
              </div>
            </div>

            <div className="about-content">
              <span className="section-kicker">01 / Behind the work</span>
              <h2 className="section-title">Built with code.<br /><span>Driven by outcomes.</span></h2>
              <p className="about-lead">{ui.aboutBio}</p>

              <div className="about-details">
                <div className="about-detail">
                  <span>What I build</span>
                  <p>Web & mobile apps, CRM platforms, management systems, and e-commerce websites</p>
                </div>
                <div className="about-detail">
                  <span>Beyond the build</span>
                  <p>Search & Maps visibility, cloud hosting, Google Business, and social presence</p>
                </div>
              </div>

              <div className="education-line">
                <div className="education-symbol" aria-hidden="true">✳</div>
                <div>
                  <span>Education</span>
                  <strong>{ui.education.degree}</strong>
                  <p>{ui.education.institution}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SkillsBento bookingUrl={ui.bookingUrl} theme={theme} services={services} />
        <ProjectsGrid projects={projects} />

        <section id="contact" className="section contact-section">
          <div className="contact-glow" aria-hidden="true" />
          <div className="site-container contact-inner">
            <span className="section-kicker">Free 15-minute consultation</span>
            <h2>Let&apos;s talk about<br /><span>growing your business.</span></h2>
            <BookCallButton bookingUrl={ui.bookingUrl} theme={theme} className="hero-button contact-book">
              Book Your Free Consultation
            </BookCallButton>
            <p>Need a website, a mobile app, an online store, or a system to run your business? Pick a time for a free 15-minute call. We&apos;ll talk through your goals and a practical plan for the next step. No pressure, no obligation.</p>

            <ol className="contact-steps">
              <li><span>1</span>Pick a time on my calendar</li>
              <li><span>2</span>Quick 15-min chat about your goals</li>
              <li><span>3</span>Get a clear, honest plan</li>
            </ol>
            <p className="contact-alt">
              Prefer to write? <a href={`mailto:${ui.email}`}>Email me</a> or <a href={ui.linkedin} target="_blank" rel="noreferrer">connect on LinkedIn ↗</a>
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-inner">
          <span>© {new Date().getFullYear()} {ui.name}. Built with intention.</span>
          <div>
            <BookCallButton bookingUrl={ui.bookingUrl} theme={theme}>Book a call</BookCallButton>
            <a href={`mailto:${ui.email}`}>Email</a>
            <a href={ui.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>
      <InteractionEffects />
      <ScrollReveal />
    </div>
  );
}
