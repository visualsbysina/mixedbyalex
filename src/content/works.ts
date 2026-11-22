import boutMyMoney from '../assets/covers/bout-my-money.jpg';
import ericBellinger from '../assets/covers/eric-bellinger.jpg';
import headlights from '../assets/covers/headlights.jpg';
import superBowl from '../assets/covers/super-bowl-lix.png';
import generated from './tracks.generated.json';

export type Track = {
  number: number;
  title: string;
  /** Length of the full release version. */
  durationMs: number;
  /** Audio the on-site player streams. Currently Apple's 30-second preview. */
  src: string;
  previewSeconds: number;
  /** Waveform shape, 0..1 per bar. Produced by `npm run sync-tracks`. */
  peaks: number[];
  appleUrl?: string;
};

export type WorkLink = { label: string; href: string };

export type Work = {
  id: string;
  artist: string;
  title: string;
  year: number;
  kind: 'Album' | 'Single' | 'Live Event';
  /** Alex's credit on the project. */
  role: string;
  /** PLACEHOLDER: a line or two about the project, shown in the player. */
  summary: string;
  /** Short facts listed in the player, such as release date and credit. */
  details: { label: string; value: string }[];
  cover: string;
  /** `contain` keeps logos and non-square art uncropped on a dark tile. */
  coverFit: 'cover' | 'contain';
  /** Colour pulled from the artwork; tints the player while this work is active. */
  accent: string;
  links: WorkLink[];
  tracks: Track[];
};

const catalog = generated as Record<
  string,
  { appleUrl?: string; releaseDate?: string; tracks: Track[] }
>;

const appleLink = (id: string): WorkLink[] => {
  const href = catalog[id]?.appleUrl;
  return href ? [{ label: 'Apple Music', href }] : [];
};

/** Release date from the synced catalog, written out ("July 18, 2025"). */
const releasedOn = (id: string) => {
  const isoDate = catalog[id]?.releaseDate;
  if (!isoDate) return 'To be confirmed';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * The order here is the order on the page.
 *
 * To add a music project: drop the cover in src/assets/covers, add its Apple
 * Music id to catalog.json (with "only" if the credit is for specific tracks),
 * run `npm run sync-tracks`, then add an entry below.
 * To self-host audio instead of previews, point a track's `src` at a file in
 * /public (for example "/audio/song.mp3").
 */
export const works: Work[] = [
  {
    id: 'headlights',
    artist: 'Alex G',
    title: 'Headlights',
    year: 2025,
    kind: 'Album',
    role: 'Assistant Recording Engineer',
    summary: 'Project notes coming soon.',
    details: [
      { label: 'Released', value: releasedOn('headlights') },
      { label: 'Track', value: 'Far and Wide' },
      { label: 'Credit', value: 'Assistant Recording Engineer' },
    ],
    cover: headlights,
    coverFit: 'cover',
    accent: '#6f9dff',
    links: appleLink('headlights'),
    tracks: catalog.headlights?.tracks ?? [],
  },
  {
    id: 'bout-my-money',
    artist: 'OT7 Quanny & Bossman Dlow',
    title: 'Bout My Money',
    year: 2025,
    kind: 'Single',
    role: 'Recording & Mixing Engineer',
    summary: 'Project notes coming soon.',
    details: [
      { label: 'Released', value: releasedOn('bout-my-money') },
      { label: 'Format', value: 'Single' },
      { label: 'Credit', value: 'Recording Engineer, Mixing Engineer' },
    ],
    cover: boutMyMoney,
    coverFit: 'cover',
    accent: '#e2d256',
    links: [
      ...appleLink('bout-my-money'),
      { label: 'Spotify', href: 'https://open.spotify.com/track/4HzMo8F6xAYOZGYy72CUjX' },
      { label: 'YouTube', href: 'https://www.youtube.com/watch?v=TS3oJMC1hPU' },
    ],
    tracks: catalog['bout-my-money']?.tracks ?? [],
  },
  {
    id: 'super-bowl-lix',
    artist: 'Super Bowl LIX',
    title: 'Harry Connick Jr. Pre-Game Performance',
    year: 2025,
    kind: 'Live Event',
    role: 'Recording Engineer',
    summary: 'Project notes coming soon.',
    details: [
      { label: 'Date', value: 'February 9, 2025' },
      { label: 'Venue', value: 'Caesars Superdome, New Orleans' },
      { label: 'Credit', value: 'Recording Engineer' },
    ],
    cover: superBowl,
    coverFit: 'contain',
    accent: '#ff5a36',
    links: [],
    tracks: [],
  },
  {
    id: 'eric-bellinger',
    artist: 'Eric Bellinger',
    title: 'Eric Bellinger',
    year: 2026,
    kind: 'Album',
    role: 'Recording Engineer',
    summary: 'Project notes coming soon.',
    details: [
      { label: 'Released', value: releasedOn('eric-bellinger') },
      { label: 'Track', value: 'Fatherhood' },
      { label: 'Credit', value: 'Recording Engineer' },
    ],
    cover: ericBellinger,
    coverFit: 'cover',
    accent: '#d98a52',
    links: appleLink('eric-bellinger'),
    tracks: catalog['eric-bellinger']?.tracks ?? [],
  },
];

export const worksById: Record<string, Work> = Object.fromEntries(
  works.map((work) => [work.id, work]),
);

export const totalTracks = works.reduce((sum, work) => sum + work.tracks.length, 0);
