'use client';

import {
  useAppSet,
  useAppState,
  useAppValue,
} from '@/components/providers/app-provider';

import { AlertDialog } from '@/components/ui/alert-dialog';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { DiscardModal } from '@/components/modals/discard-modal';
import { ExportDialog } from '../navbar/export-dialog';
import { ImportDialog } from '../navbar/import-dialog';
import { LoginModal } from '@/components/auth/login-modal';
import { SettingsModal } from './settings-modal';
import { VersionHistoryModal } from '@/components/context-panel/version-history/version-history-modal';
import { createPushModal } from '@/components/modals/push-modal';
import { useEffect } from 'react';
import { useMounted } from '@/registry/default/hooks/use-mounted';

export const {
  ModalProvider,
  popAllModals,
  popModal,
  pushModal,
  useOnPushModal,
} = createPushModal({
  modals: {
    Confirm: { Component: ConfirmModal, Wrapper: AlertDialog as any },
    Discard: { Component: DiscardModal, Wrapper: AlertDialog as any },
    Export: ExportDialog,
    Import: ImportDialog,
    Login: LoginModal,
    Settings: SettingsModal,
    VersionHistory: VersionHistoryModal,
  },
});

export const StaticModalProvider = () => {
  const isStatic = useAppValue('isStatic');

  if (!isStatic) return null;

  return <ModalProvider />;
};

function DynamicModal() {
  const mounted = useMounted();
  const setIsDynamic = useAppSet('isDynamic');

  useEffect(() => {
    if (mounted) {
      setIsDynamic(true);
    }
  }, [mounted, setIsDynamic]);

  return <ModalProvider />;
}

export const DynamicModalProvider = () => {
  const [isStatic, setIsStatic] = useAppState('isStatic');

  useEffect(() => {
    setIsStatic(false);
  }, [setIsStatic]);

  if (isStatic) return null;

  return <DynamicModal />;
};
