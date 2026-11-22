import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowIcon,
  CloseIcon,
  Equalizer,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
} from '../components/Icons';
import { works, type Work } from '../content/works';
import { Timecode, VolumeControl } from './PlayerDock';
import { formatTime, usePlayer } from './PlayerProvider';
import { Waveform } from './Waveform';
import './Player.css';

const EXIT_MS = 380;

/** Full-screen view of one project: artwork, transport, waveform and tracklist. */
export function PlayerPanel() {
  const { viewing, close } = usePlayer();
  // Keep the last project mounted while the sheet animates out.
  const [work, setWork] = useState<Work | null>(viewing);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (viewing) {
      setWork(viewing);
      setClosing(false);
      return;
    }
    if (!work) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setWork(null);
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [viewing, work]);

  const isOpen = viewing !== null;

  // While open: lock page scroll, close on Escape, keep Tab inside the sheet,
  // and hand focus back to whatever opened it afterwards.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab' || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex="0"]',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [close, isOpen]);

  if (!work) return null;

  return (
    <div
      className={`panel${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${work.artist}, ${work.title}`}
      style={{ '--accent': work.accent } as CSSProperties}
    >
      <div className="panel__backdrop" onClick={close} />
      <div className="panel__sheet" ref={sheetRef}>
        <div className="panel__ambient" style={{ backgroundImage: `url(${work.cover})` }} aria-hidden="true" />

        <header className="panel__bar">
          <p className="label">
            {String(works.indexOf(work) + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
          </p>
          <button type="button" className="panel__close label" onClick={close} ref={closeRef}>
            Close <CloseIcon width={18} height={18} />
          </button>
        </header>

        <div className="panel__content">
          <div className={`panel__art panel__art--${work.coverFit}`}>
            <img src={work.cover} alt={`${work.artist}, ${work.title} artwork`} />
          </div>

          <div className="panel__main">
            <p className="label panel__kind">
              <span>{work.kind}</span>
              <span>{work.year}</span>
              <span>{work.role}</span>
            </p>
            <h2 className="panel__artist display">{work.artist}</h2>
            <p className="panel__title">{work.title}</p>

            {work.tracks.length > 0 ? <Transport work={work} /> : null}

            <dl className="panel__details">
              {work.details.map((detail) => (
                <div key={detail.label}>
                  <dt className="label">{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>

            <p className="panel__summary">{work.summary}</p>

            {work.links.length > 0 ? (
              <div className="panel__links">
                <p className="label">Hear it in full</p>
                <ul>
                  {work.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label} <ArrowIcon width={16} height={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Transport({ work }: { work: Work }) {
  const { current, playing, buffering, failed, playTrack, toggle, next, previous } = usePlayer();
  const isCurrent = current?.work.id === work.id;
  const activeIndex = isCurrent ? current.index : 0;
  const track = work.tracks[activeIndex];
  const isPlaying = isCurrent && playing;
  const isLast = activeIndex === work.tracks.length - 1;
  const hasSeveral = work.tracks.length > 1;

  return (
    <div className="transport">
      <div className="transport__now">
        <p className="transport__track">
          {track.title}
          {failed && isCurrent ? <span className="transport__error label">Could not load audio</span> : null}
        </p>
        {isCurrent ? (
          <Waveform className="transport__wave" peaks={track.peaks} accent={work.accent} bar={3} gap={2} />
        ) : (
          <div className="transport__wave" />
        )}
        <div className="transport__times label">
          {isCurrent ? <Timecode part="time" /> : <span className="timecode">0:00</span>}
          <span>30-second preview</span>
          {isCurrent ? (
            <Timecode part="duration" />
          ) : (
            <span className="timecode">{formatTime(track.previewSeconds)}</span>
          )}
        </div>
      </div>

      <div className="transport__controls">
        {hasSeveral ? (
          <button
            type="button"
            className="icon-button"
            onClick={previous}
            disabled={!isCurrent}
            aria-label="Previous track"
          >
            <PreviousIcon />
          </button>
        ) : null}
        <button
          type="button"
          className={`play-button play-button--large${buffering && isPlaying ? ' is-buffering' : ''}`}
          onClick={() => (isCurrent ? toggle() : playTrack(work.id, 0))}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon width={28} height={28} /> : <PlayIcon width={28} height={28} />}
        </button>
        {hasSeveral ? (
          <button
            type="button"
            className="icon-button"
            onClick={next}
            disabled={!isCurrent || isLast}
            aria-label="Next track"
          >
            <NextIcon />
          </button>
        ) : null}
        <VolumeControl className="transport__volume" />
      </div>

      {hasSeveral ? (
        <ol className="tracks">
          {work.tracks.map((item, index) => {
            const isActive = isCurrent && index === activeIndex;
            return (
              <li key={item.src}>
                <button
                  type="button"
                  className={`track${isActive ? ' is-active' : ''}`}
                  onClick={() => playTrack(work.id, index)}
                  aria-current={isActive || undefined}
                >
                  <span className="track__number label">
                    {isActive ? <Equalizer active={playing} /> : String(item.number).padStart(2, '0')}
                  </span>
                  <span className="track__title">{item.title}</span>
                  <span className="track__length label">{formatTime(item.durationMs / 1000)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
