import type { CSSProperties } from 'react';
import { works } from '../content/works';
import { usePlayer } from '../player/PlayerProvider';
import { Equalizer, PauseIcon, PlayIcon, ArrowIcon } from './Icons';
import './WorkGrid.css';

export function WorkGrid() {
  const { open, current, playing } = usePlayer();

  return (
    <section className="work container" id="work">
      <header className="section-head" data-reveal>
        <h2 className="display">Selected Work</h2>
        <p className="label">
          {String(works.length).padStart(2, '0')} projects
          <br />
          Select a cover to listen
        </p>
      </header>

      <ul className="work__grid">
        {works.map((work, index) => {
          const isCurrent = current?.work.id === work.id;
          const hasAudio = work.tracks.length > 0;
          return (
            <li key={work.id} data-reveal style={{ '--order': index } as CSSProperties}>
              <button
                type="button"
                className={`card${isCurrent ? ' is-current' : ''}`}
                style={{ '--accent': work.accent } as CSSProperties}
                onClick={() => open(work.id)}
                aria-label={`${work.artist}, ${work.title}. ${hasAudio ? 'Open and play' : 'Open project'}`}
              >
                <span className={`card__art card__art--${work.coverFit}`}>
                  <img src={work.cover} alt="" loading="lazy" />
                  <span className="card__action">
                    {!hasAudio ? <ArrowIcon /> : isCurrent && playing ? <PauseIcon /> : <PlayIcon />}
                  </span>
                </span>
                <span className="card__meta">
                  <span className="card__index label">
                    {isCurrent ? <Equalizer active={playing} /> : String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="card__titles">
                    <strong>{work.artist}</strong>
                    <span>{work.title}</span>
                  </span>
                  <span className="card__kind label">
                    {work.kind}
                    <span className="card__kind-sep" aria-hidden="true">
                      {' '}
                      ·{' '}
                    </span>
                    {work.year}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
