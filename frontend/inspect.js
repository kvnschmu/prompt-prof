const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  const layout = await page.evaluate(() => {
    const rects = [];
    document.querySelectorAll('header, main, footer, nav, .glass-card, h1, .btn-primary').forEach(el => {
      const rect = el.getBoundingClientRect();
      rects.push({
        tag: el.tagName,
        className: el.className,
        text: el.innerText.substring(0, 30).replace(/\n/g, ' '),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        bottom: Math.round(rect.bottom),
      });
    });
    return rects;
  });
  
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
})();
