'use client';

import { useState } from 'react';
import initialData from '@/data/portfolio.json';
import type { PortfolioData, PortfolioProject } from '@/data/types';
import PortraitImporter from './PortraitImporter';
import ServicesEditor from './ServicesEditor';

const categories = [
  'MERN & Full Stack',
  'SEO / GEO / AEO',
  'NFC & QR Solutions',
  'Cloud & Hosting',
];

export default function LocalAdminDashboard() {
  const [data, setData] = useState<PortfolioData>(initialData as PortfolioData);
  const [newUrl, setNewUrl] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState<PortfolioProject | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  const updateUi = <K extends keyof PortfolioData['ui']>(key: K, value: PortfolioData['ui'][K]) => {
    setData((current) => ({ ...current, ui: { ...current.ui, [key]: value } }));
  };

  const handleFetchPreview = async () => {
    setErrorStatus('');
    if (!newUrl.trim()) {
      setErrorStatus('Paste a project URL first.');
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await fetch('/api/local-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', url: newUrl.trim() }),
      });
      const scraped = await response.json();
      if (!response.ok) throw new Error(scraped.error || 'Could not fetch this preview.');
      setPreviewCard({ ...scraped, category, id: Date.now().toString() });
    } catch (error) {
      setErrorStatus(error instanceof Error ? error.message : 'Could not fetch this preview.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAddProject = () => {
    if (!previewCard) return;
    setData((current) => ({ ...current, projects: [previewCard, ...current.projects] }));
    setPreviewCard(null);
    setNewUrl('');
  };

  const handleSaveToFile = async () => {
    setSaveStatus('Saving...');
    setErrorStatus('');
    try {
      const response = await fetch('/api/local-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save the file.');
      setSaveStatus('Saved to src/data/portfolio.json. Ready for git push.');
      window.setTimeout(() => setSaveStatus(''), 4500);
    } catch (error) {
      setSaveStatus('');
      setErrorStatus(error instanceof Error ? error.message : 'Could not save the file.');
    }
  };

  const removeProject = (id: string) => {
    setData((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== id) }));
  };

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-heading">
            <h1>Local Portfolio Admin</h1>
            <p>Development-only editor · changes write directly to src/data/portfolio.json</p>
          </div>
          <button type="button" onClick={handleSaveToFile} className="admin-button">Save all changes</button>
        </header>

        {saveStatus && <div className="admin-status">✓ {saveStatus}</div>}
        {errorStatus && <div className="admin-status" style={{ borderColor: '#b91c1c', color: '#fca5a5', background: 'rgba(127, 29, 29, 0.3)' }}>{errorStatus}</div>}

        <PortraitImporter portrait={data.ui.portrait} onImported={(portrait) => updateUi('portrait', portrait)} />

        <section className="admin-card">
          <h2>1. Add a project by URL</h2>
          <div className="admin-form-row">
            <input className="admin-input" type="url" placeholder="https://client-website.com" value={newUrl} onChange={(event) => setNewUrl(event.target.value)} />
            <select className="admin-select" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
            <button type="button" onClick={handleFetchPreview} disabled={loadingPreview} className="admin-button secondary">{loadingPreview ? 'Scraping…' : 'Fetch preview'}</button>
          </div>

          {previewCard && (
            <div className="admin-preview">
              <img src={previewCard.image} alt="Fetched website preview" />
              <div>
                <label className="admin-label" htmlFor="preview-title">Project title</label>
                <input id="preview-title" className="admin-input" value={previewCard.title} onChange={(event) => setPreviewCard({ ...previewCard, title: event.target.value })} />
                <label className="admin-label" htmlFor="preview-description" style={{ marginTop: 10 }}>Description</label>
                <textarea id="preview-description" className="admin-textarea" value={previewCard.description} onChange={(event) => setPreviewCard({ ...previewCard, description: event.target.value })} rows={2} />
                <div className="admin-preview-actions">
                  <button type="button" onClick={handleAddProject} className="admin-button">+ Add to portfolio</button>
                  <button type="button" onClick={() => setPreviewCard(null)} className="admin-button secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="admin-card">
          <h2>2. Edit hero and contact content</h2>
          <div className="admin-ui-grid">
            <div>
              <label className="admin-label" htmlFor="name">Name</label>
              <input id="name" className="admin-input" value={data.ui.name} onChange={(event) => updateUi('name', event.target.value)} />
            </div>
            <div>
              <label className="admin-label" htmlFor="role">Role</label>
              <input id="role" className="admin-input" value={data.ui.role} onChange={(event) => updateUi('role', event.target.value)} />
            </div>
            <div className="admin-field-wide">
              <label className="admin-label" htmlFor="tagline">Hero tagline</label>
              <input id="tagline" className="admin-input" value={data.ui.tagline} onChange={(event) => updateUi('tagline', event.target.value)} />
            </div>
            <div className="admin-field-wide">
              <label className="admin-label" htmlFor="aboutBio">About bio</label>
              <textarea id="aboutBio" className="admin-textarea" value={data.ui.aboutBio} onChange={(event) => updateUi('aboutBio', event.target.value)} rows={4} />
            </div>
            <div>
              <label className="admin-label" htmlFor="availability">Availability label</label>
              <input id="availability" className="admin-input" value={data.ui.availability} onChange={(event) => updateUi('availability', event.target.value)} />
            </div>
            <div>
              <label className="admin-label" htmlFor="email">Contact email</label>
              <input id="email" className="admin-input" type="email" value={data.ui.email} onChange={(event) => updateUi('email', event.target.value)} />
            </div>
            <div className="admin-field-wide">
              <label className="admin-label" htmlFor="bookingUrl">Cal.com booking link</label>
              <input id="bookingUrl" className="admin-input" type="url" placeholder="https://cal.com/your-name/event" value={data.ui.bookingUrl} onChange={(event) => updateUi('bookingUrl', event.target.value)} />
            </div>
            <div className="admin-field-wide">
              <label className="admin-label" htmlFor="linkedin">LinkedIn URL</label>
              <input id="linkedin" className="admin-input" type="url" value={data.ui.linkedin} onChange={(event) => updateUi('linkedin', event.target.value)} />
            </div>
          </div>
        </section>

        <ServicesEditor services={data.services} onChange={(services) => setData((current) => ({ ...current, services }))} />

        <section className="admin-card">
          <h2>3. Active projects ({data.projects.length})</h2>
          <div className="admin-project-list">
            {data.projects.map((project) => (
              <article className="admin-project" key={project.id}>
                <img src={project.image} alt="" />
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.category} · {project.url}</p>
                </div>
                <button type="button" onClick={() => removeProject(project.id)} className="admin-button danger">Remove</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
