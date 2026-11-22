import { useEffect, type CSSProperties } from 'react';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Credits } from './components/Credits';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Nav } from './components/Nav';
import { PlayerDock } from './player/PlayerDock';
import { PlayerPanel } from './player/PlayerPanel';
import { PlayerProvider, usePlayer } from './player/PlayerProvider';

export default function App() {
  return (
    <PlayerProvider>
      <Site />
    </PlayerProvider>
  );
}

function Site() {
  const { current, toggle } = usePlayer();
  const hasPlayer = current !== null;

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // Space bar plays and pauses, unless focus is on a control that uses it.
  useEffect(() => {
    if (!hasPlayer) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, [role="slider"]')) return;
      event.preventDefault();
      toggle();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hasPlayer, toggle]);

  return (
    <div
      className="site"
      data-dock={hasPlayer ? '' : undefined}
      // The whole page picks up the colour of the record that is playing.
      style={current ? ({ '--accent': current.work.accent } as CSSProperties) : undefined}
    >
      <Nav />
      <Marquee />
      <main>
        <Hero />
        <Credits />
        <About />
      </main>
      <Contact />
      <PlayerDock />
      <PlayerPanel />
    </div>
  );
}
