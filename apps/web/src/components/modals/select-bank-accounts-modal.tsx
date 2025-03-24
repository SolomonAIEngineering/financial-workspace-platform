'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/registry/default/potion-ui/avatar';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Tabs, TabsContent } from '@/registry/default/potion-ui/tabs';
import { useEffect, useState } from 'react';

import { APIFinancialAccountListResponse } from '@solomon-ai/workspace-financial-backend-sdk/resources/api-financial-accounts.js';
import { Button } from '@/registry/default/potion-ui/button';
import { DialogContent } from '@/registry/default/potion-ui/dialog';
import { FormatAmount } from '../format-amount';
import { LoadingTransactionsEvent } from '../events/loading-transaction-event';
import { Skeleton } from '../ui/skeleton';
import { Switch } from '../ui/switch';
import { Textarea } from '@/registry/default/potion-ui/textarea';
import { bankConnectionSchema } from '@/actions/bank/schema';
import { engine } from '@/lib/engine';
import { getInitials } from '@/lib/utils';
import { handleBankConnectionAction } from '@/actions/bank/bank-connection';
import { sendSupportAction } from '@/actions/support/send-support-action';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
  subtype: string;
  mask: string;
  institution: {
    id: string;
    name: string;
  };
};

function RowsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-[210px] rounded-none" />
          <Skeleton className="h-2.5 w-[180px] rounded-none" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-[250px] rounded-none" />
          <Skeleton className="h-2.5 w-[200px] rounded-none" />
        </div>
      </div>
    </div>
  );
}

function SupportForm() {
  const form = useForm({
    resolver: zodResolver(z.object({ message: z.string() })),
    defaultValues: {
      message: '',
    },
  });

  const sendSupport = useAction(sendSupportAction, {
    onSuccess: () => {
      form.reset();
    },
  });

  const handleOnSubmit = form.handleSubmit((values) => {
    sendSupport.execute({
      message: values.message,
      type: 'bank-connection',
      priority: 'high',
      subject: 'Select bank accounts',
      url: document.URL,
    });
  });

  if (sendSupport.status === 'hasSucceeded') {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center space-y-1">
        <p className="text-sm font-medium">Thank you!</p>
        <p className="text-sm text-[#4C4C4C]">
          We will be back with you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleOnSubmit}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
                  className="min-h-[150px] resize-none"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              sendSupport.status === 'executing' || !form.formState.isValid
            }
            className="mt-4"
          >
            {sendSupport.status === 'executing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface SelectBankAccountsModalProps {
  isOpen: boolean;
  onClose: (syncCompleted?: boolean) => void;
  provider: string;
  ref: string;
  institution_id: string;
  token: string;
  itemId: string;
  userId: string;
  teamId: string;
}

export function SelectBankAccountsModal({
  isOpen,
  onClose,
  provider,
  ref,
  institution_id,
  token,
  itemId,
  userId,
  teamId,
}: SelectBankAccountsModalProps) {
  const [accounts, setAccounts] = useState<
    APIFinancialAccountListResponse.Data[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [runId, setRunId] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();
  const [activeTab, setActiveTab] = useState<
    'select-accounts' | 'loading' | 'support'
  >('select-accounts');
  const [syncCompleted, setSyncCompleted] = useState(false);

  const connectBankAction = useAction(handleBankConnectionAction, {
    onError: () => {
      toast.error('Something went wrong please try again.');
    },
    onSuccess: ({ data }) => {
      if (data?.id) {
        setRunId(data.id);
        setAccessToken(data.publicAccessToken);
        setActiveTab('loading');
      }
    },
  });

  const form = useForm<z.infer<typeof bankConnectionSchema>>({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      accounts: [],
    },
  });

  async function onSubmit(values: z.infer<typeof bankConnectionSchema>) {
    connectBankAction.execute(values);
  }

  useEffect(() => {
    async function fetchData() {
      const { data } = await engine.apiFinancialAccounts.list({
        provider: provider as 'teller' | 'plaid' | 'gocardless' | 'stripe',
        id: ref ?? undefined,
        accessToken: token ?? undefined,
        institutionId: institution_id ?? undefined,
      });

      console.log('data', data);

      setAccounts(data);
      setLoading(false);

      if (!form.formState.isValid) {
        form.reset({
          provider: provider as 'gocardless' | 'plaid' | 'teller' | 'stripe',
          accessToken: token ?? undefined,
          itemId: itemId ?? undefined,
          userId: userId ?? undefined,
          teamId: teamId ?? undefined,
          accounts: data.map((account) => ({
            name: account.name,
            institution_id: account.institution.id,
            logo_url: account.institution?.logo,
            account_id: account.id,
            account_reference: account.id,
            bank_name: account.institution.name,
            // TODO: Remove once we have a fix and return currency from engine
            currency: account.currency ?? account.balance.currency,
            balance: account.balance.amount,
            enabled: true,
            type: account.type,
          })),
        });
      }
    }

    if (isOpen && !accounts.length) {
      fetchData();
    }
  }, [isOpen, provider, form, accounts, ref, token, institution_id, itemId]);

  // Custom wrapper for onClose to track sync completion
  const handleClose = () => {
    onClose(syncCompleted);
  };

  // Custom wrapper for LoadingTransactionsEvent to track completion
  const handleSyncComplete = () => {
    setSyncCompleted(true);
    handleClose();
  };

  // Function to handle active tab changes
  const handleActiveTabChange = (
    value: 'support' | 'loading' | 'select-accounts'
  ) => {
    setActiveTab(value);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="p-4">
          <Tabs defaultValue="select-accounts" value={activeTab}>
            <TabsContent value="select-accounts">
              <>
                <DialogHeader className="mb-8">
                  <DialogTitle>Select Accounts</DialogTitle>
                  <DialogDescription>
                    Select the accounts to receive transactions. You can enable
                    or disable them later in settings if needed. Note: Initial
                    loading may take some time.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="relative scrollbar-hide h-[300px] space-y-6 overflow-auto pb-[100px]"
                  >
                    {loading && <RowsSkeleton />}

                    {accounts.map((account) => (
                      <FormField
                        key={account.id}
                        control={form.control}
                        name="accounts"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={account.id}
                              className="flex justify-between"
                            >
                              <FormLabel className="mr-8 flex w-full items-center space-x-4">
                                <Avatar className="size-[34px]">
                                  <AvatarFallback className="text-[11px]">
                                    {getInitials(account.name)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex w-full items-center justify-between">
                                  <div className="flex flex-col">
                                    <p className="mb-1 text-sm leading-none font-medium">
                                      {account.name}
                                    </p>
                                    <span className="text-xs font-normal text-[#878787]">
                                      {account.type}
                                    </span>
                                  </div>

                                  <span className="text-sm text-[#878787]">
                                    <FormatAmount
                                      amount={account.balance.amount}
                                      currency={account.balance.currency}
                                    />
                                  </span>
                                </div>
                              </FormLabel>

                              <div>
                                <FormControl>
                                  <Switch
                                    checked={
                                      field.value.find(
                                        (value) =>
                                          value.account_id === account.id
                                      )?.enabled
                                    }
                                    onCheckedChange={(checked) => {
                                      return field.onChange(
                                        field.value.map((value) => {
                                          if (value.account_id === account.id) {
                                            return {
                                              ...value,
                                              enabled: checked,
                                            };
                                          }

                                          return value;
                                        })
                                      );
                                    }}
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}

                    <div className="fixed right-0 bottom-0 left-0 z-10 bg-background px-6 pt-4 pb-6">
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={
                          connectBankAction.status === 'executing' ||
                          !form
                            .getValues('accounts')
                            .find((account) => account.enabled)
                        }
                      >
                        {connectBankAction.status === 'executing' ? (
                          <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>

                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          className="text-xs text-[#878787]"
                          onClick={() => setActiveTab('support')}
                        >
                          Need support
                        </button>
                      </div>
                    </div>
                  </form>
                </Form>
              </>
            </TabsContent>

            <TabsContent value="loading">
              <LoadingTransactionsEvent
                accessToken={accessToken}
                runId={runId}
                setRunId={setRunId}
                onClose={handleSyncComplete}
                setActiveTab={handleActiveTabChange}
              />
            </TabsContent>

            <TabsContent value="support">
              <div className="mb-6 flex items-center space-x-3">
                <button
                  type="button"
                  className="items-center border bg-accent p-1"
                  onClick={() => setActiveTab('select-accounts')}
                >
                  <ArrowLeft />
                </button>
                <h2>Support</h2>
              </div>
              <SupportForm />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
