/**
 * All site copy lives here. Anything marked PLACEHOLDER is stand-in text
 * written to show the layout and should be replaced with the real thing.
 */

export const site = {
  /** Primary name shown in the hero wordmark and about. */
  name: 'Alex',
  /** Studio / credit alias. */
  alias: 'Bizzar',
  /** Site and product brand (mixedbyalex.com). */
  brand: 'mixedbyalex',
  role: 'Audio Engineer',
  city: 'Philadelphia, PA',
  timeZone: 'America/New_York',

  hero: {
    statement:
      'Philadelphia-based audio engineer. Selected work with Alex G, Eric Bellinger, OT7 Quanny, Bossman Dlow and Super Bowl LIX.',
  },

  /** Names that scroll across the band under the hero. */
  marquee: [
    'Alex G',
    'OT7 Quanny',
    'Bossman Dlow',
    'Super Bowl LIX',
    'Eric Bellinger',
    'Khemist Mayfield',
    'DJ Crazy',
    'Freeway',
    'Ritchie Mitch',
    'Evening Elephants',
  ],

  about: {
    /** Optional: import a photo and set it here to replace the speaker graphic. */
    portrait: null as string | null,
    lead: 'Alex, also known as Bizzar, is a recording, mixing and mastering engineer based in Philadelphia, working across albums, singles and live events.',
    // PLACEHOLDER
    body: [
      'Every session starts with the song. The job is to stay out of its way: capture the performance cleanly, keep the low end honest, and deliver something that holds up on earbuds, in a car and in an arena.',
      'This paragraph is placeholder copy. Replace it with the real story: where Alex came up, the rooms he works out of, and the artists and collaborators who shaped his sound.',
    ],
    facts: [
      { label: 'Based in', value: 'Philadelphia, PA' },
      { label: 'Also known as', value: 'Bizzar' },
      { label: 'Discipline', value: 'Recording, mixing, mastering' },
      // PLACEHOLDER
      { label: 'Booking', value: 'Open for new projects' },
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
      title: 'Eric Bellinger',
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
    // PLACEHOLDER
    email: 'booking@example.com',
    // PLACEHOLDER
    note: 'For bookings, rates and availability, send a few lines about the project and a rough timeline.',
    // PLACEHOLDER: swap in the real profile links
    socials: [
      { label: 'Instagram', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'Spotify', href: '#' },
    ],
  },
};
