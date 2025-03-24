import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import { api, useTRPC } from '@/trpc/react';

import { Button } from '@/registry/default/potion-ui/button';
import { ConnectTransactionsButton } from '../bank-connection/connect-transactions-button';
import { DocumentList } from './document-list';
import { FeedbackForm } from '../editor/feedback-form';
import { HouseIcon } from 'lucide-react';
import { Icons } from '../ui/icons';
import { NavItem } from './nav-item';
import React from 'react';
import { SearchStore } from '@/components/search/SearchStore';
import { SelectBankAccountsButton } from '../bank-connection/select-accounts-button';
import { SidebarSwitcher } from './sidebar-switcher';
import { TrashBox } from './trash-box';
import { cn } from '@udecode/cn';
import { pushModal } from '../modals';
import { routes } from '@/lib/navigation/routes';
import { toast } from 'sonner';
import { useAuthGuard } from '../auth/useAuthGuard';
import { useCurrentUser } from '../auth/useCurrentUser';
import { useIsDesktop } from '@/components/providers/tailwind-provider';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/useSession';
import { useToggleLeftPanel } from '@/hooks/useResizablePanel';

export function Sidebar({ ...props }: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const isMobile = !useIsDesktop();
  const trpc = useTRPC();
  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
    },
  });
  const authGuard = useAuthGuard();
  const mounted = useMounted();

  const onCreate = () => {
    authGuard(() => {
      const promise = createDocument.mutateAsync({}).then((document) => {
        router.push(routes.document({ documentId: document.id }));
      });

      toast.promise(promise, {
        error: 'Failed to create a new note!',
        loading: 'Creating a new note...',
        success: 'New Note created.',
      });
    });
  };

  return (
    <aside
      className={cn(
        'group/sidebar border-opacity-50 relative z-20 flex size-full flex-col overflow-y-auto border-r bg-background',
        props.className
      )}
      {...props}
    >
      <SidebarSwitcher />

      <div className="absolute top-2 right-2 z-50 flex gap-1">
        <CloseButton />

        <Button
          size="navAction"
          variant="nav"
          className="size-[26px] transition-colors duration-200 hover:bg-muted/70"
          onClick={onCreate}
          tooltip="Create a new page"
          tooltipContentProps={{
            side: 'right',
          }}
        >
          <Icons.newPage variant="primary" className="size-4" />
        </Button>
      </div>

      <div className="mt-1 flex flex-1 flex-col px-2 py-1">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <NavItem
              className="text-sm transition-colors"
              onClick={() => {
                SearchStore.actions.onOpen();
              }}
              label="Search"
              icon={Icons.search}
              tooltip="Search page"
            />
            <NavItem
              className="text-sm transition-colors"
              label="Home"
              href={routes.home()}
              icon={HouseIcon}
              tooltip="View recent pages"
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <NavItem
              className="text-xs font-medium text-muted-foreground/90"
              onClick={() => { }}
              label={session ? 'Private' : 'Draft'}
            >
              <Button
                size="navAction"
                variant="navAction"
                className="size-[22px] opacity-80 transition-opacity hover:opacity-100"
                onClick={onCreate}
                tooltip="Create a new page"
                tooltipContentProps={{
                  side: 'right',
                }}
              >
                <Icons.plus variant="muted" className="size-3.5" />
              </Button>
            </NavItem>
            <NavItem
              className="text-xs transition-colors"
              onClick={() => { }}
              label="Feedback"
              icon={Icons.alertCircle}
              tooltip="Leave us some feedback"
            >
              <FeedbackForm />
            </NavItem>
            <NavItem
              className="text-xs transition-colors"
              onClick={() => { }}
              label="Bank Account"
              icon={Icons.chrome}
            >
              <ConnectTransactionsButton
                userId={session?.userId ?? ''}
                redirectTo={routes.financialOverview()}
                buttonProps={{
                  variant: 'secondary',
                  size: 'xs',
                  className: cn('h-6 gap-1 rounded-full px-2 text-xs'),
                }}
              />
            </NavItem>
            <NavItem
              className="text-xs transition-colors"
              onClick={() => { }}
              label="Bank Account"
              icon={Icons.chrome}
            >
              <SelectBankAccountsButton
                userId={session?.userId ?? ''}
                teamId={currentUser?.teamId ?? ''}
                buttonProps={{
                  variant: 'secondary',
                  size: 'xs',
                }}
              />
            </NavItem>

            <DocumentList />
          </div>

          <div className="flex flex-col gap-0.5">
            <NavItem
              className="text-sm transition-colors"
              label="Editor"
              href={routes.editor()}
              icon={Icons.editor}
            />

            {/* <NavItem
              label="Templates"
              href="https://pro.platejs.org/docs/templates/potion"
              icon={Icons.templates}
            /> */}

            {mounted ? (
              <Popover>
                <PopoverTrigger
                  asChild
                  className="w-full"
                  onClick={(e) => {
                    if (authGuard()) {
                      e.preventDefault();
                    }
                  }}
                >
                  <NavItem
                    className="text-sm transition-colors"
                    label="Trash"
                    icon={Icons.trash}
                    tooltip="Restore deleted pages"
                  />
                </PopoverTrigger>

                <PopoverContent
                  className="h-[50vh] max-h-[70vh] w-72 p-0 shadow-md"
                  align="start"
                  side={isMobile ? 'bottom' : 'right'}
                >
                  <TrashBox />
                </PopoverContent>
              </Popover>
            ) : (
              <NavItem loading />
            )}
          </div>
        </div>

        {/* Settings section at the bottom */}
        <div className="mt-auto mb-2 flex flex-col gap-0.5 pt-4">
          <div className="mb-1 px-1.5 text-xs font-medium text-muted-foreground/70">
            Settings
          </div>
          <NavItem
            className="text-sm transition-colors"
            onClick={() => {
              authGuard(() => {
                pushModal('Settings');
              });
            }}
            label="Account"
            icon={Icons.user}
            tooltip="Manage your account"
          />
          <NavItem
            className="text-sm transition-colors"
            onClick={() => {
              authGuard(() => {
                pushModal('Settings');
              });
            }}
            label="Preferences"
            icon={Icons.settings}
            tooltip="Configure application settings"
          />
          <NavItem
            className="text-sm transition-colors"
            onClick={() => {
              authGuard(() => {
                pushModal('Export');
              });
            }}
            label="Export"
            icon={Icons.info}
            tooltip="Export your documents"
          />
        </div>
      </div>
    </aside>
  );
}

const CloseButton = () => {
  const toggle = useToggleLeftPanel();

  return (
    <Button
      size="navAction"
      variant="nav"
      className="group/button size-[26px] opacity-90 transition-colors duration-200 hover:bg-muted/70"
      onClick={() => toggle()}
      tooltip="Close sidebar"
      tooltipContentProps={{
        side: 'right',
      }}
    >
      <Icons.chevronsLeft
        variant="muted"
        className="size-4 transition-opacity duration-300 group-hover/button:text-muted-foreground group-hover/sidebar:opacity-100 md:opacity-80"
      />
    </Button>
  );
};
