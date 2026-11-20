import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTime, usePlayer } from './PlayerProvider';

type Props = {
  peaks: number[];
  accent: string;
  /** Bar and gap width in CSS pixels. */
  bar?: number;
  gap?: number;
  className?: string;
};

const REST = 'rgba(236, 231, 221, 0.2)';
const HOVER = 'rgba(236, 231, 221, 0.5)';

/** The current track's waveform. Click or drag to seek; arrow keys nudge. */
export function Waveform({ peaks, accent, bar = 3, gap = 2, className }: Props) {
  const { getProgress, subscribeProgress, seek } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const { time, duration } = getProgress();
      const played = duration > 0 ? time / duration : 0;
      const hover = hoverRef.current;
      const count = Math.max(1, Math.floor((width + gap) / (bar + gap)));
      const middle = height / 2;

      for (let i = 0; i < count; i++) {
        // Resample the stored peaks to however many bars fit.
        const from = Math.floor((i / count) * peaks.length);
        const to = Math.max(from + 1, Math.floor(((i + 1) / count) * peaks.length));
        let level = 0;
        for (let p = from; p < to; p++) level = Math.max(level, peaks[p] ?? 0);
        if (peaks.length === 0) level = 0.18;

        const position = (i + 0.5) / count;
        const barHeight = Math.max(2, level * (height - 2));
        if (position <= played) context.fillStyle = accent;
        else if (hover !== null && position <= hover) context.fillStyle = HOVER;
        else context.fillStyle = REST;
        context.beginPath();
        context.roundRect(i * (bar + gap), middle - barHeight / 2, bar, barHeight, bar / 2);
        context.fill();
      }

      canvas.setAttribute('aria-valuenow', String(Math.round(time)));
      canvas.setAttribute('aria-valuemax', String(Math.round(duration)));
      canvas.setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(duration)}`);
    };

    drawRef.current = draw;
    draw();
    const unsubscribe = subscribeProgress(draw);
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [accent, bar, gap, getProgress, peaks, subscribeProgress]);

  const fractionAt = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    seek(fractionAt(event));
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seek(fractionAt(event));
    } else if (event.pointerType === 'mouse') {
      hoverRef.current = fractionAt(event);
      drawRef.current();
    }
  };

  const onPointerLeave = () => {
    hoverRef.current = null;
    drawRef.current();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const { time, duration } = getProgress();
    if (duration <= 0) return;
    const step = event.key === 'ArrowRight' ? 2 : event.key === 'ArrowLeft' ? -2 : 0;
    if (step === 0) return;
    event.preventDefault();
    seek((time + step) / duration);
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    />
  );
}
