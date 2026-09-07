// Self-contained dictionary for office errands, quips, gossip and cheers.

export type ErrandKind = 'water' | 'window' | 'dispenser' | 'fridge' | 'shelf' | 'bin' | 'smoke';

export const ERRAND_THOUGHTS: Record<ErrandKind, readonly string[]> = {
  water:     ['watering the plants 🌿', 'giving the plants a drink', 'they grow so fast'],
  window:    ['letting some air in 🍃', 'a bit of fresh air', 'nice breeze today'],
  dispenser: ['getting some water 💧', 'hydration break', 'staying sharp'],
  fridge:    ['anything good in the fridge?', 'who took my yogurt?', 'just looking…'],
  shelf:     ['checking out the shelf 📚', 'anything new in here?', 'so much good stuff'],
  bin:       ['out with the scrap paper 🗑️', 'desk cleanup day', 'tidying up a little'],
  smoke:     ['the floor runs itself 🚬', 'boss break.', 'thinking big thoughts 🚬', 'I DECLARE… a break']
};

export const SUCK_UP_KEYS: readonly string[] = [
  'already shipped {{done}} tasks, boss. raise? 🥺',
  '{{done}} tasks done this week, boss!',
  'great vision as always, boss!',
  'I was JUST about to do exactly that!',
  'love the tie today, Michael',
  'working hard, boss! 💪',
  'best boss ever. genuinely.'
];

export const GOSSIP_KEYS: readonly string[] = [
  'has he ever actually written code?',
  'another "quick sync" that took an hour…',
  '"world\'s best boss" — he bought that mug himself',
  'he pinned MY task as his idea',
  'the cigar smell, honestly…',
  'he watered the plant. ONE plant. his own.',
  'did you hear him? "I DECLARE… a break"'
];

export const CHEER_KEYS: readonly string[] = [
  'Boom! Task complete. 😎',
  'All done! Moving on to the next.',
  'Crushed it! 💪',
  'Done and dusted!',
  'Shipped! 🚀',
  'Easy peasy.',
  'Another win for the team!'
];

export function t(key: string, params?: Record<string, string | number>): string {
  if (key.startsWith('office.errand.')) {
    const parts = key.split('.');
    const kind = parts[2] as ErrandKind;
    const idx = parseInt(parts[3] || '0', 10);
    const list = ERRAND_THOUGHTS[kind];
    if (list && list[idx]) return list[idx];
  }
  if (key.startsWith('office.suckUp.')) {
    const idx = parseInt(key.split('.')[2] || '0', 10);
    let str = SUCK_UP_KEYS[idx] || SUCK_UP_KEYS[0];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{{${k}}}`, String(v));
      });
    }
    return str;
  }
  if (key.startsWith('office.gossip.')) {
    const idx = parseInt(key.split('.')[2] || '0', 10);
    return GOSSIP_KEYS[idx] || GOSSIP_KEYS[0];
  }
  if (key.startsWith('office.cheer.')) {
    const idx = parseInt(key.split('.')[2] || '0', 10);
    return CHEER_KEYS[idx] || CHEER_KEYS[0];
  }
  return key;
}
