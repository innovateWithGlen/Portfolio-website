'use client';

import type { PortfolioService } from '@/data/types';

type ServicesEditorProps = {
  services: PortfolioService[];
  onChange: (services: PortfolioService[]) => void;
};

export default function ServicesEditor({ services, onChange }: ServicesEditorProps) {
  function update(id: string, changes: Partial<PortfolioService>) {
    onChange(services.map((service) => service.id === id ? { ...service, ...changes } : service));
  }

  return (
    <section className="admin-card">
      <h2>Services & coming-soon offerings ({services.length})</h2>
      <p className="admin-help">These cards are read from portfolio.json. Save all changes to publish your edits locally.</p>
      <div className="admin-services-list">
        {services.map((service, index) => (
          <div className="admin-service-editor" key={service.id}>
            <div className="admin-ui-grid">
              <div>
                <label className="admin-label" htmlFor={`service-${service.id}-title`}>{String(index + 1).padStart(2, '0')} / Title</label>
                <input id={`service-${service.id}-title`} className="admin-input" value={service.title} onChange={(event) => update(service.id, { title: event.target.value })} />
              </div>
              <div>
                <label className="admin-label" htmlFor={`service-${service.id}-status`}>Status</label>
                <select id={`service-${service.id}-status`} className="admin-select" value={service.status} onChange={(event) => update(service.id, { status: event.target.value as PortfolioService['status'] })}>
                  <option value="available">Available</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>
              <div className="admin-field-wide">
                <label className="admin-label" htmlFor={`service-${service.id}-description`}>Description</label>
                <textarea id={`service-${service.id}-description`} className="admin-textarea" rows={3} value={service.description} onChange={(event) => update(service.id, { description: event.target.value })} />
              </div>
              <div>
                <label className="admin-label" htmlFor={`service-${service.id}-label`}>Details label</label>
                <input id={`service-${service.id}-label`} className="admin-input" value={service.techLabel} onChange={(event) => update(service.id, { techLabel: event.target.value })} />
              </div>
              <div>
                <label className="admin-label" htmlFor={`service-${service.id}-tech`}>Details</label>
                <input id={`service-${service.id}-tech`} className="admin-input" value={service.tech} onChange={(event) => update(service.id, { tech: event.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
