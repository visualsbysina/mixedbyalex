import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { worksById, type Track, type Work } from '../content/works';

export type Progress = { time: number; duration: number };
type Selection = { workId: string; index: number };

type PlayerContextValue = {
  /** What is loaded in the audio element, if anything. */
  current: { work: Work; track: Track; index: number } | null;
  playing: boolean;
  buffering: boolean;
  failed: boolean;
  /** The project shown in the full-screen panel, if it is open. */
  viewing: Work | null;
  /** Opens a project in the panel and starts it playing when it has audio. */
  open: (workId: string) => void;
  /** Re-opens the panel on whatever is currently loaded. */
  expand: () => void;
  close: () => void;
  playTrack: (workId: string, index: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  /** Jump to a position in the current track, 0..1. */
  seek: (fraction: number) => void;
  /** Playback volume, 0..1. Defaults to 0.5. */
  volume: number;
  setVolume: (volume: number) => void;
  /** Stops playback and dismisses the dock. */
  stop: () => void;
  getAnalyser: () => AnalyserNode | null;
  getProgress: () => Progress;
  subscribeProgress: (listener: () => void) => () => void;
};

const DEFAULT_VOLUME = 0.5;

const PlayerContext = createContext<PlayerContextValue | null>(null);
const EMPTY: Progress = { time: 0, duration: 0 };

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    gain: GainNode;
  } | null>(null);
  const selectionRef = useRef<Selection | null>(null);
  const progressRef = useRef<Progress>(EMPTY);
  const listenersRef = useRef(new Set<() => void>());
  const volumeRef = useRef(DEFAULT_VOLUME);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  const select = useCallback((next: Selection | null) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);

  const publish = useCallback(() => {
    const audio = audioRef.current;
    const chosen = selectionRef.current;
    if (!audio || !chosen) {
      progressRef.current = EMPTY;
    } else {
      const fallback = worksById[chosen.workId]?.tracks[chosen.index]?.previewSeconds ?? 0;
      progressRef.current = {
        time: audio.currentTime,
        duration: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallback,
      };
    }
    listenersRef.current.forEach((listener) => listener());
  }, []);

  // The spectrum needs the audio routed through Web Audio. Built on the first
  // play (inside a user gesture) so browsers allow the context to start.
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || graphRef.current) return;
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.78;
      // Wider than the default range so loud masters don't pin the meters.
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      // Element volume would stack with the gain node, so hand level off to Web Audio.
      audio.volume = 1;
      gain.gain.value = volumeRef.current;
      // Gain sits before the analyser so meters and speakers share the same level.
      context.createMediaElementSource(audio).connect(gain);
      gain.connect(analyser);
      analyser.connect(context.destination);
      graphRef.current = { context, analyser, gain };
    } catch {
      // No Web Audio: playback still works, the visuals just stay idle.
    }
  }, []);

  const setVolume = useCallback((next: number) => {
    const value = Math.min(Math.max(next, 0), 1);
    volumeRef.current = value;
    setVolumeState(value);
    if (graphRef.current) graphRef.current.gain.gain.value = value;
    else if (audioRef.current) audioRef.current.volume = value;
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureGraph();
    void graphRef.current?.context.resume();
    audio.play().catch((error: DOMException) => {
      // AbortError just means another track was loaded before this one started.
      if (error.name !== 'AbortError') {
        setFailed(true);
        setPlaying(false);
      }
    });
  }, [ensureGraph]);

  const load = useCallback(
    (workId: string, index: number) => {
      const audio = audioRef.current;
      const track = worksById[workId]?.tracks[index];
      if (!audio || !track) return;
      select({ workId, index });
      setFailed(false);
      setBuffering(true);
      audio.src = track.src;
      publish();
      play();
    },
    [play, publish, select],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    let frame = 0;
    const tick = () => {
      publish();
      if (!audio.paused) frame = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      publish();
    };
    const onWaiting = () => setBuffering(true);
    const onReady = () => setBuffering(false);
    const onError = () => {
      if (!selectionRef.current) return;
      setFailed(true);
      setBuffering(false);
      setPlaying(false);
    };
    const onEnded = () => {
      const chosen = selectionRef.current;
      if (!chosen) return;
      const hasNext = chosen.index < worksById[chosen.workId].tracks.length - 1;
      if (hasNext) {
        load(chosen.workId, chosen.index + 1);
      } else {
        audio.currentTime = 0;
        publish();
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onReady);
    audio.addEventListener('canplay', onReady);
    audio.addEventListener('durationchange', publish);
    audio.addEventListener('seeked', publish);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onReady);
      audio.removeEventListener('canplay', onReady);
      audio.removeEventListener('durationchange', publish);
      audio.removeEventListener('seeked', publish);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.removeAttribute('src');
      void graphRef.current?.context.close();
      graphRef.current = null;
      audioRef.current = null;
    };
  }, [load, publish]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !selectionRef.current) return;
    if (audio.paused) play();
    else audio.pause();
  }, [play]);

  const open = useCallback(
    (workId: string) => {
      const work = worksById[workId];
      if (!work) return;
      setViewingId(workId);
      if (work.tracks.length === 0) return;
      if (selectionRef.current?.workId !== workId) load(workId, 0);
      else if (audioRef.current?.paused) play();
    },
    [load, play],
  );

  const expand = useCallback(() => {
    if (selectionRef.current) setViewingId(selectionRef.current.workId);
  }, []);

  const close = useCallback(() => setViewingId(null), []);

  const playTrack = useCallback(
    (workId: string, index: number) => {
      const chosen = selectionRef.current;
      if (chosen?.workId === workId && chosen.index === index) toggle();
      else load(workId, index);
    },
    [load, toggle],
  );

  const next = useCallback(() => {
    const chosen = selectionRef.current;
    if (!chosen) return;
    if (chosen.index < worksById[chosen.workId].tracks.length - 1) {
      load(chosen.workId, chosen.index + 1);
    }
  }, [load]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    const chosen = selectionRef.current;
    if (!audio || !chosen) return;
    // Like every other player: a few seconds in, "previous" restarts the track.
    if (audio.currentTime > 3 || chosen.index === 0) {
      audio.currentTime = 0;
      publish();
    } else {
      load(chosen.workId, chosen.index - 1);
    }
  }, [load, publish]);

  const seek = useCallback(
    (fraction: number) => {
      const audio = audioRef.current;
      const { duration } = progressRef.current;
      if (!audio || !selectionRef.current || duration <= 0) return;
      audio.currentTime = Math.min(Math.max(fraction, 0), 1) * duration;
      publish();
    },
    [publish],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    select(null);
    setBuffering(false);
    setFailed(false);
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    publish();
  }, [publish, select]);

  const getAnalyser = useCallback(() => graphRef.current?.analyser ?? null, []);
  const getProgress = useCallback(() => progressRef.current, []);
  const subscribeProgress = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const current = useMemo(() => {
    if (!selection) return null;
    const work = worksById[selection.workId];
    return { work, track: work.tracks[selection.index], index: selection.index };
  }, [selection]);

  // Lock-screen and hardware media key controls.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.track.title,
      artist: current.work.artist,
      album: current.work.title,
      artwork: [{ src: current.work.cover }],
    });
    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
  }, [current, next, previous, toggle]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      playing,
      buffering,
      failed,
      viewing: viewingId ? worksById[viewingId] : null,
      open,
      expand,
      close,
      playTrack,
      toggle,
      next,
      previous,
      seek,
      volume,
      setVolume,
      stop,
      getAnalyser,
      getProgress,
      subscribeProgress,
    }),
    [
      buffering,
      close,
      current,
      expand,
      failed,
      getAnalyser,
      getProgress,
      next,
      open,
      playTrack,
      playing,
      previous,
      seek,
      setVolume,
      stop,
      subscribeProgress,
      toggle,
      viewingId,
      volume,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return value;
}

/** Playback position in whole seconds; re-renders once per second, not per frame. */
export function usePlaybackSeconds() {
  const { getProgress, subscribeProgress } = usePlayer();
  const time = useSyncExternalStore(subscribeProgress, () => Math.floor(getProgress().time));
  const duration = useSyncExternalStore(subscribeProgress, () => Math.round(getProgress().duration));
  return { time, duration };
}

export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
