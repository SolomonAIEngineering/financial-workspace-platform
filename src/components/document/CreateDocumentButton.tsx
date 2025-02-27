import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { routes } from '@/lib/navigation/routes';
import { type ButtonProps, Button } from '@/registry/default/potion-ui/button';
import { api, useTRPC } from '@/trpc/react';

import { useAuthGuard } from '../auth/useAuthGuard';
import { Icons } from '../ui/icons';

interface CreateDocumentButtonProps extends ButtonProps {
  icon?: boolean;
  label?: string;
  onSuccess?: (documentId: string) => void;
}

export function CreateDocumentButton({
  children,
  icon = true,
  label = 'New Document',
  onSuccess,
  ...props
}: CreateDocumentButtonProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
    },
  });
  const authGuard = useAuthGuard();

  const onCreate = () => {
    authGuard(() => {
      const promise = createDocument.mutateAsync({}).then((document) => {
        if (onSuccess) {
          onSuccess(document.id);
        } else {
          router.push(routes.document({ documentId: document.id }));
        }
      });

      toast.promise(promise, {
        error: 'Failed to create a new document!',
        loading: 'Creating a new document...',
        success: 'New document created.',
      });
    });
  };

  return (
    <Button onClick={onCreate} {...props}>
      {icon && <Icons.newPage variant="primary" className="mr-2 size-4" />}
      {label}
      {children}
    </Button>
  );
}
