(async()=>{
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const src = path.resolve('.'); const out = path.resolve('..');
const only = process.argv.slice(2);
const files = fs.readdirSync(src).filter(f => /^\d\d-.*\.html$/.test(f) && (!only.length || only.some(o => f.startsWith(o))));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
for (const f of files) {
  await page.goto('file://' + path.join(src, f));
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('.canvas');
  const dir = f.includes('story') ? 'stories' : 'feed';
  fs.mkdirSync(path.join(out, dir), { recursive: true });
  const dest = path.join(out, dir, f.replace('.html', '.png'));
  await el.screenshot({ path: dest });
  console.log(dest);
}
await browser.close();
})();
