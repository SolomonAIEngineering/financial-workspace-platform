'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2Icon, DiamondPercentIcon } from 'lucide-react';
// Import Hero Icons
import {
  CalendarIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  HomeIcon,
  MoonIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { Icons } from '../ui/icons';
import { Link } from '@/components/ui/link';
import { ReloadIcon } from '@radix-ui/react-icons';
import { TooltipTC } from '@/registry/default/potion-ui/tooltip';
import { cn } from '@udecode/cn';
import { routes } from '@/lib/navigation/routes';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

interface MiniSidebarItemProps {
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  tooltip: string;
  active?: boolean;
  badge?: number;
  category?: string;
}

const MiniSidebarItem = ({
  active,
  badge,
  href,
  icon: Icon,
  tooltip,
}: MiniSidebarItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipTC content={tooltip} side="right">
      <Link className="block" href={href}>
        <motion.div
          className={cn(
            'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ease-in-out hover:bg-primary',
            active
              ? 'border-[0.5px] border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-black shadow-lg ring-1 ring-primary/20 ring-offset-1 ring-offset-background dark:border-primary/10'
              : 'text-primary hover:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none'
          )}
          onHoverEnd={() => setIsHovered(false)}
          onHoverStart={() => setIsHovered(true)}
          animate={
            active
              ? {
                boxShadow: [
                  '0 0 0 rgba(var(--primary) / 0.2)',
                  '0 0 12px rgba(var(--primary) / 0.3)',
                  '0 0 0 rgba(var(--primary) / 0.2)',
                ],
              }
              : {}
          }
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
            },
            damping: 20,
            stiffness: 400,
            type: 'spring',
          }}
          whileHover={{
            backgroundColor: 'rgba(var(--primary) / 0.15)',
            boxShadow:
              '0 8px 16px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            scale: 1.05,
          }}
          whileTap={{ scale: 0.92 }}
        >
          {!active && isHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-70"
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            />
          )}

          <Icon
            className={cn(
              'relative z-10 size-[18px] transition-all duration-300',
              active
                ? 'stroke-[1.5px] text-black dark:text-foreground'
                : 'stroke-[1.25px] text-muted-foreground group-hover:text-foreground'
            )}
          />

          {active && (
            <motion.div
              className="absolute top-1/2 left-0 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary/70 shadow-[0_0_8px_rgba(var(--primary)_/_0.4)]"
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -5 }}
              layoutId="activeIndicator"
              transition={{ duration: 0.3, stiffness: 400, type: 'spring' }}
            />
          )}

          {badge && badge > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-400 px-1 text-[11px] font-medium text-white shadow-md"
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ damping: 10, stiffness: 400, type: 'spring' }}
            >
              {badge > 99 ? '99+' : badge}
            </motion.div>
          )}
        </motion.div>
      </Link>
    </TooltipTC>
  );
};

// Create a more complete set of items for demonstration, organized by category
const demoItems = [
  {
    category: 'main',
    href: routes.dashboard(),
    icon: HomeIcon,
    tooltip: 'Workspace',
  },
  {
    badge: 3,
    category: 'documents',
    href: routes.financialOverview(),
    icon: BarChart2Icon,
    tooltip: 'Financial Overview',
  },
  {
    category: 'documents',
    href: routes.financialAnalytics(),
    icon: PaperAirplaneIcon,
    tooltip: 'Financial Analytics',
  },
  {
    category: 'documents',
    href: routes.documents(),
    icon: DocumentDuplicateIcon,
    tooltip: 'Documents',
  },
  {
    category: 'documents',
    href: routes.templates(),
    icon: DocumentTextIcon,
    tooltip: 'Templates',
  },
  {
    badge: 5,
    category: 'communication',
    href: routes.messages(),
    icon: ChatBubbleLeftRightIcon,
    tooltip: 'Messages',
  },
  {
    category: 'tools',
    href: routes.analytics(),
    icon: ChartBarIcon,
    tooltip: 'Analytics',
  },
  {
    category: 'tools',
    href: routes.calendar(),
    icon: CalendarIcon,
    tooltip: 'Calendar',
  },
];

export function MiniSidebar() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  // For demonstration, use either the demo items or a smaller set
  const useDemoItems = false; // Set to true to show scrolling behavior

  const sidebarItems = useDemoItems
    ? demoItems.map((item) => ({
      ...item,
      isActive: pathname.includes(item.href),
    }))
    : [
      {
        category: 'main',
        href: '/dashboard',
        icon: HomeIcon,
        isActive: pathname.includes('/dashboard'),
        tooltip: 'Workspace',
      },
      {
        category: 'documents',
        href: '/financial-overview',
        icon: ChartBarSquareIcon,
        isActive: pathname.includes('/financial-overview'),
        tooltip: 'Financial Overview',
      },
      {
        category: 'documents',
        href: '/financial-analytics',
        icon: CubeIcon,
        isActive: pathname.includes('/financial-analytics'),
        tooltip: 'Financial Analytics',
      },
      {
        category: 'documents',
        href: '/regular-transactions',
        icon: DiamondPercentIcon,
        isActive: pathname.includes('/regular-transactions'),
        tooltip: 'Regular Transactions',
      },
      {
        category: 'documents',
        href: '/recurring-transactions',
        icon: ReloadIcon,
        isActive: pathname.includes('/recurring-transactions'),
        tooltip: 'Recurring Transactions',
      },
      {
        category: 'documents',
        href: '/invoices',
        icon: CurrencyDollarIcon,
        isActive: pathname.includes('/invoices'),
        tooltip: 'invoices',
      },
      {
        category: 'documents',
        href: '/customers',
        icon: UserGroupIcon,
        isActive: pathname.includes('/customers'),
        tooltip: 'customers',
      },
    ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10, y: 15 },
    show: {
      opacity: 1,
      transition: {
        damping: 25,
        stiffness: 350,
        type: 'spring',
      },
      x: 0,
      y: 0,
    },
  };

  // Group sidebar items by category
  const groupedItems: Record<string, Array<(typeof sidebarItems)[number]>> = {};

  // Populate the grouped items
  for (const item of sidebarItems) {
    const category = item.category || 'other';

    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }

    groupedItems[category].push(item);
  }

  // Categories in desired order
  const orderedCategories = [
    'main',
    'transactions',
    'documents',
    'communication',
    'tools',
    'other',
  ];

  return (
    <motion.div
      className="relative flex h-full w-[72px] flex-col items-center border-r bg-gradient-to-b from-background via-background to-background/80 py-6 shadow-[1px_0_5px_rgba(0,0,0,0.05)]"
      animate={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Subtle pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.08] dark:bg-[radial-gradient(#333_1px,transparent_1px)]" />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-80" />

      <motion.div
        className="relative z-10 mb-10 flex items-center justify-center"
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          stiffness: 300,
          type: 'spring',
        }}
        whileHover={{
          rotate: [0, -2, 0, 2, 0],
          scale: 1.05,
          transition: { duration: 0.6, type: 'spring' },
        }}
      >
        <Link className="group" href="/">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl to-primary/5 ring-offset-background backdrop-blur-sm transition-all duration-300 group-hover:ring-1 group-hover:ring-primary/30 group-hover:ring-offset-1 hover:from-primary/30 hover:to-primary/10 hover:shadow-lg">
            <motion.div
              animate={{
                scale: [1, 1.03, 1],
              }}
              initial={{ scale: 1 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icons.logo className="size-12" />
            </motion.div>
          </div>
        </Link>
      </motion.div>

      <motion.div
        className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent relative z-10 flex w-full flex-1 flex-col items-center overflow-y-auto px-2"
        style={{ scrollbarWidth: 'none' }}
        animate="show"
        initial="hidden"
        variants={container}
      >
        {orderedCategories.map((category) => {
          const items = groupedItems[category];

          if (!items || items.length === 0) return null;

          return (
            <React.Fragment key={category}>
              {category !== 'main' && category !== 'other' && (
                <div className="my-3 h-[1px] w-10 bg-gradient-to-r from-transparent via-border to-transparent opacity-70"></div>
              )}
              <div className="flex flex-col items-center gap-4 py-1">
                {items.map((sidebarItem) => (
                  <motion.div key={sidebarItem.href} variants={itemVariants}>
                    <MiniSidebarItem
                      active={sidebarItem.isActive}
                      badge={(sidebarItem as any).badge}
                      href={sidebarItem.href}
                      icon={sidebarItem.icon}
                      tooltip={sidebarItem.tooltip}
                    />
                  </motion.div>
                ))}
              </div>
            </React.Fragment>
          );
        })}
      </motion.div>

      <div className="relative z-10 mt-auto flex w-full flex-col items-center">
        <div className="mb-6 h-[1px] w-10 bg-gradient-to-r from-transparent via-border to-transparent pt-2 opacity-70"></div>

        <motion.div
          className="mb-4"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.65, duration: 0.4, type: 'spring' }}
        >
          <TooltipTC
            content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            side="right"
          >
            <motion.button
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', y: -2 }}
              whileTap={{ scale: 0.94 }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={theme === 'dark' ? 'dark' : 'light'}
                  animate={{ opacity: 1, rotateY: 0, y: 0 }}
                  exit={{ opacity: 0, rotateY: -90, y: 10 }}
                  initial={{ opacity: 0, rotateY: 90, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="size-[18px]" />
                  ) : (
                    <MoonIcon className="size-[18px]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </TooltipTC>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.75, duration: 0.4, type: 'spring' }}
        >
          <TooltipTC content="Settings" side="right">
            <Link className="block" href={routes.account()}>
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                whileHover={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  y: -2,
                }}
                whileTap={{ scale: 0.94 }}
              >
                <Cog6ToothIcon className="size-[18px]" />
              </motion.div>
            </Link>
          </TooltipTC>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.85, duration: 0.4, type: 'spring' }}
        >
          <TooltipTC content="Help & Resources" side="right">
            <Link className="mt-4 block" href={routes.help()}>
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                whileHover={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  y: -2,
                }}
                whileTap={{ scale: 0.94 }}
              >
                <QuestionMarkCircleIcon className="size-[18px]" />
              </motion.div>
            </Link>
          </TooltipTC>
        </motion.div>
      </div>

      <motion.div
        className="mt-6 mb-2 rotate-180 text-[9px] font-light tracking-wide text-muted-foreground/50 [writing-mode:vertical-lr]"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        Solomon AI v1.0
      </motion.div>
    </motion.div>
  );
}
