import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolveRoute, searchItems, validateContact, wheelPosition, escapeHTML } from '../dist/lib.js';
import { experiments, pages, personal } from '../dist/content.js';

test('every navigation route and demo resolves, including direct-entry URLs', () => {
  for (const page of pages) assert.notEqual(resolveRoute(page.path, experiments).page, 'not-found');
  for (const experiment of experiments) assert.equal(resolveRoute(`/lab/${experiment.id}`, experiments).experiment, experiment);
  assert.equal(resolveRoute('/about/', experiments).page, 'about');
  assert.equal(resolveRoute('/unavailable', experiments).page, 'not-found');
});
test('empty datasets resolve safely without leaving ghost experiments in search', () => {
  assert.equal(resolveRoute('/lab', []).page, 'lab');
  assert.equal(resolveRoute('/lab/elastic-type', []).page, 'not-found');
  assert.equal(searchItems('', pages, []).filter(i => i.group === 'Demo experiments').length, 0);
});
test('search matches pages, demos, categories and theme actions', () => {
  assert.equal(searchItems('contact', pages, experiments)[0].path, '/contact');
  assert.equal(searchItems('elastic', pages, experiments)[0].path, '/lab/elastic-type');
  assert.equal(searchItems(' TYPOGRAPHY ', pages, experiments)[0].title, 'Elastic type');
  assert.equal(searchItems('dark theme', pages, experiments)[0].action, 'dark');
  assert.deepEqual(searchItems('does-not-exist', pages, experiments), []);
});
test('contact validation rejects missing, malformed, short and oversized submissions', () => {
  const valid = { reason: 'hello', name: 'Test Visitor', email: 'visitor@example.com', message: 'This is a locally tested preview letter.' };
  assert.deepEqual(validateContact(valid), {});
  assert.ok(validateContact({...valid,email:'invalid@'}).email);
  assert.ok(validateContact({...valid,name:'  '}).name);
  assert.ok(validateContact({...valid,message:'Hi'}).message);
  assert.ok(validateContact({...valid,message:'x'.repeat(5001)}).message);
  assert.ok(validateContact({...valid,reason:'invalid'}).reason);
  assert.equal(personal.contactEndpoint, null);
});
test('the curved wheel centers the selected title and fans its neighbors along an arc', () => {
  const center = wheelPosition(2,2), before = wheelPosition(1,2), after = wheelPosition(3,2);
  assert.deepEqual(center,{x:0,y:0,angle:0,opacity:1});
  assert.ok(before.y < 0 && after.y > 0);
  assert.ok(before.angle < 0 && after.angle > 0);
  assert.equal(before.x,after.x);
  assert.equal(before.opacity,after.opacity);
  assert.ok(before.opacity < center.opacity);
});
test('editable text cannot inject markup', () => {
  assert.equal(escapeHTML('<img src="x" onerror=\'bad\'>'),'&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;');
});
test('self-hosted fonts, licenses, favicon and application entry points exist', async () => {
  for (const path of ['assets/fonts/DM-Sans.ttf','assets/fonts/IBM-Plex-Mono.ttf','assets/fonts/DM-Sans-LICENSE.txt','assets/fonts/IBM-Plex-Mono-LICENSE.txt','assets/favicon.svg','app.js','styles.css','index.html']) {
    const info = await stat(new URL(`../dist/${path}`,import.meta.url)); assert.ok(info.size > 0,path);
  }
  const html = await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('star41-theme') < html.indexOf('href="/styles.css"'));
  assert.match(html, /<dialog id="search-dialog"/);
});
