// Decorative objects never receive input; only their shared transform follows the pointer.
const shapes = {
  identity: '<rect x="28" y="31" width="164" height="154" rx="27"/><text x="110" y="137" text-anchor="middle">*41</text>',
  portrait: '<rect x="39" y="22" width="142" height="177" rx="25"/><circle cx="110" cy="88" r="26"/><path d="M62 159c0-47 96-47 96 0M77 181h66"/>',
  orbit: '<circle cx="110" cy="110" r="83"/><ellipse cx="110" cy="110" rx="83" ry="38" transform="rotate(-35 110 110)"/><ellipse cx="110" cy="110" rx="38" ry="83" transform="rotate(-35 110 110)"/><circle cx="156" cy="43" r="12"/>',
  folder: '<path d="M24 70V43q0-12 12-12h57l20 22h71q12 0 12 12v116q0 12-12 12H36q-12 0-12-12Z"/><path d="M25 78h170"/><text x="109" y="156" text-anchor="middle">01</text>',
  envelope: '<rect x="18" y="50" width="184" height="126" rx="22"/><path d="m25 61 85 66 85-66M24 163l58-51m114 51-58-51"/>',
  sheet: '<rect x="47" y="25" width="133" height="174" rx="20"/><path d="M72 68h80M72 94h80M72 120h57M72 162h80"/>',
  type: '<rect x="27" y="33" width="166" height="154" rx="30"/><text x="110" y="139" text-anchor="middle">Aa</text>',
  clip: '<path d="m92 153 53-76c25-36-17-68-42-32L49 122c-36 53 24 96 60 44l53-75M93 155l48-70c10-15-7-27-17-12l-44 63"/>',
};
const scenes = {home:['identity','orbit','sheet'],about:['portrait','clip','sheet'],lab:['orbit','type','sheet'],experiment:['orbit','type','sheet'],concept:['folder','sheet','identity'],contact:['envelope','clip','sheet']};

export function createMotionController(reducedMotion) {
  const scene = document.querySelector('#ambient-scene');
  const toggle = document.querySelector('#motion-toggle');
  const finePointer = matchMedia('(pointer: fine)');
  let preference = 'on', frame = 0, currentPage = '';
  let pointer = {x:0,y:0};
  try { preference = localStorage.getItem('star41-motion') === 'off' ? 'off' : 'on'; } catch {}
  const enabled = () => preference === 'on' && !reducedMotion.matches;
  function resetPointer() {
    if(frame) cancelAnimationFrame(frame);
    frame = 0;
    scene?.style.setProperty('--pointer-x','0px');
    scene?.style.setProperty('--pointer-y','0px');
  }
  function sync() {
    const active = enabled();
    document.documentElement.dataset.motion = reducedMotion.matches ? 'reduced' : preference;
    if(toggle) {
      toggle.setAttribute('aria-pressed',String(active));
      toggle.setAttribute('aria-label',reducedMotion.matches ? 'Background motion reduced by system preference' : active ? 'Pause background motion' : 'Resume background motion');
      toggle.title = toggle.getAttribute('aria-label');
      toggle.disabled = reducedMotion.matches;
      toggle.querySelector('span').textContent = reducedMotion.matches ? 'Motion reduced' : active ? 'Motion on' : 'Motion off';
    }
    if(!active) resetPointer();
  }
  toggle?.addEventListener('click',() => {
    preference = preference === 'on' ? 'off' : 'on';
    try { localStorage.setItem('star41-motion',preference); } catch {}
    sync();
  });
  reducedMotion.addEventListener('change',sync);
  document.addEventListener('pointermove',event => {
    if(!scene || !enabled() || !finePointer.matches || event.pointerType !== 'mouse' || document.hidden) return;
    pointer = {x:(event.clientX / Math.max(window.innerWidth,1) - .5)*26,y:(event.clientY / Math.max(window.innerHeight,1) - .5)*18};
    if(frame) return;
    frame = requestAnimationFrame(() => {
      scene.style.setProperty('--pointer-x',`${pointer.x.toFixed(2)}px`);
      scene.style.setProperty('--pointer-y',`${pointer.y.toFixed(2)}px`);
      frame = 0;
    });
  },{passive:true});
  document.addEventListener('pointerleave',resetPointer);
  document.addEventListener('visibilitychange',() => {
    scene?.classList.toggle('is-suspended',document.hidden);
    if(document.hidden) resetPointer();
  });
  sync();
  return {
    enabled,
    setScene(page) {
      if(!scene || page === currentPage) return;
      currentPage = page;
      const objects = scenes[page] || scenes.home;
      scene.dataset.scene = page;
      scene.innerHTML = objects.map((shape,index) => `<div class="ambient-object ambient-object-${index+1}" data-object="${shape}"><div class="ambient-float"><svg viewBox="0 0 220 220" focusable="false" aria-hidden="true">${shapes[shape]}</svg></div></div>`).join('');
    },
  };
}
