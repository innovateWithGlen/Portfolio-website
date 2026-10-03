const { chromium } = require('playwright-core');
const pkg = require('@sparticuz/chromium'); const api = pkg.default ?? pkg;
const BASE = process.argv[2]; const SHOTS = process.argv[3] === 'shots';
const parse = (c) => {
  if (!c) return null;
  let m = c.match(/color\(srgb ([^)]+)\)/);
  if (m) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] ?? 1 }; }
  m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
};
(async () => {
  const browser = await chromium.launch({ executablePath: await api.executablePath(), args: api.args, headless: true, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/al2023/lib' } });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.evaluate(() => localStorage.setItem('glenweb-theme', 'light'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  // let reveal animations finish so nothing is mid-fade
  for (const id of ['#about', '#skills', '#projects', '#contact']) { await page.evaluate((s) => document.querySelector(s).scrollIntoView(), id); await page.waitForTimeout(900); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
  if (SHOTS) {
    await page.screenshot({ path: '.preview/L-hero.png' });
    for (const id of ['about', 'skills', 'projects', 'contact']) {
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), '#' + id); await page.waitForTimeout(900);
      await page.screenshot({ path: `.preview/L-${id}.png` });
    }
    console.log('shots saved'); await browser.close(); return;
  }
  const rows = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (!el || seen.has(el) || el.closest('.bg-scene, .cursor-dot, .cursor-ring, .hero-name, script, style')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      seen.add(el);
      const chain = []; let n = el; while (n && n !== document.documentElement) { const s = getComputedStyle(n); chain.push({ bg: s.backgroundColor, img: s.backgroundImage }); n = n.parentElement; }
      const clip = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
      out.push({ text: t.textContent.trim().slice(0, 34), cls: (el.className && el.className.toString().split(' ')[0]) || el.tagName, color: cs.color, fill: cs.webkitTextFillColor, size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight), chain, clip, op: parseFloat(cs.opacity) });
    }
    return out;
  });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const page0 = { r: 247, g: 247, b: 246, a: 1 };
  const results = [];
  for (const row of rows) {
    if (row.clip) continue; // gradient text handled separately
    let bg = page0; let stops = null;
    for (let i = row.chain.length - 1; i >= 0; i--) {
      const c = parse(row.chain[i].bg); if (c && c.a > 0) bg = over(c, bg);
      const img = row.chain[i].img;
      if (img && img.includes('gradient')) {
        const cols = [...img.matchAll(/rgba?\([^)]+\)|color\(srgb [^)]+\)/g)].map((x) => parse(x[0])).filter((x) => x && x.a >= 0.9);
        const fgc = parse(row.color); const real = cols.filter((x) => !(fgc && Math.abs(x.r - fgc.r) < 2 && Math.abs(x.g - fgc.g) < 2 && Math.abs(x.b - fgc.b) < 2)); if (real.length) stops = real; // opaque gradient (buttons): judge against every stop
      }
    }
    let fg = parse(row.color); if (!fg) continue;
    const ratioOn = (b0) => { const f2 = over({ ...fg, a: fg.a * row.op }, b0); const [a, b] = [lum(f2), lum(b0)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };
    const ratio = stops ? Math.min(...stops.map((st) => ratioOn(over(st, bg)))) : ratioOn(bg);
    const large = row.size >= 24 || (row.size >= 18.66 && row.weight >= 700);
    const need = large ? 4.5 : 7;
    results.push({ ...row, ratio, need, pass: ratio >= need, large });
  }
  const fails = results.filter((r) => !r.pass).sort((x, y) => x.ratio - y.ratio);
  console.log(`LIGHT THEME AAA AUDIT: ${results.length} text nodes, ${fails.length} fail AAA (7:1 body / 4.5:1 large)`);
  const byCls = {}; for (const f of fails) { const k = f.cls; (byCls[k] ||= { n: 0, min: 99, sample: f.text, color: f.color, size: f.size }).n++; byCls[k].min = Math.min(byCls[k].min, f.ratio); }
  Object.entries(byCls).sort((a, b) => a[1].min - b[1].min).slice(0, 30).forEach(([k, v]) => console.log(`  ${v.min.toFixed(2)}:1  ${k.padEnd(26)} x${v.n}  ${v.size}px  "${v.sample}"  ${v.color}`));
  await browser.close();
})();
