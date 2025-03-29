'use client';

import { ArrowLeft, BanknoteIcon, Check, Loader2, Search } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
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
import { Input } from '@/registry/default/potion-ui/input';
import { LoadingTransactionsEvent } from '../events/loading-transaction-event';
import { Skeleton } from '../ui/skeleton';
import { Switch } from '../ui/switch';
import { Textarea } from '@/registry/default/potion-ui/textarea';
import { bankConnectionSchema } from '@/actions/bank/schema';
import { engine } from '@/lib/engine';
import { getInitials } from '@/lib/utils';
import { handleBankConnectionAction } from '@/actions/bank/bank-connection';
import { motion } from 'framer-motion';
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

// Account type badges with colors based on account type
const AccountTypeBadge = ({ type }: { type: string }) => {
  const typeColorMap: Record<
    string,
    { bg: string; text: string; icon?: React.ReactNode }
  > = {
    CHECKING: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: <BanknoteIcon className="mr-1 h-3 w-3" />,
    },
    SAVINGS: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: <BanknoteIcon className="mr-1 h-3 w-3" />,
    },
    CREDIT: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
    INVESTMENT: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    LOAN: {
      bg: 'bg-red-50',
      text: 'text-red-700',
    },
    // Default case
    DEFAULT: { bg: 'bg-zinc-50', text: 'text-zinc-700' },
  };

  const { bg, text, icon } = typeColorMap[type] || typeColorMap.DEFAULT;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {icon}
      {type.toLowerCase().replace('_', ' ')}
    </span>
  );
};

function RowsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div key={index} className="rounded-xl border border-zinc-100 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[60%] rounded-md" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-[30%] rounded-full" />
                <Skeleton className="h-3 w-[20%] rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      ))}
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-[250px] flex-col items-center justify-center space-y-3 rounded-xl bg-zinc-50/50 p-8"
      >
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-lg font-semibold text-black">Thank you!</p>
        <p className="max-w-xs text-center text-sm text-zinc-600">
          We will be back with you as soon as possible.
        </p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleOnSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-zinc-800">
                Message
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
                  className="min-h-[150px] w-full resize-none rounded-xl border-zinc-200 p-[2%] transition-all focus:border-black focus:ring-1 focus:ring-black"
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
            className="mt-4 rounded-xl bg-black px-6 py-2.5 text-white shadow-lg shadow-black/5 transition-colors hover:bg-zinc-800 hover:shadow-black/10"
          >
            {sendSupport.status === 'executing' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
  pathname: string;
}

export function SelectBankAccountsModal({
  isOpen,
  onClose,
  provider = 'plaid',
  ref,
  institution_id = 'ins_127991',
  token = 'access-production-44a2eed4-de7a-45cc-9f68-d8e3c9cf7976',
  itemId = 'kPLLLo7YMAumyL9wRgPQfeVJjjay8BFRRmvpB',
  userId,
  teamId,
  pathname,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const connectBankAction = useAction(handleBankConnectionAction, {
    onError: (error) => {
      setIsSubmitting(false);
      toast.error('Something went wrong. Please try again.');
    },
    onSuccess: ({ data }) => {
      setIsSubmitting(false);
      setActiveTab('loading');

      // Set the runId and accessToken from the response data if available
      if (data?.id) {
        if (data?.id) {
          toast.success('Accounts connected successfully!');
          setRunId(data.id);
          setAccessToken(data.publicAccessToken);
          setActiveTab('loading');
        }
      } else {
        console.warn('⚠️ No runId found in response:', data);
      }
    },
  });

  const form = useForm<z.infer<typeof bankConnectionSchema>>({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      accounts: [],
      provider: provider as 'gocardless' | 'plaid' | 'teller' | 'stripe',
      accessToken: token ?? '',
      itemId: itemId ?? '',
      userId: userId ?? '',
      teamId: teamId ?? '',
    },
  });

  // Update selected count whenever form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.accounts && Array.isArray(value.accounts)) {
        const count = value.accounts.filter(
          (account) => account?.enabled
        ).length;
        setSelectedCount(count);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof bankConnectionSchema>) {
    try {
      setIsSubmitting(true);

      // Make sure we have at least one enabled account
      let enabledAccounts: any[] = [];
      try {
        if (values.accounts && Array.isArray(values.accounts)) {
          enabledAccounts = values.accounts.filter(
            (account: any) => account?.enabled
          );
        } else {
          console.error(
            'accounts is not an array or is undefined',
            values.accounts
          );
        }
      } catch (err) {
        console.error('Error filtering enabled accounts:', err);
      }

      if (!enabledAccounts.length) {
        console.warn('No enabled accounts found');
        toast.error('Please select at least one account');
        setIsSubmitting(false);
        return;
      }

      // Ensure we have all required fields before submitting
      if (!values.provider || (!values.accessToken && !values.itemId)) {
        console.error('Missing required fields:', {
          provider: values.provider,
          accessToken: values.accessToken,
          itemId: values.itemId,
        });
        toast.error('Missing required connection information');
        setIsSubmitting(false);
        return;
      }

      await connectBankAction.execute(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      toast.error('An unexpected error occurred. Please try again.');
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await engine.apiFinancialAccounts.list({
          provider: provider as 'teller' | 'plaid' | 'gocardless' | 'stripe',
          id: ref ?? undefined,
          accessToken: token ?? undefined,
          institutionId: institution_id ?? undefined,
        });

        setAccounts(data);
        setLoading(false);

        // Always reset the form with fresh data
        form.reset({
          provider: provider as 'gocardless' | 'plaid' | 'teller' | 'stripe',
          accessToken: token ?? '',
          itemId: itemId ?? '',
          userId: userId ?? '',
          teamId: teamId ?? '',
          institutionId: institution_id ?? '',
          accounts: data.map((account) => ({
            name: account.name,
            institution_id: account.institution.id,
            logo_url: account.institution?.logo,
            account_id: account.id,
            account_reference: account.id,
            bank_name: account.institution.name,
            currency: account.currency ?? account.balance.currency,
            balance: account.balance.amount,
            enabled: true,
            type: account.type,
          })),
        });

        // Initial count of enabled accounts
        setSelectedCount(data.length);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setLoading(false);
        toast.error('Failed to load accounts. Please try again.');
      }
    }

    if (isOpen && !accounts.length) {
      void fetchData();
    }
  }, [
    isOpen,
    provider,
    form,
    ref,
    token,
    institution_id,
    itemId,
    userId,
    teamId,
  ]);

  // Toggle all accounts selection
  const toggleAllAccounts = (enabled: boolean) => {
    const currentAccounts = form.getValues('accounts');
    form.setValue(
      'accounts',
      currentAccounts.map((account) => ({ ...account, enabled }))
    );
  };

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

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.institution.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
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
        className="max-w-md overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] transition-all"
      >
        <div className="p-6 sm:p-8">
          <Tabs defaultValue="select-accounts" value={activeTab}>
            <TabsContent value="select-accounts" className="mt-0">
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-black">
                    Select Accounts
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm text-zinc-600">
                    Choose the accounts you want to connect. You can enable or
                    disable them later in settings.
                  </DialogDescription>
                </DialogHeader>

                {/* Search input */}
                <div className="relative mb-4">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border-zinc-200 py-2.5 pl-10 text-sm focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Account selection controls */}
                <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="text-sm text-zinc-700">
                    <span className="font-semibold">{selectedCount}</span> of{' '}
                    <span className="font-semibold">{accounts.length}</span>{' '}
                    selected
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllAccounts(true)}
                      className="h-auto rounded-lg border-zinc-200 py-1 text-xs hover:bg-zinc-50"
                    >
                      Select all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllAccounts(false)}
                      className="h-auto rounded-lg border-zinc-200 py-1 text-xs hover:bg-zinc-50"
                    >
                      Deselect all
                    </Button>
                  </div>
                </div>

                <Form {...form}>
                  {/* Remove the form tag structure as it may be causing issues with the nested forms */}
                  <div className="relative scrollbar-hide h-[350px] overflow-auto px-1 pb-[100px]">
                    {loading && <RowsSkeleton />}

                    {accounts.length === 0 && !loading && (
                      <div className="flex h-32 flex-col items-center justify-center text-center">
                        <p className="mb-2 text-zinc-500">No accounts found</p>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('support')}
                          className="mt-2 rounded-lg border-zinc-200 text-xs"
                        >
                          Contact Support
                        </Button>
                      </div>
                    )}

                    {filteredAccounts.length === 0 &&
                      searchQuery &&
                      !loading && (
                        <div className="flex h-32 flex-col items-center justify-center text-center">
                          <p className="mb-2 text-zinc-500">
                            No matching accounts found
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                            className="mt-2 rounded-lg border-zinc-200 text-xs"
                          >
                            Clear Search
                          </Button>
                        </div>
                      )}

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-3"
                    >
                      {filteredAccounts.map((account, index) => (
                        <FormField
                          key={account.id}
                          control={form.control}
                          name="accounts"
                          render={({ field }) => {
                            const isEnabled = field.value.find(
                              (value) => value.account_id === account.id
                            )?.enabled;

                            return (
                              <motion.div
                                variants={itemVariants}
                                layoutId={`account-${account.id}`}
                              >
                                <FormItem
                                  className={`flex flex-row items-center rounded-xl border p-4 transition-all duration-200 hover:bg-zinc-50 ${isEnabled ? 'border-black/10 bg-black/[0.02]' : 'border-zinc-100'} hover:border-zinc-200 ${isEnabled ? 'shadow-sm' : ''}`}
                                >
                                  <FormLabel className="mr-4 flex w-full cursor-pointer items-center space-x-4">
                                    <Avatar className="size-[42px] border border-zinc-100 shadow-sm">
                                      {account.institution?.logo && (
                                        <AvatarImage
                                          src={account.institution.logo}
                                          alt={account.institution.name}
                                          className="object-cover"
                                        />
                                      )}
                                      <AvatarFallback className="bg-gradient-to-b from-zinc-50 to-zinc-100 text-[12px] text-zinc-800">
                                        {getInitials(account.name)}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex w-full items-center justify-between">
                                      <div className="flex flex-col">
                                        <p className="mb-1 text-sm font-medium text-black">
                                          {account.name}
                                        </p>
                                        <AccountTypeBadge type={account.type} />
                                      </div>

                                      <span
                                        className={`text-sm font-medium ${isEnabled ? 'text-black' : 'text-zinc-700'}`}
                                      >
                                        <FormatAmount
                                          amount={account.balance.amount}
                                          currency={account.balance.currency}
                                        />
                                      </span>
                                    </div>
                                  </FormLabel>

                                  <div className="flex items-center">
                                    <FormControl>
                                      <Switch
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => {
                                          return field.onChange(
                                            field.value.map((value) => {
                                              if (
                                                value.account_id === account.id
                                              ) {
                                                return {
                                                  ...value,
                                                  enabled: checked,
                                                };
                                              }

                                              return value;
                                            })
                                          );
                                        }}
                                        className="data-[state=checked]:bg-black"
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              </motion.div>
                            );
                          }}
                        />
                      ))}
                    </motion.div>

                    <div className="bg-opacity-98 fixed right-0 bottom-0 left-0 z-10 border-t border-zinc-100 bg-white px-8 pt-6 pb-8 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.08)] backdrop-blur-lg">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm text-zinc-600">
                          {selectedCount > 0 ? (
                            <span>
                              Connecting{' '}
                              <span className="font-medium">
                                {selectedCount}
                              </span>{' '}
                              {selectedCount === 1 ? 'account' : 'accounts'}
                            </span>
                          ) : (
                            <span className="text-amber-600">
                              Select at least one account
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        className={`w-full rounded-xl py-3 text-sm font-medium shadow-xl transition-all ${selectedCount > 0
                          ? 'transform bg-black text-white shadow-black/5 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-black/10'
                          : 'cursor-not-allowed bg-zinc-100 text-zinc-400'
                          }`}
                        type="button"
                        onClick={async () => {
                          // Call onSubmit directly with the current form values
                          const values = form.getValues();
                          // Force validation and then submit
                          await form.trigger().then(async (isValid) => {
                            if (isValid) {
                              await onSubmit(values);
                            } else {
                              console.error(
                                'Form validation failed:',
                                form.formState.errors
                              );
                              toast.error(
                                'Please correct the form errors before submitting'
                              );
                            }
                          });
                        }}
                        disabled={
                          isSubmitting ||
                          connectBankAction.status === 'executing' ||
                          selectedCount === 0
                        }
                      >
                        {isSubmitting ||
                          connectBankAction.status === 'executing' ? (
                          <motion.span
                            className="flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                            Processing...
                          </motion.span>
                        ) : (
                          'Connect Accounts'
                        )}
                      </Button>

                      <div className="mt-4 flex items-center justify-center space-x-3">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900"
                          onClick={() => setActiveTab('support')}
                        >
                          Need help?
                        </Button>
                        <span className="text-zinc-300">•</span>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900"
                          onClick={handleClose}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
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
                pathname={pathname}
              />
            </TabsContent>

            <TabsContent value="support">
              <div className="mb-8 flex items-center space-x-3">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-zinc-100"
                  onClick={() => setActiveTab('select-accounts')}
                >
                  <ArrowLeft className="h-5 w-5 text-zinc-800" />
                </button>
                <h2 className="text-lg font-medium text-black">Support</h2>
              </div>
              <SupportForm />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
