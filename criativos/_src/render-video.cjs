const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [html, outDir, fps = '30', dur = '20'] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const el = await p.$('.canvas');
  const n = Math.round(+fps * +dur);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / +fps);
    await el.screenshot({ path: path.join(outDir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close(); console.log('frames', n);
})();
