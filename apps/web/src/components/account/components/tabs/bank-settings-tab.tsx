/**
 * Bank Settings Tab
 *
 * This component allows users to configure settings related to their bank
 * accounts, including sync preferences, notifications, and display options.
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Eye, EyeOff, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/registry/default/potion-ui/button';

// Define the form schema
const bankSettingsSchema = z.object({
  balanceAlerts: z.boolean(),
  categorizeAutomatically: z.boolean(),
  defaultCurrency: z.string(),
  hideBalances: z.boolean(),
  lowBalanceThreshold: z.number().min(0).max(10_000),
  syncFrequency: z.enum(['daily', 'weekly', 'manual']),
  transactionNotifications: z.boolean(),
});

type BankSettingsFormValues = z.infer<typeof bankSettingsSchema>;

interface BankSettingsProps {
  userId: string;
}

export function BankSettings({ userId }: BankSettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<BankSettingsFormValues>({
    defaultValues: {
      balanceAlerts: true,
      categorizeAutomatically: true,
      defaultCurrency: 'USD',
      hideBalances: false,
      lowBalanceThreshold: 100,
      syncFrequency: 'daily',
      transactionNotifications: true,
    },
    resolver: zodResolver(bankSettingsSchema),
  });

  // Fetch user settings
  const { data: userSettings, isLoading: isLoadingSettings } =
    // api.bankAccounts.getSettings.useQuery();
    { data: form.getValues(), isLoading: false };

  // Update form values when settings are loaded
  useEffect(() => {
    if (userSettings) {
      form.reset({
        balanceAlerts: userSettings.balanceAlerts,
        categorizeAutomatically: userSettings.categorizeAutomatically,
        defaultCurrency: userSettings.defaultCurrency,
        hideBalances: userSettings.hideBalances,
        lowBalanceThreshold: userSettings.lowBalanceThreshold,
        syncFrequency: userSettings.syncFrequency,
        transactionNotifications: userSettings.transactionNotifications,
      });
    }
  }, [userSettings, form]);

  // Save settings mutation
  const saveSettingsMutation = {
    mutate: (values: BankSettingsFormValues) => {
      // Mock implementation
      console.log('Saving settings:', values);
      toast.success('Settings saved successfully');
      setIsLoading(false);
    },
  };
  // api.bankAccounts.saveSettings.useMutation({

  // Handle form submission
  const onSubmit = (values: BankSettingsFormValues) => {
    setIsLoading(true);
    setError(null);
    saveSettingsMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xl font-bold tracking-tight">Bank Settings</h3>
            <p className="text-muted-foreground">
              Configure your bank account preferences and notifications
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingSettings ? (
          <div className="py-6 text-center text-muted-foreground">
            Loading settings...
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sync Frequency */}
                <FormField
                  name="syncFrequency"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary/60" />
                        Sync Frequency
                      </FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sync frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often your transactions should be automatically
                        synced
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Default Currency */}
                <FormField
                  name="defaultCurrency"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Currency used for display when not specified
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Transaction Notifications */}
              <FormField
                name="transactionNotifications"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary/60" />
                        Transaction Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive notifications for new transactions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Balance Alerts */}
              <FormField
                name="balanceAlerts"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Low Balance Alerts</FormLabel>
                      <FormDescription>
                        Receive alerts when your account balance falls below the
                        threshold
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Low Balance Threshold - only shown if balance alerts are enabled */}
              {form.watch('balanceAlerts') && (
                <FormField
                  name="lowBalanceThreshold"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Balance Threshold</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="mr-2">$</span>
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        You'll receive an alert when your balance falls below
                        this amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Hide Balances */}
              <FormField
                name="hideBalances"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        {field.value ? (
                          <EyeOff className="h-4 w-4 text-primary/60" />
                        ) : (
                          <Eye className="h-4 w-4 text-primary/60" />
                        )}
                        Hide Account Balances
                      </FormLabel>
                      <FormDescription>
                        Hide your account balances for privacy
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Auto-categorize Transactions */}
              <FormField
                name="categorizeAutomatically"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-categorize Transactions</FormLabel>
                      <FormDescription>
                        Automatically categorize transactions based on merchant
                        and description
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                className="w-full sm:w-auto"
                disabled={isLoading || !form.formState.isDirty}
                type="submit"
              >
                {isLoading && <Save className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
