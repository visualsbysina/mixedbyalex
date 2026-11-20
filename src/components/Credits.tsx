import type { CSSProperties } from 'react';
import { site } from '../content/site';
import { worksById } from '../content/works';
import { usePlayer } from '../player/PlayerProvider';
import { ArrowIcon, Equalizer, PlayIcon } from './Icons';
import './Credits.css';

export function Credits() {
  const { open, current, playing } = usePlayer();

  return (
    <section className="credits" id="credits">
      <div className="container">
        <header className="section-head" data-reveal>
          <h2 className="display">Credits</h2>
          <p className="label">
            {String(site.credits.length).padStart(2, '0')} credits
            <br />
            Recording / Mixing / Mastering
          </p>
        </header>

        <ol className="credits__list">
          {site.credits.map((credit, index) => {
            const work = credit.workId ? worksById[credit.workId] : undefined;
            const isCurrent = work !== undefined && current?.work.id === work.id;
            const content = (
              <>
                <span className="credit__index label">{String(index + 1).padStart(2, '0')}</span>
                <span className="credit__title">
                  <strong>{credit.artist}</strong>
                  <span>{credit.title}</span>
                </span>
                <span className="credit__roles label">
                  {credit.roles.map((role) => (
                    <span key={role}>{role}</span>
                  ))}
                </span>
                <span className="credit__icon">
                  {!work ? null : isCurrent ? (
                    <Equalizer active={playing} />
                  ) : work.tracks.length > 0 ? (
                    <PlayIcon width={18} height={18} />
                  ) : (
                    <ArrowIcon width={18} height={18} />
                  )}
                </span>
              </>
            );

            return (
              <li key={`${credit.artist}-${credit.title}`} data-reveal>
                {work ? (
                  <button
                    type="button"
                    className={`credit credit--link${isCurrent ? ' is-current' : ''}`}
                    style={{ '--accent': work.accent } as CSSProperties}
                    onClick={() => open(work.id)}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="credit">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
