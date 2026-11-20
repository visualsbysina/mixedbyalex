import { useEffect, useLayoutEffect, useRef } from 'react';
import { site } from '../content/site';
import { usePlayer } from '../player/PlayerProvider';

const IDLE_TINT = '#b9b6b0';
const IDLE_FIELD = 'rgba(236, 231, 221, 0.1)';
const LOW_HZ = 38;
const HIGH_HZ = 12000;

/**
 * The giant name at the foot of the hero, which doubles as a spectrum
 * analyser. Two canvases share one set of bar levels: "tint" is multiplied
 * over the lettering so the bars colour the letters themselves, and "field"
 * shows the same bars faintly across the full width.
 */
export function Wordmark() {
  const { getAnalyser, playing, current } = usePlayer();
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const tintRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef({ playing, accent: current?.work.accent ?? '#ff4d24' });

  useEffect(() => {
    liveRef.current = { playing, accent: current?.work.accent ?? liveRef.current.accent };
  }, [playing, current]);

  // Scale the type so the name spans the container edge to edge.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;
    const fit = () => {
      wrap.style.fontSize = '100px';
      const natural = text.getBoundingClientRect().width;
      if (natural > 0) wrap.style.fontSize = `${(100 * wrap.clientWidth) / natural}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    void document.fonts.ready.then(fit);
    document.fonts.addEventListener('loadingdone', fit);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', fit);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tint = tintRef.current;
    const field = fieldRef.current;
    const tintContext = tint?.getContext('2d');
    const fieldContext = field?.getContext('2d');
    if (!wrap || !tint || !field || !tintContext || !fieldContext) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let levels = new Float32Array(0);
    let caps = new Float32Array(0);
    let spectrum = new Uint8Array(0);
    let mix = 0;
    let frame = 0;
    let visible = true;

    const draw = (now: number) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = field.clientWidth;
      const height = field.clientHeight;
      if (width === 0 || height === 0) return;
      for (const canvas of [tint, field]) {
        if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
          canvas.width = Math.round(width * ratio);
          canvas.height = Math.round(height * ratio);
        }
      }

      const step = width < 560 ? 5 : width < 1100 ? 8 : 11;
      const bar = Math.round(step * 0.62);
      const count = Math.ceil(width / step);
      if (levels.length !== count) {
        levels = new Float32Array(count);
        caps = new Float32Array(count);
      }

      const analyser = getAnalyser();
      const active = liveRef.current.playing && analyser !== null;
      mix += ((active ? 1 : 0) - mix) * 0.07;

      let nyquist = 22050;
      if (active) {
        if (spectrum.length !== analyser.frequencyBinCount) {
          spectrum = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(spectrum);
        nyquist = analyser.context.sampleRate / 2;
      }

      for (let i = 0; i < count; i++) {
        // A slow, low swell so the name is never completely still.
        const idle =
          0.035 +
          0.12 *
            (0.5 + 0.5 * Math.sin(i * 0.19 + now * 0.0011)) *
            (0.5 + 0.5 * Math.sin(i * 0.043 - now * 0.00047));
        let target = idle;

        if (active) {
          // Bars are spaced logarithmically, the way hearing works.
          const position = i / count;
          const from = (LOW_HZ * Math.pow(HIGH_HZ / LOW_HZ, position) * spectrum.length) / nyquist;
          const to = (LOW_HZ * Math.pow(HIGH_HZ / LOW_HZ, (i + 1) / count) * spectrum.length) / nyquist;
          let value = 0;
          if (to - from < 1) {
            const lower = Math.floor(from);
            const blend = from - lower;
            value = spectrum[lower] * (1 - blend) + (spectrum[lower + 1] ?? spectrum[lower]) * blend;
          } else {
            for (let bin = Math.floor(from); bin < to; bin++) value = Math.max(value, spectrum[bin] ?? 0);
          }
          // Music loses energy toward the top; lift the highs so the whole name moves.
          const lifted = (value / 255) * (0.8 + 0.7 * position);
          target = Math.max(idle * 0.5, Math.pow(Math.min(lifted, 1), 1.8));
        }

        // Meter ballistics: fast attack, slow release.
        levels[i] += (target - levels[i]) * (target > levels[i] ? 0.55 : 0.13);
        caps[i] = Math.max(caps[i] - 0.007, levels[i]);
      }

      const paint = (
        context: CanvasRenderingContext2D,
        idleColour: string,
        activeColour: string,
        activeAlpha: number,
      ) => {
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        const passes: [string, number][] = [
          [idleColour, 1 - mix],
          [activeColour, mix * activeAlpha],
        ];
        for (const [colour, alpha] of passes) {
          if (alpha < 0.01) continue;
          context.globalAlpha = alpha;
          context.fillStyle = colour;
          for (let i = 0; i < count; i++) {
            const barHeight = Math.max(2, levels[i] * height);
            context.fillRect(i * step, height - barHeight, bar, barHeight);
          }
        }
        // Peak-hold ticks, like the caps on a hardware analyser.
        if (mix > 0.05) {
          context.globalAlpha = mix * activeAlpha;
          context.fillStyle = activeColour;
          for (let i = 0; i < count; i++) {
            context.fillRect(i * step, height - caps[i] * height - 5, bar, 2);
          }
        }
        context.globalAlpha = 1;
      };

      const { accent } = liveRef.current;
      paint(tintContext, IDLE_TINT, accent, 1);
      paint(fieldContext, IDLE_FIELD, accent, 0.34);
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reducedMotion) frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };

    // No need to animate while the hero is scrolled out of view.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    visibility.observe(wrap);
    const resize = new ResizeObserver(start);
    resize.observe(wrap);
    start();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
    };
  }, [getAnalyser]);

  return (
    <div className="wordmark" ref={wrapRef}>
      <h1 className="wordmark__text display" ref={textRef}>
        {site.alias}
      </h1>
      <canvas className="wordmark__bars wordmark__bars--tint" ref={tintRef} aria-hidden="true" />
      <canvas className="wordmark__bars" ref={fieldRef} aria-hidden="true" />
    </div>
  );
}
