const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
let server, browser;
async function run() {
  server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://test').pathname;
    const file = {'/':'index.html','/app.js':'app.js','/style.css':'style.css'}[name];
    if (!file) { res.writeHead(404); return res.end(); }
    res.writeHead(200, {'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8'});
    res.end(fs.readFileSync(path.join(root,file)));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  browser = await chromium.launch({headless:true});
  for (const width of [390,1440]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    await page.goto('http://127.0.0.1:'+server.address().port);
    const search = page.getByRole('searchbox',{name:'Search the collection'});
    const visible = page.locator('.method-card:not(.hidden)');
    assert.equal(await visible.count(),15);
    assert.equal(await page.locator('details[open]').count(),0);
    await search.fill('Tolchinsky');
    assert.equal(await visible.count(),1,'Closed filenames must be searchable');
    assert.equal(await visible.locator('h3').innerText(),'Overview and comparison');
    await search.fill('no-such-method-zz');
    assert.equal(await visible.count(),0);
    await search.fill('Tolchinsky');
    assert.equal(await visible.count(),1,'Search must recover consistently after hidden results');
    await search.fill('cafe');
    assert((await visible.locator('h3').allTextContents()).includes('World Café'));
    await search.fill('');
    await page.getByRole('button',{name:'Whole system',exact:true}).click();
    assert.equal(await visible.count(),3);
    assert.equal(await page.getByRole('button',{name:'Whole system',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'All',exact:true}).click();
    assert.equal(await visible.count(),15);
    assert.equal(await page.locator('#result-count').getAttribute('role'),'status');
    for(const details of await page.locator('details').all()) await details.locator('summary').click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),'Open files overflow at '+width);
    assert.equal(await page.locator('.files a').count(),66);
    console.log('Passed filename search, recovery, accents, filters, announcements, and open-file layout at '+width+'px');
    await page.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));});
