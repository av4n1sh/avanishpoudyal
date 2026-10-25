// Personal content lives here. Replace these drafts whenever you are ready.
export const personal = {
  name: '*41',
  introduction: 'A small space for big curiosities.',
  description: 'An open-ended collection of thoughts, experiments, and things taking shape.',
  aboutTitle: 'Always a work in progress.',
  biography: [
    'This is my little corner of the internet. A place to follow an idea, try something unfamiliar, and see where it leads.',
    'I’m exploring how design, interaction, and motion can make digital spaces feel a little more human. This space will grow with what I learn and make.'
  ],
  interests: ['Typography', 'Everyday objects', 'Digital spaces'],
  exploring: ['Creative coding', 'Interaction design', 'Motion & rhythm'],
  portrait: null, // A local image URL, e.g. '/assets/portrait.webp'.
  portraitAlt: 'Portrait',
  email: '', // Your public email, used in the letterhead once supplied.
  // Optional JSON POST endpoint. Expected response: HTTP 2xx and { "ok": true }.
  // Keep mail-provider secrets on your server. Null keeps the form in preview mode.
  contactEndpoint: null,
};

export const concept = [
  { label: '01 / THE SPACE', title: 'A place for possibility.', body: '*41 is a personal space on the web. Part sketchbook, part playground, part collection of things that catch my attention. There’s room here for ideas before they have a finished shape.' },
  { label: '02 / THE REASON', title: 'Make room to make.', body: 'It exists as a reason to keep exploring. To turn curiosity into something tangible, and to learn by making small things, one experiment at a time.' },
  { label: '03 / THE PRACTICE', title: 'Follow the interesting part.', body: 'Design, interaction, and motion are the starting points. A letterform, an unexpected rhythm, the feel of an ordinary object. Small observations can open up new directions.' },
  { label: '04 / WHAT’S NEXT', title: 'Leave the edges open.', body: 'This website will change as I learn and create. Some things will stay, others will make way. It’s an evolving space, with no need to have everything figured out.' },
];

// These are original interactive DEMOS, not portfolio projects. Set [] for the empty state.
export const experiments = [
  { id: 'elastic-type', title: 'Elastic type', category: 'Typography', kind: 'type', description: 'A little tension changes a letter’s personality. Stretch the type and try a word of your own.', instruction: 'Type a word. Adjust the stretch.', number: '01' },
  { id: 'interference', title: 'Interference', category: 'Pattern', kind: 'moire', description: 'Two simple line fields meet. Rotate one and watch an intricate pattern appear between them.', instruction: 'Move the slider to rotate the second field.', number: '02' },
  { id: 'orbital-study', title: 'Orbital study', category: 'Motion', kind: 'orbit', description: 'A small study in rhythm and negative space. Set the pace, pause it, and find a composition you like.', instruction: 'Set the orbit speed or pause the motion.', number: '03' },
  { id: 'paper-shift', title: 'Paper shift', category: 'Interaction', kind: 'paper', description: 'A stack of quiet surfaces. Spread them apart to see how a little distance creates a sense of depth.', instruction: 'Move the slider to unfold the stack.', number: '04' },
];

export const pages = [
  { title: 'Home', path: '/', detail: 'The starting point', number: '00' },
  { title: 'About', path: '/about', detail: 'A personal file', number: '01' },
  { title: 'Lab', path: '/lab', detail: 'A little room to play', number: '02' },
  { title: 'Concept', path: '/concept', detail: 'The thinking behind it', number: '03' },
  { title: 'Contact', path: '/contact', detail: 'Leave a few words', number: '04' },
];
