import { useState } from 'react';
import { tv } from 'tailwind-variants';
import { RootLayout } from '../ui/layouts/root';

const FONT = import.meta.env.VITE_COUNTER_FONT;
const WEIGHT = import.meta.env.VITE_COUNTER_WEIGHT;

const button = tv({
  base: 'inline-flex items-center gap-2 px-4 py-2 rounded transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-200 hover:bg-gray-300',
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
});

const iconProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const PlusIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const MinusIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

const HomeIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const Counter = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <RootLayout>
      <div className="container mx-auto p-10">
        <p
          style={{
            fontSize: '5rem',
            fontWeight: WEIGHT !== '' && WEIGHT !== undefined ? WEIGHT : 'bold',
            fontFamily:
              FONT !== '' && FONT !== undefined
                ? FONT
                : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          }}
        >
          {count}
          <span>回</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCount((prev) => prev + 1)}
            className={button({ variant: 'primary' })}
          >
            <PlusIcon /> Count Up
          </button>
          <button
            type="button"
            onClick={() => setCount((prev) => (prev !== 0 ? prev - 1 : prev))}
            className={button({ variant: 'primary' })}
          >
            <MinusIcon /> Count Down
          </button>
          <a href="/" className={button()}>
            <HomeIcon /> Home
          </a>
        </div>
      </div>
    </RootLayout>
  );
};

export { Counter };
