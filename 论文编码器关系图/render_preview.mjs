import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const qa = path.join(here, 'qa');
await fs.mkdir(qa, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(pathToFileURL(path.join(here, '论文编码器交互关系图.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.graphReady === true, null, { timeout: 5000 });
  await page.screenshot({ path: path.join(qa, '交互版概览.png') });
  await page.locator('#paperPicker').selectOption('soft');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(qa, 'SoftNav功能与训练.png') });
  const softText = await page.locator('#details').innerText();
  if (!softText.includes('训练与冻结') || !softText.includes('projector + LoRA')) throw new Error('SoftNav detail is incomplete');
  await page.locator('#details [data-select="E18"]').click();
  const encoderText = await page.locator('#details').innerText();
  if (!encoderText.includes('输入 → 输出') || !encoderText.includes('对应功能')) throw new Error('Encoder functionality is missing');
  await page.locator('#search').fill('CLIP');
  const searchText = await page.locator('#matches').innerText();
  if (!searchText.includes('CLIP')) throw new Error('Search did not expose CLIP nodes');
  await page.evaluate(() => select('E02', true));
  await page.waitForTimeout(250);
  const clipText = await page.locator('#details').innerText();
  if (!clipText.includes('经 Dynam3D 后端') || !clipText.includes('导航基线')) throw new Error('Direct / backend / baseline usage scopes are missing');
  await page.screenshot({ path: path.join(qa, 'CLIP使用范围.png') });
  const nodes = await page.locator('g[data-node]').count();
  const report = { ready: true, browserErrors: errors, nodes, paperPickerOptions: await page.locator('#paperPicker option').count(), searchResult: searchText.split('\n')[0] };
  await fs.writeFile(path.join(qa, 'browser_check.json'), JSON.stringify(report, null, 2));
  if (errors.length) throw new Error(errors.join('\n'));
  process.stdout.write(JSON.stringify(report));
} finally {
  await browser.close();
}
