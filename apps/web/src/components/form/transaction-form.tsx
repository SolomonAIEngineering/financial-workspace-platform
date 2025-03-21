'use client';

import * as React from 'react';

import { CalendarIcon, Loader2 } from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { Calendar } from '@/registry/default/potion-ui/calendar';
import { Input } from '@/registry/default/potion-ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/registry/default/potion-ui/textarea';
import { TransactionCategory } from '@solomonai/prisma/client';
import { api } from '@/trpc/react';
import { format } from 'date-fns';
import { useCreateTransaction } from '@/trpc/hooks/transaction-hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the form schema based on the transaction schema
const formSchema = z.object({
  bankAccountId: z.string({
    required_error: 'Please select a bank account',
  }),
  amount: z.number().min(-1000000).max(1000000),
  date: z.date({
    required_error: 'Please select a date',
  }),
  name: z.string().min(1, {
    message: 'Transaction name is required',
  }),
  merchantName: z.string().optional(),
  description: z.string().optional(),
  pending: z.boolean().default(false),
  category: z.nativeEnum(TransactionCategory).optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<FormValues>;
  submitLabel?: string;
}

export function TransactionForm({
  onCancel,
  onSuccess,
  initialData,
  submitLabel = 'Create Transaction',
}: TransactionFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: isLoadingBankAccounts } =
    api.bankAccounts.getAll.useQuery();

  // Create transaction mutation
  const createTransaction = useCreateTransaction();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      name: '',
      merchantName: '',
      description: '',
      pending: false,
      tags: [],
      ...initialData,
    },
  });

  // Set the first bank account as default when loaded
  useEffect(() => {
    if (
      bankAccounts &&
      bankAccounts.length > 0 &&
      !form.getValues().bankAccountId
    ) {
      form.setValue('bankAccountId', bankAccounts[0].id);
    }
  }, [bankAccounts, form]);

  // Initialize tags from initialData if provided
  useEffect(() => {
    if (initialData?.tags && initialData.tags.length > 0) {
      setSelectedTags(initialData.tags);
    }
  }, [initialData]);

  // Handle form submission
  function onSubmit(data: FormValues) {
    // Format the data for the mutation
    const transactionData = {
      ...data,
      date: format(data.date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      amount: data.amount,
      tags: selectedTags,
    };

    createTransaction.mutate(transactionData, {
      onSuccess: () => {
        // Reset form with explicit default values to prevent controlled/uncontrolled switch
        form.reset({
          amount: 0,
          date: new Date(),
          name: '',
          merchantName: '',
          description: '',
          pending: false,
          tags: [],
          bankAccountId: bankAccounts?.[0]?.id || '',
        });
        setSelectedTags([]);

        // Call onSuccess callback
        onSuccess();
      },
    });
  }

  // Handle adding a new tag
  const handleAddTag = () => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      setSelectedTags([...selectedTags, tagInput]);
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Bank Account */}
          <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
              <FormItem className="transition-all duration-200 sm:col-span-2">
                <FormLabel className="text-sm font-medium">
                  Bank Account
                </FormLabel>
                <Select
                  disabled={isLoadingBankAccounts}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900">
                      <SelectValue placeholder="Select a bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-neutral-200 shadow-md dark:border-neutral-800">
                    {isLoadingBankAccounts ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      bankAccounts?.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id}
                          className="focus:bg-neutral-100 dark:focus:bg-neutral-800"
                        >
                          {account.name} ({account.type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="transition-all duration-200">
                <FormLabel className="text-sm font-medium">Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      className="h-11 border-neutral-200 bg-neutral-50 pl-6 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                      placeholder="0.00"
                      value={field.value ?? 0}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? 0
                            : parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Use negative values for expenses, positive for income
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col transition-all duration-200">
                <FormLabel className="text-sm font-medium">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="h-11 w-full border-neutral-200 bg-neutral-50 pl-3 text-left font-normal shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span className="text-muted-foreground">
                            Select transaction date
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground opacity-70" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto border-neutral-200 p-0 shadow-md dark:border-neutral-800"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transaction Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="transition-all duration-200 sm:col-span-2">
                <FormLabel className="text-sm font-medium">
                  Transaction Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Monthly Subscription"
                    {...field}
                    className="h-11 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Merchant Name */}
          <FormField
            control={form.control}
            name="merchantName"
            render={({ field }) => (
              <FormItem className="transition-all duration-200 sm:col-span-2">
                <FormLabel className="text-sm font-medium">
                  Merchant Name{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Netflix"
                    {...field}
                    className="h-11 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="transition-all duration-200">
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-neutral-200 shadow-md dark:border-neutral-800">
                    {Object.values(TransactionCategory).map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="focus:bg-neutral-100 dark:focus:bg-neutral-800"
                      >
                        {category.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="transition-all duration-200">
                <FormLabel className="text-sm font-medium">
                  Payment Method{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Credit Card"
                    {...field}
                    className="h-11 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="transition-all duration-200 sm:col-span-2">
                <FormLabel className="text-sm font-medium">
                  Description{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional details about this transaction"
                    className="min-h-[100px] w-full resize-y border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pending Status */}
          <FormField
            control={form.control}
            name="pending"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0 space-x-3 rounded-lg border p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 sm:col-span-2 dark:hover:border-neutral-700">
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">
                    Pending Transaction
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Mark as pending if the transaction has not settled
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="transition-all data-[state=checked]:bg-primary"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Tags */}
          <div className="space-y-2 rounded-lg border p-4 transition-all duration-200 hover:border-neutral-300 sm:col-span-2 dark:hover:border-neutral-700">
            <FormLabel className="text-sm font-medium">
              Tags{' '}
              <span className="text-xs font-normal text-muted-foreground">
                (Optional)
              </span>
            </FormLabel>

            <div className="mb-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 rounded-full p-0 hover:bg-neutral-300 hover:text-neutral-800 dark:hover:bg-neutral-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="h-10 border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="min-w-[100px] transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createTransaction.isPending}
            className="min-w-[180px] transition-all"
          >
            {createTransaction.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
