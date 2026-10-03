'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PortfolioPortrait } from '@/data/types';

type PortraitImporterProps = {
  portrait?: PortfolioPortrait;
  onImported: (portrait: PortfolioPortrait) => void;
};

export default function PortraitImporter({ portrait, onImported }: PortraitImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function importOriginal() {
    if (!file || busy) return;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const form = new FormData();
      form.set('portrait', file);
      const response = await fetch('/api/local-admin/portrait', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The original photo could not be imported.');
      onImported(result.portrait as PortfolioPortrait);
      setNotice('Original photo imported unchanged. Click “Save all changes” to apply it to the hero, About section, and social preview.');
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-card">
      <h2>Original portrait — preserve your facial features</h2>
      <div className="admin-portrait-grid">
        <div className="admin-portrait-preview">
          <Image
            src={portrait?.src ?? '/images/glen-portrait.jpg'}
            alt="Current portfolio portrait"
            width={portrait?.width ?? 896}
            height={portrait?.height ?? 1200}
            unoptimized
          />
        </div>
        <div>
          <p className="admin-help">Import your actual photo rather than generating a new likeness. The original file is stored byte-for-byte: no face retouching, skin smoothing, background removal, crop, or re-encoding. Its full frame is displayed on the site.</p>
          <label className="admin-label" htmlFor="original-portrait">Original photo (JPEG, PNG, WebP or AVIF · up to 20 MB)</label>
          <input
            id="original-portrait"
            className="admin-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => { setFile(event.target.files?.[0] ?? null); setNotice(''); setError(''); }}
            disabled={busy}
          />
          <button className="admin-button" type="button" disabled={!file || busy} onClick={importOriginal}>
            {busy ? 'Importing original…' : 'Use original photo'}
          </button>
          {portrait && <p className="admin-help">Full-frame photo selected · {portrait.width} × {portrait.height}px</p>}
          {notice && <p className="admin-import-success" role="status">{notice}</p>}
          {error && <p className="admin-import-error" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  );
}
