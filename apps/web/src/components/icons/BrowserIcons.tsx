import { createIcon } from '@/components/ui/icon';

export const ChromeIcon = createIcon((props) => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
));

export const FirefoxIcon = createIcon((props) => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="5" r="0.5" />
    <circle cx="12" cy="19" r="0.5" />
    <circle cx="5" cy="12" r="0.5" />
    <circle cx="19" cy="12" r="0.5" />
    <path d="M14.5 8.5c1 1 2 3.5 1.5 6s-2.5 4-5.5 4-5-2-5.5-4 1-6.5 3-7.5 5.5 0 6.5 1.5z" />
  </svg>
));

export const SafariIcon = createIcon((props) => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="16.2" x2="7.8" y1="7.8" y2="16.2" />
    <line x1="7.8" x2="16.2" y1="7.8" y2="16.2" />
  </svg>
));
