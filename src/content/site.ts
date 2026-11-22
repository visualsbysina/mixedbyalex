/**
 * All site copy lives here. Anything marked PLACEHOLDER is stand-in text
 * written to show the layout and should be replaced with the real thing.
 */

import portrait from '../assets/portrait.jpg';

export const site = {
  /** Primary name shown in the hero wordmark. */
  name: 'Alex',
  /** Full name used in the about section. */
  fullName: 'Alexander Cosenza',
  /** Site and product brand (mixedbyalex.com). */
  brand: 'mixedbyalex',
  role: 'Audio Engineer',
  city: 'Philadelphia, PA',
  timeZone: 'America/New_York',

  hero: {
    statement:
      'Philadelphia-based audio engineer. Selected work with Alex G, Eric Bellinger, OT7 Quanny, Bossman Dlow and Super Bowl LIX.',
  },

  /** Names that scroll across the band under the nav. */
  marquee: [
    'Alex G',
    'OT7 Quanny',
    'Bossman Dlow',
    'Super Bowl LIX',
    'Eric Bellinger',
    'Patti LaBelle',
    'The Delfonics',
    'Skrilla',
    'Khemist Mayfield',
    'Sean Kingston',
    'Freeway',
    'Ritchie Mitch',
    'Evening Elephants',
  ],

  about: {
    portrait,
    lead:
      'Alexander Cosenza is a Philadelphia-based audio engineer, producer, and artist.',
    body: [
      'After beginning his career producing electronic music in 2011, his work earned support from Major Lazer, Dillon Francis, Skrillex, Diplo, and others before he transitioned into audio engineering.',
      'Now an engineer at MilkBoy The Studio, Alexander has worked with Patti LaBelle, The Delfonics, OT7 Quanny, Skrilla, and projects associated with the Super Bowl. He specializes in recording, mixing, and producing across rap, R&B, rock, pop, and electronic music, and is also one half of the dark electronic duo Hallowthirtyone.',
    ],
    facts: [
      { label: 'Based in', value: 'Philadelphia, PA' },
      { label: 'Studio', value: 'MilkBoy The Studio' },
      { label: 'Discipline', value: 'Recording, mixing, producing' },
      {
        label: 'Also',
        value: 'Hallowthirtyone',
        href: 'https://music.apple.com/us/album/the-sound-of-silence/1827410447',
      },
    ],
  },

  // PLACEHOLDER: the descriptions (the three services come from the credits)
  services: [
    {
      name: 'Recording',
      description:
        'Tracking sessions run with care for the performance first: the right chain, the right take, files delivered clean and labeled.',
    },
    {
      name: 'Mixing',
      description:
        'Mixes built around the vocal and the low end, with revisions until the record feels the way it should.',
    },
    {
      name: 'Mastering',
      description:
        'Final polish and loudness for streaming, video and vinyl, checked across every kind of playback system.',
    },
  ],

  /**
   * The credits list, in display order. Rows with a `workId` open that
   * project in the player.
   */
  credits: [
    {
      artist: 'Alex G',
      title: 'Headlights (Far & Wide)',
      roles: ['Assistant Recording Engineer'],
      workId: 'headlights',
    },
    {
      artist: 'OT7 Quanny & Bossman Dlow',
      title: 'Bout My Money',
      roles: ['Recording Engineer', 'Mixing Engineer'],
      workId: 'bout-my-money',
    },
    {
      artist: 'NFL Super Bowl LIX',
      title: 'Harry Connick Jr. Pre-Game Performance',
      roles: ['Recording Engineer'],
      workId: 'super-bowl-lix',
    },
    {
      artist: 'Eric Bellinger',
      title: 'Eric Bellinger (Fatherhood)',
      roles: ['Recording Engineer'],
      workId: 'eric-bellinger',
    },
    { artist: 'Warner Chappell', title: 'Roots Picnic Writing Camp 2026', roles: [] },
    { artist: 'Khemist Mayfield', title: 'A List of Demands', roles: ['Recording Engineer'] },
    {
      artist: 'DJ Crazy',
      title: 'Eagles Bounce feat. Freeway, Tizz 215, & D.Sturdy',
      roles: ['Recording Engineer'],
    },
    {
      artist: 'Ritchie Mitch',
      title: 'Scarlett',
      roles: ['Recording Engineer', 'Mixing Engineer', 'Mastering Engineer'],
    },
    { artist: 'Evening Elephants', title: 'Carefree, very', roles: ['Recording Engineer'] },
  ] as { artist: string; title: string; roles: string[]; workId?: string }[],

  contact: {
    heading: 'Got a record to make?',
    email: 'alex@mixedbyalex.com',
    note: 'For bookings, rates and availability, send a few lines about the project and a rough timeline.',
    // PLACEHOLDER: swap in the real profile links
    socials: [
      { label: 'Instagram', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'Spotify', href: '#' },
    ],
  },
};
