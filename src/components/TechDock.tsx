'use client';

/* eslint-disable @next/next/no-img-element -- tiny external SVG logos from the SimpleIcons CDN */

import { useEffect, useRef, useState } from 'react';

type Tool = { slug: string; color: string; light?: string; label: string };

// Colours are the brands' own. `light` overrides for logos that are white
// (Next.js, Vercel, GitHub, Cal.com) so they stay visible on the light theme.
const tools: Tool[] = [
  { slug: 'javascript', color: 'F7DF1E', label: 'JavaScript' },
  { slug: 'typescript', color: '3178C6', label: 'TypeScript' },
  { slug: 'react', color: '61DAFB', label: 'React' },
  { slug: 'nextdotjs', color: 'FFFFFF', light: '111216', label: 'Next.js' },
  { slug: 'nodedotjs', color: '5FA04E', label: 'Node.js' },
  { slug: 'mongodb', color: '47A248', label: 'MongoDB Atlas' },
  { slug: 'tailwindcss', color: '06B6D4', label: 'Tailwind CSS' },
  { slug: 'cloudflare', color: 'F38020', label: 'Cloudflare' },
  { slug: 'vercel', color: 'FFFFFF', light: '111216', label: 'Vercel' },
  { slug: 'github', color: 'FFFFFF', light: '111216', label: 'Git & GitHub' },
  { slug: 'razorpay', color: '0C2451', light: '0C2451', label: 'Razorpay' },
  { slug: 'stripe', color: '635BFF', label: 'Stripe' },
  { slug: 'paypal', color: '003087', light: '003087', label: 'PayPal' },
  { slug: 'n8n', color: 'EA4B71', label: 'n8n' },
  { slug: 'zapier', color: 'FF4A00', label: 'Zapier' },
  { slug: 'namecheap', color: 'E4002B', label: 'Namecheap' },
  { slug: 'caldotcom', color: 'FFFFFF', light: '111216', label: 'Cal.com' },
  { slug: 'googlesearchconsole', color: '458CF5', label: 'Search Console' },
];

const INFLUENCE = 110; // px radius of the magnification effect
const SPEED = 30; // px/s — matches the Selected work marquee
const GROUPS = 2; // two identical groups make the -50% loop perfectly seamless

/**
 * macOS-style dock stretched edge to edge, streaming right to left forever.
 * The pill can be wider than one pass of the tool list, so each group repeats
 * the list enough times to be at least a viewport wide — otherwise the loop
 * would show a gap on large screens. Exactly two groups are rendered so the
 * -50% translate always lands on a group boundary, and the duration is derived
 * from the measured width so the speed stays constant at any screen size.
 */
export default function TechDock() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [copies, setCopies] = useState(3);
  const [duration, setDuration] = useState(84);

  useEffect(() => {
    const measure = () => {
      const group = trackRef.current?.querySelector<HTMLElement>('.tech-dock-group');
      if (!group || !copies) return;
      const groupWidth = group.offsetWidth;
      // Each group holds `copies` passes of the list, so one pass is a fraction of it.
      const perPass = groupWidth / copies;
      if (!perPass) return;
      const needed = Math.min(8, Math.max(2, Math.ceil(window.innerWidth / perPass)));
      const nextDuration = needed * perPass / SPEED;
      if (needed !== copies) setCopies(needed);
      if (Math.abs(nextDuration - duration) > 0.5) setDuration(nextDuration);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [copies, duration]);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const dock = dockRef.current;
    const frame = frameRef.current;
    if (!dock || !frame) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const frameRect = frame.getBoundingClientRect();
    // Smaller pills on phones have less headroom for growth (and touch users
    // get no mousemove anyway), so keep the scale subtle there.
    const grow = window.innerWidth <= 720 ? 0.22 : 0.4;
    let tipLeft = -1;
    let label = '';
    const items = dock.querySelectorAll<HTMLElement>('li');
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
      const t = Math.max(0, 1 - distance / INFLUENCE);
      item.style.setProperty('--dock-scale', (1 + grow * (t * t)).toFixed(3));
      if (event.clientX >= rect.left - 6 && event.clientX <= rect.right + 6) {
        tipLeft = rect.left + rect.width / 2 - frameRect.left;
        label = item.dataset.label ?? '';
      }
    });

    const tip = tipRef.current;
    if (!tip) return;
    if (label) {
      tip.textContent = label;
      tip.style.left = `${tipLeft}px`;
      tip.style.opacity = '1';
    } else {
      tip.style.opacity = '0';
    }
  };

  const onLeave = () => {
    dockRef.current?.querySelectorAll<HTMLElement>('li').forEach((item) => item.style.removeProperty('--dock-scale'));
    if (tipRef.current) tipRef.current.style.opacity = '0';
  };

  const renderList = (group: number, pass: number) =>
    tools.map((tool) => (
      <li key={`${group}-${pass}-${tool.slug}`} className="tech-dock-item" data-label={tool.label}>
        <span className="tech-dock-icon">
          <img
            className="icon-dark"
            src={`https://cdn.simpleicons.org/${tool.slug}/${tool.color}`}
            alt=""
            width={26}
            height={26}
            loading="lazy"
            decoding="async"
          />
          {tool.light && (
            <img
              className="icon-light"
              src={`https://cdn.simpleicons.org/${tool.slug}/${tool.light}`}
              alt=""
              width={26}
              height={26}
              loading="lazy"
              decoding="async"
            />
          )}
        </span>
      </li>
    ));

  return (
    <div className="tech-dock-wrap">
      <p className="tech-dock-label">Tools I ship with</p>
      <div className="tech-dock-frame" ref={frameRef} onMouseLeave={onLeave}>
        <div className="tech-dock" ref={dockRef} onMouseMove={onMove}>
          <div
            className="tech-dock-track"
            ref={trackRef}
            style={{ animationDuration: `${duration.toFixed(1)}s` }}
          >
            {Array.from({ length: GROUPS }, (_, group) => (
              <ul className="tech-dock-group" key={group} aria-hidden={group === 0 ? undefined : 'true'}>
                {Array.from({ length: copies }, (_, pass) => renderList(group, pass))}
              </ul>
            ))}
          </div>
        </div>
        <span ref={tipRef} className="tech-dock-tip" aria-hidden="true" />
      </div>
    </div>
  );
}
