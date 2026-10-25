export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function resolveRoute(path, experiments) {
  const clean = path.replace(/\/+$/, '') || '/';
  if (['/', '/about', '/lab', '/concept', '/contact'].includes(clean)) return { page: clean === '/' ? 'home' : clean.slice(1) };
  const experiment = experiments.find(e => clean === `/lab/${e.id}`);
  return experiment ? { page: 'experiment', experiment } : { page: 'not-found' };
}
export function searchItems(query, pages, experiments) {
  const entries = [
    ...pages.map(p => ({ ...p, group: 'Pages', hint: p.path })),
    ...experiments.map(e => ({ title: e.title, path: `/lab/${e.id}`, detail: e.category, group: 'Demo experiments', hint: 'DEMO' })),
    ...['Light', 'Dark', 'System'].map(theme => ({title: `${theme} theme`, action: theme.toLowerCase(), group: 'Appearance', hint: 'THEME'})),
  ];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(item => terms.every(term => `${item.title} ${item.detail || ''} ${item.group}`.toLowerCase().includes(term)));
}
export function validateContact(values) {
  const errors = {};
  if (!['hello', 'idea', 'collaboration'].includes(values.reason)) errors.reason = 'Choose a reason for your letter.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Add a valid email address so I can reply.';
  if (values.message.trim().length < 10) errors.message = 'Write at least 10 characters in your letter.';
  if (values.message.length > 5000) errors.message = 'Keep your letter under 5,000 characters.';
  if (!values.name.trim()) errors.name = 'Add your name to sign the letter.';
  return errors;
}
export function wheelPosition(index, selected) {
  const distance = index - selected;
  const angle = distance * 16;
  const radians = angle * Math.PI / 180;
  return { x: (1 - Math.cos(radians)) * 520, y: Math.sin(radians) * 520, angle, opacity: Math.max(.16, 1 - Math.abs(distance) * .24) };
}
