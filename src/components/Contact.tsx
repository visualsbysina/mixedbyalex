import { site } from '../content/site';
import { ArrowIcon } from './Icons';
import './Contact.css';

export function Contact() {
  const { contact } = site;

  return (
    <footer className="contact" id="contact">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container">
        <p className="label contact__tag" data-reveal>
          <span className="dot" /> Contact
        </p>
        <h2 className="contact__heading display" data-reveal>
          {contact.heading}
        </h2>

        <div className="contact__row" data-reveal>
          <a className="contact__email" href={`mailto:${contact.email}`}>
            <span>{contact.email}</span>
            <ArrowIcon width={28} height={28} />
          </a>
          <p className="contact__note">{contact.note}</p>
        </div>

        <div className="contact__foot">
          <ul className="contact__socials label">
            {contact.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  {...(social.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="label">
            © {new Date().getFullYear()} {site.brand} · {site.fullName} · {site.city}
          </p>
          <a className="label contact__top" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
