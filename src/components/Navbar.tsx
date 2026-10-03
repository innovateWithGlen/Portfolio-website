'use client';

import { useState, type MouseEvent } from 'react';
import BookCallButton from '@/components/BookCallButton';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.5 8.5 0 1 0 12 12Z" />
    </svg>
  );
}

type NavbarProps = {
  name: string;
  bookingUrl: string;
  darkMode: boolean;
  onToggleTheme: () => void;
};

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ name, bookingUrl, darkMode, onToggleTheme }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = darkMode ? 'dark' : 'light';

  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    const isContact = href === '#contact';
    if (!menuOpen && !isContact) return; // Keep native anchor navigation on other desktop links.

    // On mobile the clicked link disappears as the menu closes. For Contact,
    // jump immediately so the booking CTA is visible without waiting for a
    // long smooth-scroll animation from the top of the portfolio.
    event.preventDefault();
    window.history.pushState(null, '', href);
    window.requestAnimationFrame(() => {
      document.getElementById(href.slice(1))?.scrollIntoView({
        behavior: isContact ? 'instant' : window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <a className="brand-mark" href="#home" aria-label={`${name} — back to top`} onClick={() => setMenuOpen(false)}>
          <span className="brand-monogram" aria-hidden="true"><span>G</span><span>M</span></span>
          <span className="brand-wordmark">{name}</span>
        </a>

        <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={(event) => handleNavigation(event, link.href)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-controls">
          <BookCallButton bookingUrl={bookingUrl} theme={theme} className="nav-book" onOpen={() => setMenuOpen(false)}>
            Book a call
          </BookCallButton>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
