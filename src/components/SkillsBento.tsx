import type { PortfolioService, ServiceIconName } from '@/data/types';
import BookCallButton from '@/components/BookCallButton';

function ServiceIcon({ kind }: { kind: ServiceIconName }) {
  const marks = {
    code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5M7.5 12l2-3 2 2 2-3" /></>,
    tag: <><path d="M20 13 13 20l-9-9V4h7l9 9Z" /><circle cx="8" cy="8" r="1.2" /></>,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.06 9.2 4.5 4.5 0 0 0 7 18Z" /></>,
    workflow: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M17.5 10V6.5H14M6.5 14v3.5H10M10 6.5h4m-4 11h4" /></>,
    commerce: <><path d="M3 3h2l2.4 11.5h11.2L21 6H6m2 8.5h11" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    sparkles: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 13 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {marks[kind]}
    </svg>
  );
}

type SkillsBentoProps = {
  bookingUrl: string;
  theme: 'dark' | 'light';
  services: PortfolioService[];
};

export default function SkillsBento({ bookingUrl, theme, services }: SkillsBentoProps) {
  return (
    <section id="skills" className="section services-section">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">02 / What I can do for you</span>
            <h2 className="section-title">One partner. <span>Every moving part.</span></h2>
          </div>
          <p className="section-intro">Web and mobile apps, custom business systems, online stores, and the visibility to help customers find them.</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const comingSoon = service.status === 'coming-soon';
            return (
              <article className={`service-card${comingSoon ? ' service-card-coming-soon' : ''}`} key={service.id}>
                <div className="service-card-top">
                  <span className="service-number">{String(index + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}</span>
                  <div className="service-card-signals">
                    {comingSoon && <span className="service-status"><span aria-hidden="true" />Coming Soon</span>}
                    <div className="service-icon"><ServiceIcon kind={service.icon} /></div>
                  </div>
                </div>
                <div className="service-card-body">
                  <h3>{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
                <div className="service-tech">
                  <span>{service.techLabel}</span>
                  <p>{service.tech}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="site-container">
        <div className="services-cta">
          <div>
            <h3>Not sure which of these you need?</h3>
            <p>Tell me about your business on a quick 15-minute call and we&apos;ll work out the right website, app, or system for your goals.</p>
          </div>
          <BookCallButton bookingUrl={bookingUrl} theme={theme} className="hero-button services-cta-button">
            Book Your Free Consultation
          </BookCallButton>
        </div>
      </div>
    </section>
  );
}
