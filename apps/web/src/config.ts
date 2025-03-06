import { Icons } from '@/components/ui/icons';
import { env } from '@/env';

export type NavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type SiteConfig = {
  author: {
    name: string;
    url: URL | string;
    x: string;
  };
  description: string;
  footerItems: NavItem[];
  keywords: string[];
  links: {
    discord: string;
    docs: string;
    github: string;
    x: string;
  };
  name: string;
  ogImage: string;
  publisher: string;
  socialLinks: NavItem[];
  support: string;
  url: string;
};

const siteLinks = {
  discord: 'https://discord.gg/mAZRuBzGM3',
  docs: 'https://contract.solomon-ai.app/docs',
  github: 'https://github.com/solomon-ai',
  x: 'https://x.com/solomon_ai',
};

export const siteConfig: SiteConfig = {
  author: {
    name: 'Solomon AI Contract Workspace',
    url: 'https://contract.solomon-ai.app/',
    x: 'https://x.com/solomon_ai',
  },
  description: 'Solomon AI Contract Workspace editor',
  footerItems: [
    { href: '/terms', title: 'Terms of Use' },
    { href: '/privacy', title: 'Privacy' },
    { href: '/faq', title: 'FAQ' },
  ],
  keywords: ['Plate', 'Editor', 'Rich Text', 'WYSIWYG'],
  links: siteLinks,
  name: 'Solomon AI Contract Workspace',
  ogImage: '/og.png',
  publisher: 'solomon-ai',
  socialLinks: [
    {
      href: siteLinks.x,
      icon: Icons.logoX,
      title: 'X',
    },
    {
      href: siteLinks.discord,
      icon: Icons.logoDiscord,
      title: 'Discord',
    },
  ],
  support: 'yoanyomba@solomon-ai.co',
  url: env.NEXT_PUBLIC_SITE_URL,
};

export const META_THEME_COLORS = {
  dark: '#09090b',
  light: '#ffffff',
};
