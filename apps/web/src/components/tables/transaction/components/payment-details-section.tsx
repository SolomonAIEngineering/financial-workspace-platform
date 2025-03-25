import * as React from 'react';

import {
  AtSign,
  Banknote,
  Check,
  ChevronDown,
  Coins,
  CreditCard,
  Globe,
  HelpCircle,
  Landmark,
  Loader2,
  Phone,
  Receipt,
  Smartphone,
  Store,
  Wallet,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';

import { Badge } from '@/components/ui/badge';
import { FieldRenderer } from './field-renderer';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';
import { useUpdateTransactionPaymentMethod } from '@/trpc/hooks/transaction-hooks';

// Define payment method options with icons
const paymentMethodOptions = [
  {
    value: 'credit_card',
    label: 'Credit Card',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  },
  {
    value: 'debit_card',
    label: 'Debit Card',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <Landmark className="h-4 w-4" />,
    color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
  },
  {
    value: 'cash',
    label: 'Cash',
    icon: <Banknote className="h-4 w-4" />,
    color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
  },
  {
    value: 'digital_wallet',
    label: 'Digital Wallet',
    icon: <Wallet className="h-4 w-4" />,
    color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20',
  },
  {
    value: 'check',
    label: 'Check',
    icon: <Receipt className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
  {
    value: 'other',
    label: 'Other',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20',
  },
];

// Define payment channel options with icons
const paymentChannelOptions = [
  {
    value: 'in_store',
    label: 'In Store',
    icon: <Store className="h-4 w-4" />,
    color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  },
  {
    value: 'online',
    label: 'Online',
    icon: <Globe className="h-4 w-4" />,
    color: 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20',
  },
  {
    value: 'phone',
    label: 'Phone',
    icon: <Phone className="h-4 w-4" />,
    color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20',
  },
  {
    value: 'mobile_app',
    label: 'Mobile App',
    icon: <Smartphone className="h-4 w-4" />,
    color: 'bg-teal-500/10 text-teal-600 hover:bg-teal-500/20',
  },
  {
    value: 'atm',
    label: 'ATM',
    icon: <Coins className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
  {
    value: 'direct_deposit',
    label: 'Direct Deposit',
    icon: <Landmark className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  },
  {
    value: 'wire',
    label: 'Wire',
    icon: <AtSign className="h-4 w-4" />,
    color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
  },
  {
    value: 'other',
    label: 'Other',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20',
  },
];

/**
 * PaymentDetailsSection - Displays transaction payment details
 *
 * This component handles the display and editing of payment-related
 * information, including payment method, channels, card details, and reference
 * numbers.
 */
export function PaymentDetailsSection() {
  const { transaction, updateTransactionData } = useTransactionContext();
  const updatePaymentMethod = useUpdateTransactionPaymentMethod();
  const [updatingMethod, setUpdatingMethod] = React.useState<string | null>(
    null
  );
  const [updatingChannel, setUpdatingChannel] = React.useState<string | null>(
    null
  );

  const handlePaymentMethodUpdate = (newMethod: string) => {
    if (!transaction.id) return;

    setUpdatingMethod(newMethod);

    updatePaymentMethod.mutate(
      {
        id: transaction.id,
        paymentMethod: newMethod,
        paymentChannel: transaction.paymentChannel || undefined,
      },
      {
        onSuccess: () => {
          // Update the transaction data in the context to reflect the changes immediately
          updateTransactionData({
            paymentMethod: newMethod,
          });
          toast.success(
            `Payment method updated to ${getLabelFromValue(newMethod, paymentMethodOptions)}`
          );
          setUpdatingMethod(null);
        },
        onError: (error) => {
          toast.error(`Failed to update payment method: ${error.message}`);
          console.error('Update payment method error:', error.message);
          setUpdatingMethod(null);
        },
      }
    );
  };

  const handlePaymentChannelUpdate = (newChannel: string) => {
    if (!transaction.id) return;

    setUpdatingChannel(newChannel);

    updatePaymentMethod.mutate(
      {
        id: transaction.id,
        paymentMethod: transaction.paymentMethod || '',
        paymentChannel: newChannel,
      },
      {
        onSuccess: () => {
          // Update the transaction data in the context to reflect the changes immediately
          updateTransactionData({
            paymentChannel: newChannel,
          });
          toast.success(
            `Payment channel updated to ${getLabelFromValue(newChannel, paymentChannelOptions)}`
          );
          setUpdatingChannel(null);
        },
        onError: (error) => {
          toast.error(`Failed to update payment channel: ${error.message}`);
          console.error('Update payment channel error:', error.message);
          setUpdatingChannel(null);
        },
      }
    );
  };

  // Helper function to get display label from value
  const getLabelFromValue = (
    value: string,
    options: { value: string; label: string }[]
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Helper function to get method info from value
  const getMethodInfo = (value: string) => {
    return (
      paymentMethodOptions.find((opt) => opt.value === value) || {
        value,
        label: value,
        icon: <HelpCircle className="h-4 w-4" />,
        color: 'bg-gray-500/10 text-gray-600',
      }
    );
  };

  // Helper function to get channel info from value
  const getChannelInfo = (value: string) => {
    return (
      paymentChannelOptions.find((opt) => opt.value === value) || {
        value,
        label: value,
        icon: <HelpCircle className="h-4 w-4" />,
        color: 'bg-gray-500/10 text-gray-600',
      }
    );
  };

  const renderPaymentMethodField = () => {
    const currentMethod = transaction.paymentMethod;
    const methodInfo = currentMethod ? getMethodInfo(currentMethod) : null;

    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-foreground/70">
          Payment Method
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
              {methodInfo ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
                    {methodInfo.icon}
                  </div>
                  <Badge
                    className={`${methodInfo.color} rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow`}
                  >
                    {methodInfo.label}
                  </Badge>
                </div>
              ) : (
                <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Badge
                    variant="outline"
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-all group-hover:scale-105 group-hover:border-border/50 group-hover:shadow-sm"
                  >
                    <Wallet className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                    Select Payment Method{' '}
                    <ChevronDown className="ml-1.5 h-3 w-3" />
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-60 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <Wallet className="h-4 w-4 text-primary/70" />
              <span>{currentMethod ? 'Update' : 'Set'} Payment Method</span>
            </DropdownMenuLabel>
            <div className="px-1 py-1">
              {paymentMethodOptions.map((method) => (
                <DropdownMenuItem
                  key={method.value}
                  onClick={() => handlePaymentMethodUpdate(method.value)}
                  disabled={updatingMethod !== null}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition-all ${
                    method.value === currentMethod
                      ? `${method.color.split(' ')[0]} font-medium`
                      : 'hover:scale-[1.01] hover:bg-accent/50 focus:bg-accent'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      method.value === currentMethod
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/30'
                    } ${updatingMethod === method.value ? 'animate-pulse' : ''}`}
                  >
                    {updatingMethod === method.value ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      method.icon
                    )}
                  </div>
                  <span className="text-sm">{method.label}</span>
                  {method.value === currentMethod && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderPaymentChannelField = () => {
    const currentChannel = transaction.paymentChannel;
    const channelInfo = currentChannel ? getChannelInfo(currentChannel) : null;

    return (
      <div className="mt-3 flex flex-col space-y-1">
        <span className="text-sm font-medium text-foreground/70">
          Payment Channel
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
              {channelInfo ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
                    {channelInfo.icon}
                  </div>
                  <Badge
                    className={`${channelInfo.color} rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow`}
                  >
                    {channelInfo.label}
                  </Badge>
                </div>
              ) : (
                <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Badge
                    variant="outline"
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-all group-hover:scale-105 group-hover:border-border/50 group-hover:shadow-sm"
                  >
                    <Globe className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                    Select Payment Channel{' '}
                    <ChevronDown className="ml-1.5 h-3 w-3" />
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-60 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <Globe className="h-4 w-4 text-indigo-500/70" />
              <span>{currentChannel ? 'Update' : 'Set'} Payment Channel</span>
            </DropdownMenuLabel>
            <div className="px-1 py-1">
              {paymentChannelOptions.map((channel) => (
                <DropdownMenuItem
                  key={channel.value}
                  onClick={() => handlePaymentChannelUpdate(channel.value)}
                  disabled={updatingChannel !== null}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition-all ${
                    channel.value === currentChannel
                      ? `${channel.color.split(' ')[0]} font-medium`
                      : 'hover:scale-[1.01] hover:bg-accent/50 focus:bg-accent'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      channel.value === currentChannel
                        ? 'border-indigo-400/40 bg-indigo-50/30'
                        : 'border-border/30'
                    } ${updatingChannel === channel.value ? 'animate-pulse' : ''}`}
                  >
                    {updatingChannel === channel.value ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : (
                      channel.icon
                    )}
                  </div>
                  <span className="text-sm">{channel.label}</span>
                  {channel.value === currentChannel && (
                    <Check className="ml-auto h-4 w-4 text-indigo-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <TransactionSection
      title="Payment Details"
      icon={<CreditCard className="h-4 w-4" />}
      defaultOpen={
        !!(
          transaction.paymentMethod ||
          transaction.paymentChannel ||
          transaction.cardType
        )
      }
      tooltip={sectionDescriptions.paymentDetails}
    >
      <div className="space-y-4">
        {/* Interactive payment method and channel fields */}
        <div className="rounded-lg border border-border/10 bg-background p-3 shadow-sm">
          {renderPaymentMethodField()}
          {renderPaymentChannelField()}
        </div>

        {/* Card details */}
        {(transaction.cardType ||
          transaction.cardNetwork ||
          transaction.cardLastFour) && (
          <div className="rounded-lg border border-border/10 bg-background p-3 shadow-sm">
            <SubheadingWithTooltip
              label="Card Information"
              tooltip="Details about the card used for this transaction"
            />
            <div className="mt-2">
              <FieldRenderer field="cardType" label="Card Type" />
              <FieldRenderer field="cardNetwork" label="Card Network" />
              <FieldRenderer field="cardLastFour" label="Last Four" />
            </div>
          </div>
        )}

        {/* Reference numbers */}
        {(transaction.transactionReference ||
          transaction.authorizationCode ||
          transaction.checkNumber ||
          transaction.wireReference ||
          transaction.accountNumber) && (
          <div className="rounded-lg border border-border/10 bg-background p-3 shadow-sm">
            <SubheadingWithTooltip
              label="Reference Information"
              tooltip="Reference numbers and identifiers associated with this transaction"
            />
            <div className="mt-2">
              <FieldRenderer
                field="transactionReference"
                label="Transaction Reference"
                monospace
              />
              <FieldRenderer
                field="authorizationCode"
                label="Authorization Code"
                monospace
              />
              <FieldRenderer
                field="checkNumber"
                label="Check Number"
                monospace
              />
              <FieldRenderer
                field="wireReference"
                label="Wire Reference"
                monospace
              />
              <FieldRenderer
                field="accountNumber"
                label="Account Number"
                monospace
              />
            </div>
          </div>
        )}
      </div>
    </TransactionSection>
  );
}
