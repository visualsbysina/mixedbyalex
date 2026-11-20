import { site } from '../content/site';
import './Marquee.css';

export function Marquee() {
  // Rendered twice so the loop is seamless; the copy is hidden from screen readers.
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {site.marquee.map((name) => (
        <li key={name} className="display">
          {name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" aria-label="Selected collaborators">
      {/* Duration scales with the number of names so the pace stays the same. */}
      <div className="marquee__track" style={{ animationDuration: `${site.marquee.length * 7}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
