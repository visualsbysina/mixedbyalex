import type { CSSProperties } from 'react';
import { site } from '../content/site';
import { totalTracks, works } from '../content/works';
import { usePlayer } from '../player/PlayerProvider';
import { PauseIcon, PlayIcon } from './Icons';
import { Wordmark } from './Wordmark';
import './Hero.css';

const firstWithAudio = works.find((work) => work.tracks.length > 0);

export function Hero() {
  const { current, playing, toggle, playTrack } = usePlayer();

  const onListen = () => {
    if (current) toggle();
    else if (firstWithAudio) playTrack(firstWithAudio.id, 0);
  };

  return (
    <section className="hero" id="top">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__body container">
        <p className="hero__tag label" data-reveal>
          <span className="dot" />
          {site.role}
          <span className="hero__rule" />
          aka {site.alias}
          <span className="hero__rule" />
          {site.city}
        </p>
        <p className="hero__statement" data-reveal style={{ '--order': 1 } as CSSProperties}>
          {site.hero.statement}
        </p>
        <div className="hero__actions" data-reveal style={{ '--order': 2 } as CSSProperties}>
          <button type="button" className="listen" onClick={onListen}>
            <span className="listen__icon">{playing ? <PauseIcon /> : <PlayIcon />}</span>
            <span className="listen__text">
              <strong>{playing ? 'Pause' : current ? 'Resume' : 'Listen'}</strong>
              <span className="label">
                {current
                  ? `${current.work.artist} · ${current.track.title}`
                  : `${works.length} projects · ${totalTracks} tracks`}
              </span>
            </span>
          </button>
          <a className="hero__more label" href="#work">
            Selected work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="container">
        <Wordmark />
      </div>
    </section>
  );
}
