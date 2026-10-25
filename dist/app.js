import { personal, concept, experiments, pages } from './content.js';
import { clamp, escapeHTML as esc, resolveRoute, searchItems, validateContact, wheelPosition } from './lib.js';
import { createMotionController } from './motion.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const main = $('#main');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const ambientMotion = createMotionController(reducedMotion);
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const arrow = '<span aria-hidden="true">↗</span>';
let pageController = new AbortController();
let mode = 'list';
let selected = 0;
let paletteItems = [];
let paletteIndex = 0;
let previousFocus;
let restoreSearchFocus = true;

function on(target, event, handler, options = {}) {
  target?.addEventListener(event, handler, { ...options, signal: pageController.signal });
}
function pageHeading(number, title, note = '') {
  return `<div class="page-heading"><span class="mono">${number} / ${title.toUpperCase()}</span>${note ? `<span class="mono heading-note">${note}</span>` : ''}</div>`;
}
function art(kind, small = false) {
  if (kind === 'type') return `<div class="type-art ${small ? 'small' : ''}"><span>Play</span></div>`;
  if (kind === 'moire') return '<div class="moire-art"><div></div><div></div></div>';
  if (kind === 'orbit') return '<div class="orbit-art"><i></i><i></i><i></i><b></b><span class="orbit-dot"></span></div>';
  return '<div class="paper-art"><i></i><i></i><i></i><i></i><i></i></div>';
}

function home() {
  return `<section class="home-page">
    ${pageHeading('00', 'An open-ended space', 'CURIOUS BY DESIGN')}
    <div class="home-stage">
      <div class="home-copy"><div class="eyebrow mono"><span class="tiny-star">✳</span> A LITTLE CORNER OF THE INTERNET</div><h1>${esc(personal.introduction)}</h1><p>${esc(personal.description)}</p><a class="text-link" href="/about">A little about me ${arrow}</a></div>
      <div class="identity-stage" aria-label="An original typographic composition for *41">
        <div class="registration reg-one" aria-hidden="true">+</div><div class="registration reg-two" aria-hidden="true">+</div>
        <div class="identity-object" data-tilt>
          <div class="dark-sheet" aria-hidden="true"><span class="mono">ROOM FOR<br>THE UNEXPECTED.</span><span class="sheet-star">✳</span><span class="mono bottom-annotation">THOUGHTS / FORMS / POSSIBILITIES</span></div>
          <a class="identity-paper paper" href="/concept" aria-label="Open the concept behind *41"><div class="paper-top mono"><span>A PERSONAL SPACE</span><span>EST. IN CURIOSITY</span></div><div class="hero-mark">*41</div><div class="paper-bottom"><span class="mono">IDEAS IN<br>AN OPEN FORM.</span><span class="paper-circle">↗</span></div></a>
          <div class="identity-seal mono" aria-hidden="true">ALWAYS<br>IN<br>PROGRESS</div>
        </div>
        <div class="stage-caption mono"><span>FIG. 01 — AN IDENTITY IN THE MAKING</span><span>↖ TAKE A CLOSER LOOK</span></div>
      </div>
    </div>
    <div class="home-directory">${pages.slice(1).map(p => `<a href="${p.path}"><span class="mono directory-number">${p.number}</span><div><span class="directory-title">${p.title}</span><span class="directory-detail">${p.detail}</span></div>${arrow}</a>`).join('')}</div>
  </section>`;
}

function about() {
  return `<section class="about-page">${pageHeading('01', 'About', 'A PERSONAL FILE')}
    <div class="about-stage">
      <div class="about-stack"><div class="about-underlay paper"><span class="mono">THERE’S ALWAYS MORE TO THE STORY.</span></div>
        <article class="personal-card">
          <div class="paperclip" aria-hidden="true"></div>
          <div class="card-top mono"><span>*41 / PERSONAL FILE</span><span>HANDLE WITH CURIOSITY</span></div>
          <div class="card-center"><div class="portrait-stamp">${personal.portrait ? `<img src="${esc(personal.portrait)}" alt="${esc(personal.portraitAlt)}">` : '<div class="portrait-placeholder"><span aria-hidden="true">✳</span><span class="mono">PORTRAIT<br>TO COME</span></div>'}<span class="stamp-caption mono">A FACE BEHIND THE SPACE</span></div><div class="card-intro"><div class="postmark mono" aria-hidden="true">*41<br>PERSONAL<br>EDITION</div><span class="mono">HELLO, I’M</span><h1>${esc(personal.name)}</h1><p>${esc(personal.aboutTitle)}</p></div></div>
          <div class="card-bottom"><span class="mono">A FEW NOTES ON ME</span><button class="about-toggle" aria-expanded="false" aria-controls="biography">Read about me <span aria-hidden="true">↗</span></button></div>
        </article>
      </div>
      <div class="about-caption mono">A PERSON, A FEW CURIOSITIES,<br>AND PLENTY LEFT TO DISCOVER.</div>
    </div>
    <div id="biography" class="biography" hidden><div class="bio-label mono">THE SHORT VERSION<br><span>EDITABLE INTRODUCTION</span></div><div class="bio-content">${personal.biography.map(p => `<p>${esc(p)}</p>`).join('')}<div class="bio-columns"><div><h2 class="mono">DRAWN TO</h2><ul>${personal.interests.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div><div><h2 class="mono">CURRENTLY EXPLORING</h2><ul>${personal.exploring.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div></div><a class="text-link" href="/contact">Say hello ${arrow}</a></div></div>
  </section>`;
}

function lab() {
  return `<section class="lab-page">${pageHeading('02', 'Lab', `${String(experiments.length).padStart(2, '0')} DEMO EXPERIMENTS`)}
    <div class="lab-intro"><h1>A little room to play.</h1><p>Small experiments in type, form, and motion.<br>Made for exploring. Always open to change.</p></div>
    <div id="lab-stage" class="lab-stage" role="region" aria-label="Demo experiments" tabindex="0"></div>
    ${experiments.length ? `<div class="lab-toolbar"><span class="mono lab-status">DEMO STUDIES / OPEN TO EXPLORATION</span><div class="mode-switch" role="group" aria-label="Lab layout">${['list','wheel','grid'].map(m => `<button data-mode="${m}" aria-pressed="${mode === m}" aria-controls="lab-stage"><span aria-hidden="true">${m === 'list' ? '☰' : m === 'wheel' ? '◌' : '⊞'}</span> ${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div><span class="mono lab-hint">${String(experiments.length).padStart(2,'0')} SMALL POSSIBILITIES ↗</span></div>` : ''}
  </section>`;
}

function renderLab() {
  const stage = $('#lab-stage');
  stage._wheelObserver?.disconnect();
  stage._wheelObserver = null;
  stage.scrollTop = 0;
  stage.style.setProperty('--experiment-count', experiments.length || 1);
  stage.setAttribute('aria-label', `Demo experiments — ${mode} layout`);
  if (!experiments.length) {
    stage.className = 'lab-stage mode-empty';
    stage.innerHTML = '<div class="lab-empty"><span aria-hidden="true">✳</span><h2>Room for what comes next.</h2><p>No experiments here yet. A little empty space is a good place to begin.</p><a class="text-link" href="/concept">Read the concept ↗</a></div>';
    return;
  }
  selected = clamp(selected, 0, experiments.length - 1);
  stage.className = `lab-stage mode-${mode}`;
  if (mode === 'list') stage.innerHTML = `<div class="experiment-list">${experiments.map((e,i) => `<a class="experiment-row ${i === selected ? 'selected' : ''}" href="/lab/${e.id}" data-index="${i}"><span class="mono experiment-number">${e.number}</span><span class="experiment-title">${esc(e.title)}</span><span class="experiment-category mono">${esc(e.category)}<br><span>DEMO EXPLORATION</span></span><span class="experiment-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`;
  if (mode === 'grid') stage.innerHTML = `<div class="experiment-grid">${experiments.map((e,i) => `<a class="experiment-tile" href="/lab/${e.id}" data-index="${i}"><div class="tile-art tile-${e.kind}">${art(e.kind,true)}<span class="tile-label mono">${e.number} / DEMO</span><span class="tile-open" aria-hidden="true">↗</span></div><div class="tile-caption"><h2>${esc(e.title)}</h2><span class="mono">${esc(e.category)}</span></div></a>`).join('')}</div>`;
  if (mode === 'wheel') {
    stage.innerHTML = `<div class="wheel-zone" tabindex="0" role="listbox" aria-label="Experiment wheel" aria-describedby="wheel-help" aria-activedescendant="wheel-item-${selected}"><div class="wheel-guide" aria-hidden="true"></div>${experiments.map((e,i) => `<div class="wheel-item" id="wheel-item-${i}" role="option" aria-selected="${selected === i}" data-index="${i}"><span class="mono wheel-number">${e.number}</span><span>${esc(e.title)}</span></div>`).join('')}<span class="wheel-tick" aria-hidden="true">—</span></div><div class="wheel-details"><div class="wheel-selection"><span class="mono" id="wheel-category"></span><a class="text-link" id="wheel-open" href="/lab/${experiments[selected].id}">Open experiment ${arrow}</a></div><div class="wheel-buttons"><button data-wheel-step="-1" aria-label="Previous experiment">↑</button><button data-wheel-step="1" aria-label="Next experiment">↓</button></div><p id="wheel-help" class="mono">DRAG OR SCROLL TO EXPLORE<br>↑ ↓ TO SELECT · ENTER TO OPEN</p></div>`;
    updateWheel();
    bindWheel();
  }
  $$('.mode-switch button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  $$('.experiment-row', stage).forEach(row => {
    const activate = () => { selected = Number(row.dataset.index); $$('.experiment-row',stage).forEach(r => r.classList.toggle('selected',r === row)); };
    on(row,'pointerenter',activate); on(row,'focus',() => { activate(); row.scrollIntoView({block:'nearest',inline:'nearest'}); });
  });
  $$('.experiment-tile',stage).forEach(tile => {
    on(tile,'click',() => { selected = Number(tile.dataset.index); });
    on(tile,'focus',() => { selected = Number(tile.dataset.index); tile.scrollIntoView({block:'nearest',inline:'nearest'}); });
  });
}

function updateWheel() {
  const zone = $('.wheel-zone');
  const scale = clamp(((zone?.clientHeight || 430) - 40) / 390, .34, 1);
  $$('.wheel-item').forEach((item,i) => {
    const p = wheelPosition(i, selected);
    item.style.setProperty('--wheel-x',`${p.x*scale}px`); item.style.setProperty('--wheel-y',`${p.y*scale}px`); item.style.setProperty('--wheel-angle',`${p.angle}deg`); item.style.setProperty('--wheel-opacity',p.opacity);
    item.classList.toggle('selected',i === selected); item.setAttribute('aria-selected',i === selected);
  });
  $('.wheel-zone')?.setAttribute('aria-activedescendant',`wheel-item-${selected}`);
  const experiment = experiments[selected];
  $('#wheel-category').textContent = `${experiment.number} / ${experiment.category.toUpperCase()} / DEMO`;
  $('#wheel-open').href = `/lab/${experiment.id}`;
  $('#wheel-open').setAttribute('aria-label', `Open ${experiment.title} experiment`);
  $$('[data-wheel-step]').forEach(b => { b.disabled = Number(b.dataset.wheelStep) < 0 ? selected === 0 : selected === experiments.length - 1; });
}

function bindWheel() {
  const zone = $('.wheel-zone');
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => { if(zone.isConnected) updateWheel(); });
    observer.observe(zone);
    $('#lab-stage')._wheelObserver = observer;
    pageController.signal.addEventListener('abort', () => observer.disconnect(), {once:true});
  }
  let drag = null, dragged = false, wheelTotal = 0, lastWheel = 0;
  const change = value => { selected = clamp(value,0,experiments.length-1); updateWheel(); };
  on(zone,'keydown',event => {
    if (['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End','Enter'].includes(event.key)) event.preventDefault();
    if (['ArrowDown','ArrowRight'].includes(event.key)) change(selected+1);
    if (['ArrowUp','ArrowLeft'].includes(event.key)) change(selected-1);
    if (event.key === 'Home') change(0);
    if (event.key === 'End') change(experiments.length-1);
    if (event.key === 'Enter') navigate(`/lab/${experiments[selected].id}`);
  });
  on(zone,'wheel',event => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const direction = Math.sign(event.deltaY);
    if ((selected === 0 && direction < 0) || (selected === experiments.length-1 && direction > 0)) return;
    event.preventDefault();
    const now = performance.now(); if(now-lastWheel>180) wheelTotal=0;
    wheelTotal += event.deltaY;
    if(Math.abs(wheelTotal)>45 && now-lastWheel>230){ change(selected+direction); wheelTotal=0; lastWheel=now; }
  },{passive:false});
  on(zone,'pointerdown',event => { if(event.button !== 0) return; drag={start:event.clientY,initial:selected,id:event.pointerId}; dragged=false; zone.setPointerCapture(event.pointerId); zone.focus({preventScroll:true}); zone.classList.add('dragging'); });
  on(zone,'pointermove',event => { if(!drag) return; const delta=drag.start-event.clientY; if(Math.abs(delta)>8) dragged=true; if(dragged) change(drag.initial+Math.round(delta/95)); });
  const stopDrag = event => {
    if(!drag) return;
    if(!dragged && event.type === 'pointerup') {
      const hit = document.elementFromPoint(event.clientX,event.clientY)?.closest('.wheel-item');
      if(hit) change(Number(hit.dataset.index));
    }
    if(zone.hasPointerCapture(drag.id)) zone.releasePointerCapture(drag.id);
    drag=null; zone.classList.remove('dragging');
  };
  on(zone,'pointerup',stopDrag); on(zone,'pointercancel',stopDrag);
  $$('[data-wheel-step]').forEach(button => on(button,'click',() => change(selected+Number(button.dataset.wheelStep))));
}

function conceptPage() {
  return `<section class="concept-page">${pageHeading('03','Concept','A NOTE ON THIS SPACE')}
    <div class="folder-stage"><div class="folder-stack"><div class="folder-sheet sheet-back paper"></div><div class="folder-sheet sheet-front paper"><span class="mono">AN OPEN-ENDED IDEA.</span></div><button class="concept-folder paper" aria-expanded="false" aria-controls="concept-reading"><span class="folder-tab mono">*41 / NOTES</span><span class="folder-top mono"><span>PERSONAL EDITION</span><span>ONE OPEN QUESTION</span></span><span class="folder-number">01</span><span class="folder-title">Inside *41.</span><span class="folder-description">A few thoughts on what this space can be.</span><span class="folder-bottom"><span class="mono">THE CONCEPT<br>ALWAYS IN DEVELOPMENT</span><span class="folder-open">Open the folder <span aria-hidden="true">↗</span></span></span></button></div><span class="folder-caption mono">NOT A FINISHED THING. A PLACE TO BEGIN.</span></div>
    <article id="concept-reading" class="concept-reading paper" hidden><div class="reading-head"><span class="mono">*41 / THE CONCEPT</span><button class="close-folder mono">CLOSE FOLDER <span aria-hidden="true">↗</span></button></div><h1 tabindex="-1">A space to<br>keep becoming.</h1>${concept.map(section => `<section><span class="mono">${esc(section.label)}</span><div><h2>${esc(section.title)}</h2><p>${esc(section.body)}</p></div></section>`).join('')}<div class="reading-foot"><span class="mono">THE NEXT PAGE IS STILL OPEN.</span><a href="/lab">Take a look around ${arrow}</a></div></article>
  </section>`;
}

function contact() {
  const date = new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date()).toUpperCase();
  const preview = !personal.contactEndpoint;
  return `<section class="contact-page">${pageHeading('04','Contact','A LITTLE CORRESPONDENCE')}
    <div class="letter-stage"><article class="letter paper"><header class="letterhead"><div class="letter-identity"><span class="letter-logo">*41</span><div><span>A personal space.</span><span class="mono">${personal.email ? `<a href="mailto:${esc(personal.email)}">${esc(personal.email)}</a>` : 'A FEW WORDS GO A LONG WAY.'}</span></div></div><time class="mono" datetime="${new Date().toLocaleDateString('en-CA')}">${date}</time></header>
    <h1>Let’s start a conversation.</h1><p class="letter-greeting">Dear *41,</p>
    <form id="contact-form" novalidate><fieldset class="reason-field"><legend class="mono">REASON FOR WRITING</legend><div class="reason-options"><label><input type="radio" name="reason" value="hello" checked><span>Just a hello</span></label><label><input type="radio" name="reason" value="idea"><span>An idea</span></label><label><input type="radio" name="reason" value="collaboration"><span>A collaboration</span></label></div><span class="field-error" id="error-reason"></span></fieldset>
    <div class="letter-from"><label class="mono" for="sender-email">FROM</label><input id="sender-email" type="email" name="email" placeholder="your@email.com" autocomplete="email" required maxlength="254" aria-describedby="error-email"><span class="field-error" id="error-email"></span></div>
    <div class="message-field"><label class="mono" for="letter-message">YOUR LETTER</label><textarea id="letter-message" name="message" placeholder="I’ve been thinking…" rows="4" minlength="10" maxlength="5000" required aria-describedby="error-message"></textarea><span class="field-error" id="error-message"></span></div>
    <div class="letter-signoff"><label for="sender-name">Warmly,</label><input id="sender-name" name="name" placeholder="Your name" autocomplete="name" required maxlength="100" aria-describedby="error-name"><span class="field-error" id="error-name"></span><span class="mono signature-note">YOUR NAME IS YOUR SIGNATURE.</span></div>
    <div class="letter-send"><p class="mono">${preview ? 'FORM PREVIEW<br>DELIVERY IS NOT CONNECTED.' : 'A DIRECT NOTE.<br>THANK YOU FOR REACHING OUT.'}</p><button type="submit" class="send-button">${preview ? 'Preview letter' : 'Send letter'} ${arrow}</button></div><div id="contact-status" role="status" tabindex="-1"></div>
    </form></article><aside class="letter-receipt paper"><span class="mono">*41<br>CORRESPONDENCE</span><span class="receipt-star" aria-hidden="true">✳</span><div class="mono"><span>DELIVERY</span><strong>${preview ? 'NOT CONNECTED' : 'DIRECT MESSAGE'}</strong></div><div class="mono"><span>A SMALL NOTE</span><p>Good conversations<br>start somewhere.</p></div><span class="receipt-bottom mono">${preview ? 'PREVIEW ONLY' : 'WORDS WELCOME'}</span></aside></div>
  </section>`;
}

function experimentPage(experiment) {
  let controls='';
  if(experiment.kind==='type') controls='<label class="demo-word-label mono" for="demo-word">YOUR WORD<input id="demo-word" value="Play" maxlength="12" autocomplete="off"></label><label class="demo-range-label mono" for="demo-range">STRETCH <output id="demo-value">100%</output><input id="demo-range" type="range" min="60" max="150" value="100"></label>';
  if(experiment.kind==='moire') controls='<label class="demo-range-label mono" for="demo-range">ROTATION <output id="demo-value">12°</output><input id="demo-range" type="range" min="0" max="90" value="12"></label>';
  if(experiment.kind==='orbit') controls=`<label class="demo-range-label mono" for="demo-range">ORBIT DURATION <output id="demo-value">8s</output><input id="demo-range" type="range" min="2" max="20" value="8"></label><button class="demo-play" aria-pressed="${!reducedMotion.matches}">${reducedMotion.matches ? 'Play motion' : 'Pause motion'}</button>`;
  if(experiment.kind==='paper') controls='<label class="demo-range-label mono" for="demo-range">SPREAD <output id="demo-value">45%</output><input id="demo-range" type="range" min="0" max="100" value="45"></label>';
  return `<section class="demo-page">${pageHeading('02','Lab / '+experiment.number,'INTERACTIVE DEMO')}<a class="back-link mono" href="/lab">← ALL EXPERIMENTS</a><div class="demo-header"><h1>${esc(experiment.title)}</h1><p>${esc(experiment.description)}</p></div><div class="demo-surface demo-${experiment.kind}">${art(experiment.kind)}<span class="demo-surface-label mono">*41 / ${esc(experiment.category.toUpperCase())}</span></div><div class="demo-controls">${controls}<button class="reset-demo mono">RESET ↺</button></div><p class="demo-instruction mono">${esc(experiment.instruction)} <span>EXPLORATORY DEMO, NOT A PORTFOLIO PROJECT.</span></p></section>`;
}

function render() {
  pageController.abort(); pageController = new AbortController();
  const route = resolveRoute(location.pathname,experiments);
  const previousPage = document.body.dataset.page;
  main.dataset.transition = route.page === 'experiment' ? 'scale' : previousPage === 'experiment' && route.page === 'lab' ? 'slide' : 'fade';
  document.body.dataset.page = route.page;
  ambientMotion.setScene(route.page);
  main.innerHTML = route.page === 'home' ? home() : route.page === 'about' ? about() : route.page === 'lab' ? lab() : route.page === 'concept' ? conceptPage() : route.page === 'contact' ? contact() : route.page === 'experiment' ? experimentPage(route.experiment) : `<section class="not-found"><span class="mono">404 / OUTSIDE THE MARGINS</span><h1>A little off the page.</h1><p>This corner doesn’t exist yet.</p><a class="text-link" href="/">Back to the beginning ↗</a></section>`;
  main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
  document.title = `${route.experiment?.title || ({home:'A personal space',about:'About',lab:'Lab',concept:'The concept',contact:'Contact','not-found':'Page not found'}[route.page])} — *41`;
  $$('.main-nav a').forEach(a => { if(location.pathname === a.pathname || (a.pathname === '/lab' && route.page === 'experiment')) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  if(route.page === 'lab') {
    renderLab();
    $$('[data-mode]').forEach(button => on(button,'click',() => {mode=button.dataset.mode;renderLab();}));
  }
  if(route.page === 'about') on($('.about-toggle'),'click',event => {
    const button=event.currentTarget, open=button.getAttribute('aria-expanded')==='true';
    button.setAttribute('aria-expanded',String(!open)); button.innerHTML=`${open ? 'Read about me' : 'Close the notes'} <span aria-hidden="true">${open ? '↗' : '−'}</span>`;
    $('#biography').hidden=open;
    if(!open) $('#biography').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
  });
  if(route.page === 'concept') {
    const folder = $('.concept-folder'), reading = $('#concept-reading'), stage = $('.folder-stage');
    on(folder,'click',() => { folder.setAttribute('aria-expanded','true');stage.hidden=true;reading.hidden=false; $('h1',reading).focus({preventScroll:true}); window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'}); });
    on($('.close-folder'),'click',() => {reading.hidden=true;stage.hidden=false;folder.setAttribute('aria-expanded','false');folder.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});
  }
  if(route.page === 'contact') bindContact();
  if(route.page === 'experiment') bindDemo(route.experiment);
  const tilt = $('[data-tilt]');
  if(tilt) {
    on(tilt,'pointermove',event => { if(!ambientMotion.enabled() || event.pointerType !== 'mouse') return; const rect=tilt.getBoundingClientRect();tilt.style.transform=`perspective(900px) rotateY(${(event.clientX-rect.left-rect.width/2)/120}deg) rotateX(${-(event.clientY-rect.top-rect.height/2)/120}deg)`; });
    on(tilt,'pointerleave',() => tilt.style.transform='');
  }
}

function bindDemo(experiment) {
  const surface=$('.demo-surface'), range=$('#demo-range'), output=$('#demo-value');
  const update=() => {
    const value=Number(range.value);
    if(experiment.kind==='type') { $('.type-art span',surface).style.transform=`scaleX(${value/100})`;output.value=`${value}%`; }
    if(experiment.kind==='moire') { surface.style.setProperty('--moire-angle',`${value}deg`);output.value=`${value}°`; }
    if(experiment.kind==='orbit') { surface.style.setProperty('--orbit-duration',`${value}s`);output.value=`${value}s`; }
    if(experiment.kind==='paper') { surface.style.setProperty('--paper-spread',value/100);output.value=`${value}%`; }
  };
  on(range,'input',update); update();
  if(experiment.kind==='type') on($('#demo-word'),'input',event => { const value=event.target.value || ' ';$('.type-art span',surface).textContent=value;surface.style.setProperty('--type-size',`${clamp(460/Math.max(value.length,1),42,150)}px`); });
  if(experiment.kind==='orbit') {
    const button=$('.demo-play');
    surface.classList.toggle('is-paused',reducedMotion.matches);
    on(button,'click',() => { const paused=surface.classList.toggle('is-paused');surface.classList.toggle('user-playing',!paused);button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(!paused)); });
    on(reducedMotion,'change',event => { if(event.matches){surface.classList.add('is-paused');surface.classList.remove('user-playing');button.textContent='Play motion';button.setAttribute('aria-pressed','false');} });
  }
  on($('.reset-demo'),'click',() => { const route=location.pathname;render();history.replaceState(null,'',route);$('.reset-demo').focus({preventScroll:true}); });
}

function bindContact() {
  const form=$('#contact-form'), status=$('#contact-status');
  on(form,'submit',async event => {
    event.preventDefault(); status.textContent='';
    const values=Object.fromEntries(new FormData(form));
    const errors=validateContact(values);
    for(const key of ['reason','email','message','name']) {
      const field=form.elements.namedItem(key);const error=$(`#error-${key}`);
      error.textContent=errors[key] || '';
      if(field instanceof HTMLElement) field.setAttribute('aria-invalid',String(!!errors[key]));
    }
    if(Object.keys(errors).length) { const field=form.elements.namedItem(Object.keys(errors)[0]); (field instanceof HTMLElement ? field : field[0]).focus();return; }
    if(!personal.contactEndpoint) {status.innerHTML='<strong>Your letter is ready to preview.</strong><p>Nothing has been sent. Delivery isn’t connected yet; your words remain in this form.</p>';status.className='contact-feedback';status.focus({preventScroll:true});return;}
    const button=$('.send-button',form);button.disabled=true;button.textContent='Sending…';
    const timeout=new AbortController();const timer=setTimeout(()=>timeout.abort(),15000);
    try {
      const response=await fetch(personal.contactEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values),signal:timeout.signal});
      const result=await response.json();
      if(!response.ok || result.ok !== true) throw new Error('Delivery was not confirmed.');
      status.innerHTML='<strong>Your letter was sent.</strong><p>Thank you for reaching out.</p>';form.reset();
    } catch {status.innerHTML='<strong>The letter couldn’t be sent.</strong><p>Your words are still here. Please try again later.</p>';}
    finally {clearTimeout(timer);button.disabled=false;button.innerHTML=`Send letter ${arrow}`;status.className='contact-feedback';status.focus({preventScroll:true});}
  });
}

function navigate(path) {
  if($('#search-dialog').open) closeSearch(false);
  if(location.pathname !== path) history.pushState(null,'',path);
  render();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
}
document.addEventListener('click',event => {
  const link=event.target.closest('a[href]');
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url=new URL(link.href,location.origin);
  if(url.origin!==location.origin || url.hash || !['http:','https:'].includes(url.protocol)) return;
  event.preventDefault();navigate(url.pathname);
});
window.addEventListener('popstate',() => {if($('#search-dialog').open) closeSearch();render();window.scrollTo(0,0);main.focus({preventScroll:true});});

function setTheme(choice, save = true) {
  const effective=choice==='system'?(systemTheme.matches?'dark':'light'):choice;
  document.documentElement.dataset.theme=effective;document.documentElement.dataset.themeChoice=choice;
  $('meta[name="theme-color"]').content=effective==='dark'?'#151c24':'#e7eef3';
  if(save) try {localStorage.setItem('star41-theme',choice);}catch{}
  $$('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===choice)));
}
$$('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.themeChoice)));
systemTheme.addEventListener('change',()=>{if(document.documentElement.dataset.themeChoice==='system')setTheme('system',false);});
setTheme(document.documentElement.dataset.themeChoice || 'system',false);

const dialog=$('#search-dialog'), searchInput=$('#search-input');
function openSearch() {
  if(dialog.open)return;
  previousFocus=document.activeElement;restoreSearchFocus=true;dialog.showModal();document.body.classList.add('modal-open');searchInput.value='';paletteIndex=0;renderSearch();searchInput.focus();
}
function closeSearch(restore = true) {restoreSearchFocus=restore;dialog.close();}
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(restoreSearchFocus && previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeSearch();}});
$('.search-trigger').addEventListener('click',openSearch);$('.close-search').addEventListener('click',()=>closeSearch());
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();dialog.open?closeSearch():openSearch();}});
function renderSearch() {
  paletteItems=searchItems(searchInput.value,pages,experiments);paletteIndex=clamp(paletteIndex,0,Math.max(0,paletteItems.length-1));
  let lastGroup='';
  $('#search-results').innerHTML=paletteItems.length?paletteItems.map((item,i)=>{const heading=item.group!==lastGroup?`<div class="search-group mono" role="presentation">${item.group}</div>`:'';lastGroup=item.group;return `${heading}<div role="option" id="search-option-${i}" aria-selected="${i===paletteIndex}" data-result="${i}" class="search-result"><span>${esc(item.title)}</span><span class="mono">${esc(item.hint)}</span></div>`;}).join(''):'<div class="search-empty"><span aria-hidden="true">⌕</span><p>No matches in this space.</p><span>Try “Lab”, “type”, or “theme”.</span></div>';
  updateSearchSelection();$('#search-announcement').textContent=`${paletteItems.length} results`;
}
function updateSearchSelection() {
  $$('.search-result').forEach((item,i)=>item.setAttribute('aria-selected',String(i===paletteIndex)));
  if(paletteItems.length)searchInput.setAttribute('aria-activedescendant',`search-option-${paletteIndex}`);else searchInput.removeAttribute('aria-activedescendant');
}
function selectSearch() { const item=paletteItems[paletteIndex];if(!item)return;if(item.action){closeSearch();setTheme(item.action);}else{closeSearch(false);navigate(item.path);} }
searchInput.addEventListener('input',()=>{paletteIndex=0;renderSearch();});
searchInput.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!paletteItems.length)return;paletteIndex=(paletteIndex+(event.key==='ArrowDown'?1:-1)+paletteItems.length)%paletteItems.length;updateSearchSelection();$(`#search-option-${paletteIndex}`).scrollIntoView({block:'nearest'});}
  if(event.key==='Enter'){event.preventDefault();selectSearch();}
});
$('#search-results').addEventListener('click',event=>{const result=event.target.closest('[data-result]');if(result){paletteIndex=Number(result.dataset.result);selectSearch();}});
$('#search-results').addEventListener('pointermove',event=>{const result=event.target.closest('[data-result]');if(result){paletteIndex=Number(result.dataset.result);updateSearchSelection();}});

function runIntro() {
  if(!document.documentElement.classList.contains('intro-active'))return;
  const counter=$('.intro-counter'), start=performance.now(), duration=reducedMotion.matches?80:1150;
  const tick=now=>{const progress=clamp((now-start)/duration,0,1);counter.textContent=String(Math.floor(progress*100));if(progress<1)requestAnimationFrame(tick);else {try{sessionStorage.setItem('star41-intro','seen');}catch{}setTimeout(()=>document.documentElement.classList.remove('intro-active'),reducedMotion.matches?0:120);}};
  requestAnimationFrame(tick);
}
function startFPS() {
  let start=performance.now(), frames=0, handle;
  const tick=now=>{frames++;const elapsed=now-start;if(elapsed>=1200){$('#fps').textContent=`FPS::${Math.round(frames*1000/elapsed)}`;start=now;frames=0;}handle=requestAnimationFrame(tick);};
  handle=requestAnimationFrame(tick);
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(handle);frames=0;start=performance.now();if(!document.hidden)handle=requestAnimationFrame(tick);else $('#fps').textContent='FPS::—';});
}
render();runIntro();startFPS();
