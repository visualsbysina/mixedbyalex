import { useEffect, useRef, type CSSProperties } from 'react';
import { site } from '../content/site';
import { usePlayer } from '../player/PlayerProvider';
import './About.css';

/**
 * Stands in until there is a portrait: a speaker cone that is pushed by the
 * low end (40 to 150 Hz) of whatever is playing.
 */
function Speaker() {
  const { getAnalyser, playing } = usePlayer();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let level = 0;
    let bins = new Uint8Array(0);
    const tick = () => {
      const analyser = getAnalyser();
      if (analyser) {
        if (bins.length !== analyser.frequencyBinCount) bins = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(bins);
        const hzPerBin = analyser.context.sampleRate / analyser.fftSize;
        const from = Math.floor(40 / hzPerBin);
        const to = Math.ceil(150 / hzPerBin);
        let sum = 0;
        for (let bin = from; bin <= to; bin++) sum += bins[bin];
        const target = Math.pow(sum / ((to - from + 1) * 255), 3);
        level += (target - level) * (target > level ? 0.6 : 0.16);
        element.style.setProperty('--thump', level.toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      element.style.setProperty('--thump', '0');
    };
  }, [getAnalyser, playing]);

  return (
    <div className="speaker" ref={ref} aria-hidden="true">
      <span className="speaker__cone" />
      <span className="speaker__cap" />
    </div>
  );
}

export function About() {
  const { about, services } = site;

  return (
    <section className="about container" id="about">
      <div className="about__grid">
        <figure className="about__portrait" data-reveal>
          {about.portrait ? (
            <img
              src={about.portrait}
              alt={`${site.name}, also known as ${site.alias}, in the studio`}
              loading="lazy"
            />
          ) : (
            <Speaker />
          )}
          <figcaption className="label">
            <span>
              {site.name} / {site.alias}
            </span>
            <span>{site.city}</span>
          </figcaption>
        </figure>

        <div className="about__copy">
          <p className="label" data-reveal>
            <span className="dot" /> About
          </p>
          <p className="about__lead" data-reveal>
            {about.lead}
          </p>
          <div className="about__body" data-reveal>
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="about__facts" data-reveal>
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ol className="services">
        {services.map((service, index) => (
          <li key={service.name} data-reveal style={{ '--order': index } as CSSProperties}>
            <span className="label">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="display">{service.name}</h3>
            <p>{service.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
