import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { experiments, personal } from '../dist/content.js';

// DOM integration tests, not a substitute for visual / real-browser QA.
const window = new Window({url:'http://localhost:4173/',settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
const html = await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
for(const key of ['window','document','location','history','localStorage','sessionStorage','HTMLElement','HTMLDialogElement','FormData','AbortController']) {
  Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
}
globalThis.matchMedia=window.matchMedia.bind(window);
let frameId=0;
const frames=new Map();
globalThis.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
window.scrollTo=()=>{};
window.HTMLElement.prototype.scrollIntoView=function(){};
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const click=selector=>{const element=$(selector);assert.ok(element,`Missing ${selector}`);element.click();};
const key=(target,value,options={})=>target.dispatchEvent(new window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...options}));
const input=(selector,value)=>{const element=$(selector);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));};
const go=path=>{history.pushState(null,'',path);window.dispatchEvent(new window.PopStateEvent('popstate'));};

document.documentElement.classList.add('intro-active');
const introStart=performance.now();
await import('../dist/app.js');
after(async()=>{frames.clear();await window.happyDOM.abort();});

test('intro reaches 100, exits, and does not replay on internal navigation',async()=>{
  assert.equal($('.intro-counter').textContent,'0');
  const tick=[...frames.values()];frames.clear();tick.forEach(fn=>fn(introStart+1500));
  assert.equal($('.intro-counter').textContent,'100');
  await new Promise(resolve=>setTimeout(resolve,140));
  assert.equal(document.documentElement.classList.contains('intro-active'),false);
  assert.equal(sessionStorage.getItem('star41-intro'),'seen');
  click('.main-nav a[href="/about"]');
  assert.equal(document.documentElement.classList.contains('intro-active'),false);
});
test('all destinations render through persistent navigation and unknown routes recover',()=>{
  for(const path of ['/about','/lab','/concept','/contact','/']){go(path);assert.ok($('main section'));assert.ok(document.title.includes('*41'));}
  go('/lost');assert.match($('h1').textContent,/off the page/);click('.not-found a');assert.equal(location.pathname,'/');
});
test('the personal file reveals and closes its biography',()=>{
  go('/about');assert.equal($('#biography').hidden,true);click('.about-toggle');assert.equal($('#biography').hidden,false);assert.equal($('.about-toggle').getAttribute('aria-expanded'),'true');click('.about-toggle');assert.equal($('#biography').hidden,true);
});
test('concept folder opens a readable document and returns focus when closed',()=>{
  go('/concept');click('.concept-folder');assert.equal($('#concept-reading').hidden,false);assert.equal($('.folder-stage').hidden,true);assert.equal(document.activeElement,$('#concept-reading h1'));click('.close-folder');assert.equal($('#concept-reading').hidden,true);assert.equal(document.activeElement,$('.concept-folder'));
});
test('all Lab layouts use the same entries and wheel keyboard navigation opens the selection',()=>{
  go('/lab');assert.equal($$('.experiment-row').length,experiments.length);
  click('[data-mode="grid"]');assert.equal($$('.experiment-tile').length,experiments.length);
  click('[data-mode="wheel"]');assert.equal($$('.wheel-item').length,experiments.length);
  const zone=$('.wheel-zone');key(zone,'Home');key(zone,'ArrowDown');assert.equal($('#wheel-item-1').getAttribute('aria-selected'),'true');assert.equal($('#wheel-open').getAttribute('href'),'/lab/interference');key(zone,'Enter');assert.equal(location.pathname,'/lab/interference');assert.ok($('.demo-moire'));
});
test('wheel buttons and scroll update selection without navigation',()=>{
  go('/lab');click('[data-mode="wheel"]');key($('.wheel-zone'),'Home');click('[data-wheel-step="1"]');assert.equal($('#wheel-item-1').getAttribute('aria-selected'),'true');
  $('.wheel-zone').dispatchEvent(new window.WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));assert.equal($('#wheel-item-2').getAttribute('aria-selected'),'true');assert.equal(location.pathname,'/lab');
});
test('pointer dragging the wheel selects a different entry without accidental navigation',()=>{
  const zone=$('.wheel-zone');key(zone,'Home');
  // Pointer capture is a rendering-engine feature; stub only that platform boundary.
  zone.setPointerCapture=()=>{};zone.hasPointerCapture=()=>true;zone.releasePointerCapture=()=>{};
  zone.dispatchEvent(new window.PointerEvent('pointerdown',{clientY:220,pointerId:1,button:0}));
  zone.dispatchEvent(new window.PointerEvent('pointermove',{clientY:110,pointerId:1}));
  zone.dispatchEvent(new window.PointerEvent('pointerup',{clientY:110,pointerId:1}));
  assert.equal($('#wheel-item-1').getAttribute('aria-selected'),'true');assert.equal(location.pathname,'/lab');
});
test('search supports shortcut, filtering, no results, arrows, Enter and focus restoration',()=>{
  go('/');$('.search-trigger').focus();key(document,'k',{ctrlKey:true});assert.equal($('#search-dialog').open,true);assert.equal(document.activeElement,$('#search-input'));
  input('#search-input','not a real result');assert.equal($$('.search-result').length,0);assert.ok($('.search-empty'));key($('#search-input'),'Enter');assert.equal($('#search-dialog').open,true);
  input('#search-input','Lab');assert.ok($$('.search-result').length);key($('#search-input'),'Enter');assert.equal(location.pathname,'/lab');assert.equal($('#search-dialog').open,false);
  $('.search-trigger').focus();click('.search-trigger');input('#search-input','theme');key($('#search-input'),'ArrowDown');key($('#search-input'),'Enter');assert.equal(document.documentElement.dataset.theme,'dark');assert.equal(document.activeElement,$('.search-trigger'));
  click('.search-trigger');click('.close-search');assert.equal(document.activeElement,$('.search-trigger'));
});
test('manual theme choices persist and system mode remains available',()=>{
  click('[data-theme-choice="light"]');assert.equal(localStorage.getItem('star41-theme'),'light');assert.equal(document.documentElement.dataset.theme,'light');go('/about');assert.equal(document.documentElement.dataset.theme,'light');click('[data-theme-choice="dark"]');assert.equal(document.documentElement.dataset.theme,'dark');click('[data-theme-choice="system"]');assert.equal(localStorage.getItem('star41-theme'),'system');assert.equal($('[data-theme-choice="system"]').getAttribute('aria-pressed'),'true');
});
test('contact validates fields, focuses the first error, and never sends a preview',()=>{
  go('/contact');let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('No preview request should occur');};
  $('#contact-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));assert.ok($('#error-email').textContent);assert.equal(document.activeElement,$('#sender-email'));
  input('#sender-email','visitor@example.com');input('#letter-message','This is a locally tested preview letter.');input('#sender-name','Test Visitor');
  $('#contact-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));assert.match($('#contact-status').textContent,/Nothing has been sent/);assert.equal(requests,0);assert.equal($('#sender-name').value,'Test Visitor');
});
test('configured contact requires explicit delivery confirmation and retains failed drafts',async()=>{
  personal.contactEndpoint='/test-contact';go('/contact');input('#sender-email','visitor@example.com');input('#letter-message','This is a locally tested preview letter.');input('#sender-name','Test Visitor');
  globalThis.fetch=async()=>({ok:false,json:async()=>({ok:false})});
  $('#contact-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,0));assert.match($('#contact-status').textContent,/couldn’t be sent/);assert.equal($('#sender-name').value,'Test Visitor');
  globalThis.fetch=async()=>({ok:true,json:async()=>({ok:true})});
  $('#contact-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,0));assert.match($('#contact-status').textContent,/was sent/);assert.equal($('#sender-name').value,'');personal.contactEndpoint=null;
});
test('each original demo responds to controls and can reset',()=>{
  go('/lab/elastic-type');input('#demo-word','Hello');input('#demo-range','120');assert.equal($('.type-art span').textContent,'Hello');assert.equal($('.type-art span').style.transform,'scaleX(1.2)');click('.reset-demo');assert.equal($('#demo-word').value,'Play');
  go('/lab/interference');input('#demo-range','30');assert.equal($('.demo-surface').style.getPropertyValue('--moire-angle'),'30deg');
  go('/lab/orbital-study');input('#demo-range','4');assert.equal($('#demo-value').value,'4s');click('.demo-play');assert.equal($('.demo-surface').classList.contains('is-paused'),true);
  go('/lab/paper-shift');input('#demo-range','90');assert.equal($('.demo-surface').style.getPropertyValue('--paper-spread'),'0.9');
});
test('empty Lab dataset produces the designed empty state',()=>{
  const original=experiments.splice(0);go('/lab');assert.ok($('.lab-empty'));assert.equal($('.mode-switch'),null);experiments.push(...original);go('/');
});
test('FPS updates from frame timing and has no hardcoded decorative value',()=>{
  const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(performance.now()+3000));assert.match($('#fps').textContent,/^FPS::\d+$/);assert.notEqual($('#fps').textContent,'FPS::60');
});
