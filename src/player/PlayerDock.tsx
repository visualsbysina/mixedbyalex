import { useEffect, useRef, type CSSProperties } from 'react';
import { CloseIcon, ExpandIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '../components/Icons';
import { formatTime, usePlaybackSeconds, usePlayer } from './PlayerProvider';
import { Waveform } from './Waveform';
import './Player.css';

export function Timecode({ part }: { part: 'time' | 'duration' }) {
  const seconds = usePlaybackSeconds();
  return <span className="timecode">{formatTime(seconds[part])}</span>;
}

/** Thin progress line along the top of the dock; stands in for the waveform on phones. */
function ProgressLine() {
  const { getProgress, subscribeProgress } = usePlayer();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const update = () => {
      const { time, duration } = getProgress();
      if (ref.current) ref.current.style.transform = `scaleX(${duration > 0 ? time / duration : 0})`;
    };
    update();
    return subscribeProgress(update);
  }, [getProgress, subscribeProgress]);
  return <span className="dock__line" ref={ref} aria-hidden="true" />;
}

/** The mini player that stays pinned to the bottom while something is loaded. */
export function PlayerDock() {
  const { current, playing, buffering, failed, toggle, next, previous, expand, stop } = usePlayer();
  if (!current) return null;

  const { work, track, index } = current;
  const isLast = index === work.tracks.length - 1;
  const hasSeveral = work.tracks.length > 1;

  return (
    <aside className="dock" aria-label="Player" style={{ '--accent': work.accent } as CSSProperties}>
      <ProgressLine />
      <div className="dock__inner container">
        <button type="button" className="dock__info" onClick={expand} aria-label="Open player">
          <img
            className={`dock__cover dock__cover--${work.coverFit}`}
            src={work.cover}
            alt=""
            width={48}
            height={48}
          />
          <span className="dock__titles">
            <strong>{track.title}</strong>
            <span>{failed ? 'Could not load this track' : work.artist}</span>
          </span>
        </button>

        <div className="dock__controls">
          {hasSeveral ? (
            <button type="button" className="icon-button dock__skip" onClick={previous} aria-label="Previous track">
              <PreviousIcon width={20} height={20} />
            </button>
          ) : null}
          <button
            type="button"
            className={`play-button${buffering && playing ? ' is-buffering' : ''}`}
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon width={20} height={20} /> : <PlayIcon width={20} height={20} />}
          </button>
          {hasSeveral ? (
            <button
              type="button"
              className="icon-button dock__skip"
              onClick={next}
              disabled={isLast}
              aria-label="Next track"
            >
              <NextIcon width={20} height={20} />
            </button>
          ) : null}
        </div>

        <div className="dock__scrub label">
          <Timecode part="time" />
          <Waveform className="dock__wave" peaks={track.peaks} accent={work.accent} bar={2} gap={2} />
          <Timecode part="duration" />
        </div>

        <div className="dock__tools">
          <button type="button" className="icon-button" onClick={expand} aria-label="Open player">
            <ExpandIcon width={22} height={22} />
          </button>
          <button type="button" className="icon-button" onClick={stop} aria-label="Stop and close player">
            <CloseIcon width={20} height={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
