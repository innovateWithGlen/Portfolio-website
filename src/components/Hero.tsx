import Image from 'next/image';
import type { PortfolioUi } from '@/data/types';
import BookCallButton from '@/components/BookCallButton';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M14 14h2M8 17h2" />
    </svg>
  );
}

type HeroProps = {
  ui: PortfolioUi;
  theme: 'dark' | 'light';
};

export default function Hero({ ui, theme }: HeroProps) {
  const displayName = ui.name.trim().replace(/\s+/g, ' ');
  const portrait = ui.portrait;

  return (
    <section id="home" className="hero-section">
      <div className="hero-inner">
        <div className="hero-stage">
          <div className="hero-aura" aria-hidden="true" />

          <h1 className="hero-name" aria-label={displayName}>
            <span className="hero-name-track" aria-hidden="true">
              {[0, 1].map((group) => (
                <span className="hero-name-group" key={group}>
                  <span className="hero-name-copy">{displayName}</span>
                  <span className="hero-name-copy">{displayName}</span>
                </span>
              ))}
            </span>
          </h1>

          <div
            className={`hero-figure${portrait ? ' hero-figure-original' : ''}`}
            style={portrait ? { aspectRatio: `${portrait.width} / ${portrait.height}` } : undefined}
          >
            <Image
              className="hero-portrait"
              src={portrait?.src ?? '/images/glen-cutout.webp'}
              alt={`Portrait of ${ui.name}`}
              width={portrait?.width ?? 779}
              height={portrait?.height ?? 857}
              priority
              unoptimized
              draggable={false}
            />
          </div>

          <div className="hero-side hero-side-left">
            <span className="hero-kicker hero-role">{ui.role}</span>
            <span className="hero-location">Bengaluru · Working worldwide</span>
            <h2 className="hero-heading">
              Give your big idea
              <span className="hero-heading-muted">the website it deserves</span>
            </h2>
            <p className="hero-description">{ui.tagline}. Built to be found, trusted, and chosen.</p>
          </div>

          <div className="hero-side hero-side-right">
            <BookCallButton bookingUrl={ui.bookingUrl} theme={theme} className="hero-button">
              <CalendarIcon />
              Book Your Free Consultation
            </BookCallButton>
            <a className="hero-secondary" href="#projects">
              See my work <ArrowIcon />
            </a>
            <p className="hero-reassure">Free · No obligation · Pick a time that suits you</p>
          </div>
        </div>
      </div>
    </section>
  );
}
