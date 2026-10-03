const { chromium } = require('playwright-core');
const chromiumPkg = require('@sparticuz/chromium'); const api = chromiumPkg.default ?? chromiumPkg;
const BASE = process.argv[2];
const readX = (p, s) => p.evaluate(s => { const el = document.querySelector(s); return el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m41 : null; }, s);
(async () => {
  const browser = await chromium.launch({ executablePath: await api.executablePath(), args: api.args, headless: true, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/al2023/lib' } });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,110)); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + String(e).slice(0,110)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1500);
  const fails = [];
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.querySelector('.tech-dock')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const pill = document.querySelector('.tech-dock').getBoundingClientRect();
      const group = document.querySelector('.tech-dock-group').getBoundingClientRect();
      return { vw: innerWidth, pillL: pill.left, pillR: pill.right, groupW: group.width,
               items: document.querySelectorAll('.tech-dock-item').length,
               groups: document.querySelectorAll('.tech-dock-group').length,
               overflow: document.documentElement.scrollWidth > innerWidth };
    });
    const edge = Math.abs(r.pillL) <= 1 && Math.abs(r.pillR - r.vw) <= 1;
    console.log(`${width}px: pill ${Math.round(r.pillL)}→${Math.round(r.pillR)} edgeToEdge=${edge} | group ${Math.round(r.groupW)}>=vw ${covers(r)} | ${r.groups} groups / ${r.items} icons | pageOverflow=${r.overflow}`);
    function covers(x) { return x.groupW >= x.vw; }
    if (!edge) fails.push(`${width}px not edge-to-edge`);
    if (r.groupW < r.vw) fails.push(`${width}px loop gap`);
    if (r.overflow) fails.push(`${width}px horizontal overflow`);
    if (r.groups !== 2) fails.push(`${width}px expected 2 groups, got ${r.groups}`);
  }
  // direction, pause, magnify at 1920
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.evaluate(() => document.querySelector('.tech-dock').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1000);
  const g0 = await readX(page, '.tech-dock-track'); await page.waitForTimeout(1000); const g1 = await readX(page, '.tech-dock-track');
  const gw = await page.evaluate(() => document.querySelector('.tech-dock-group').offsetWidth);
  const d = g1 - g0; const eff = d > 0 && d > gw / 2 ? d - gw : d;
  console.log(`stream ${eff.toFixed(1)}px/s ${eff < 0 ? '(right to left)' : '(WRONG)'}`);
  if (eff >= 0) fails.push('wrong direction');
  const pill = await (await page.$('.tech-dock')).boundingBox();
  await page.mouse.move(pill.x + pill.width * 0.5, pill.y + pill.height / 2, { steps: 6 });
  await page.waitForTimeout(400);
  const p0 = await readX(page, '.tech-dock-track'); await page.waitForTimeout(600); const p1 = await readX(page, '.tech-dock-track');
  const scale = await page.evaluate(() => Math.max(...Array.from(document.querySelectorAll('.tech-dock-item')).map(i => parseFloat(i.style.getPropertyValue('--dock-scale') || '1'))));
  console.log(`hover: drift ${Math.abs(p1-p0).toFixed(2)}px | max scale ${scale.toFixed(2)}`);
  if (Math.abs(p1-p0) > 2) fails.push('no pause on hover');
  if (scale < 1.3) fails.push('weak magnification');
  console.log('console errors:', errors.length ? errors : 'none');
  if (errors.length) fails.push('console errors');
  await browser.close();
  if (fails.length) { console.log('FAIL:', fails.join(' | ')); process.exit(1); }
  console.log('ALL FULL-BLEED DOCK CHECKS PASSED');
})();
