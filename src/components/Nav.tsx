import { useEffect, useState } from 'react';
import { site } from '../content/site';
import { usePlayer } from '../player/PlayerProvider';
import { Equalizer } from './Icons';
import './Nav.css';

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Credits', href: '#credits' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const formatTime = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date());

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime(timeZone)), 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

export function Nav() {
  const { playing } = usePlayer();
  const time = useLocalTime(site.timeZone);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav__inner container">
        <a
          className="nav__brand display"
          href="#top"
          aria-label={`${site.brand}, ${site.name} also known as ${site.alias}, back to top`}
        >
          {site.brand}
        </a>
        <nav className="nav__links" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className="nav__status label">
          {playing ? <Equalizer active /> : <span className="dot" />}
          <span>
            PHL <time>{time}</time>
          </span>
        </p>
      </div>
    </header>
  );
}
