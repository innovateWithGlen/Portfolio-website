'use client';

import type { PortfolioProject } from '@/data/types';

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19 19 5M9 5h10v10" />
    </svg>
  );
}

type ProjectsGridProps = {
  projects: PortfolioProject[];
};

/**
 * "Selected work": an infinite right-to-left marquee of project cards.
 * Two identical groups make the loop seamless (each group is at least a full
 * viewport wide). The duplicate group is aria-hidden and its links are removed
 * from the tab order; hovering or focusing pauses the scroll.
 */
export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const renderGroup = (copy: number) => (
    <div className="project-group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
      {projects.map((project, index) => (
        <a
          className="project-card"
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noreferrer"
          tabIndex={copy === 1 ? -1 : undefined}
        >
          <div className="project-image-wrap">
            <div className="project-image-fallback" aria-hidden="true">
              <span>GM / 0{index + 1}</span>
              <strong>{project.title}</strong>
            </div>
            <img
              className="project-image"
              src={project.image}
              alt={`${project.title} website preview`}
              loading="lazy"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="project-content">
            <div className="project-topline">
              <span className="project-category">{project.category}</span>
              <span className="project-index">0{index + 1} / {String(projects.length).padStart(2, '0')}</span>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <span className="project-visit">View live project <ArrowUpRightIcon /></span>
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <section id="projects" className="section projects-section">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">03 / Selected work</span>
            <h2 className="section-title">The work speaks <span>for itself.</span></h2>
          </div>
          <p className="section-intro">Thoughtful digital experiences, built for real businesses and already live in the world.</p>
        </div>
      </div>

      {/* Full-bleed so each group is always at least one viewport wide. */}
      <div className="project-list">
        <div className="project-track">
          {renderGroup(0)}
          {renderGroup(1)}
        </div>
      </div>
    </section>
  );
}
