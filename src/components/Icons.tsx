import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
};

export const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <path d="M7 4.5v15a.9.9 0 0 0 1.4.75l11.2-7.5a.9.9 0 0 0 0-1.5L8.4 3.75A.9.9 0 0 0 7 4.5Z" />
  </svg>
);

export const PauseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <rect x="5.5" y="4" width="4.5" height="16" rx="1" />
    <rect x="14" y="4" width="4.5" height="16" rx="1" />
  </svg>
);

export const NextIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <path d="M5 5.6v12.8a.8.8 0 0 0 1.25.66L15.5 12.7v5.8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v5.8L6.25 4.94A.8.8 0 0 0 5 5.6Z" />
  </svg>
);

export const PreviousIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} style={{ transform: 'scaleX(-1)', ...props.style }}>
    <path d="M5 5.6v12.8a.8.8 0 0 0 1.25.66L15.5 12.7v5.8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v5.8L6.25 4.94A.8.8 0 0 0 5 5.6Z" />
  </svg>
);

const stroke: SVGProps<SVGSVGElement> = {
  ...base,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ExpandIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <path d="m6 14 6-6 6 6" />
  </svg>
);

export const ArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

/** Three bars that bounce while audio is playing. */
export function Equalizer({ active }: { active: boolean }) {
  return (
    <span className={`equalizer${active ? ' is-active' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
