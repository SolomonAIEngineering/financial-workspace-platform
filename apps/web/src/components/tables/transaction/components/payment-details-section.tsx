import * as React from 'react';

import {
  Check,
  ChevronDown,
  CreditCard,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';

import { Badge } from '@/components/ui/badge';
import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';
import { useUpdateTransactionPaymentMethod } from '@/trpc/hooks/transaction-hooks';

// Define payment method options
const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

// Define payment channel options
const paymentChannelOptions = [
  { value: 'in_store', label: 'In Store' },
  { value: 'online', label: 'Online' },
  { value: 'phone', label: 'Phone' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'atm', label: 'ATM' },
  { value: 'direct_deposit', label: 'Direct Deposit' },
  { value: 'wire', label: 'Wire' },
  { value: 'other', label: 'Other' },
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
  const [updatingMethod, setUpdatingMethod] = React.useState<string | null>(null);
  const [updatingChannel, setUpdatingChannel] = React.useState<string | null>(null);

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
          toast.success(`Payment method updated to ${getLabelFromValue(newMethod, paymentMethodOptions)}`);
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
          toast.success(`Payment channel updated to ${getLabelFromValue(newChannel, paymentChannelOptions)}`);
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
  const getLabelFromValue = (value: string, options: { value: string; label: string }[]) => {
    const option = options.find(opt => opt.value === value);
    return option?.label || value;
  };

  const renderPaymentMethodField = () => {
    const currentMethod = transaction.paymentMethod;

    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-foreground/70">
          Payment Method
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
              {currentMethod ? (
                <Badge
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow group-hover:brightness-105"
                >
                  {getLabelFromValue(currentMethod, paymentMethodOptions)}
                </Badge>
              ) : (
                <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Badge
                    variant="outline"
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-all group-hover:border-border/50 group-hover:shadow-sm"
                  >
                    Select Payment Method <ChevronDown className="ml-1 h-3 w-3" />
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <CreditCard className="h-4 w-4 text-primary/70" />
              <span>{currentMethod ? 'Update' : 'Set'} Payment Method</span>
            </DropdownMenuLabel>
            <div className="px-1 py-1">
              {paymentMethodOptions.map((method) => (
                <DropdownMenuItem
                  key={method.value}
                  onClick={() => handlePaymentMethodUpdate(method.value)}
                  disabled={updatingMethod !== null}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${method.value === currentMethod
                    ? 'bg-primary/10 font-medium text-primary-foreground/90'
                    : 'hover:bg-accent/50 focus:bg-accent'
                    }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${method.value === currentMethod ? 'border-primary/30' : 'border-border/30'
                      } ${updatingMethod === method.value ? 'animate-pulse' : ''}`}
                  >
                    {updatingMethod === method.value ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
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

    return (
      <div className="flex flex-col space-y-1 mt-2">
        <span className="text-sm font-medium text-foreground/70">
          Payment Channel
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
              {currentChannel ? (
                <Badge
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow group-hover:brightness-105"
                >
                  {getLabelFromValue(currentChannel, paymentChannelOptions)}
                </Badge>
              ) : (
                <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Badge
                    variant="outline"
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-all group-hover:border-border/50 group-hover:shadow-sm"
                  >
                    Select Payment Channel <ChevronDown className="ml-1 h-3 w-3" />
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <CreditCard className="h-4 w-4 text-primary/70" />
              <span>{currentChannel ? 'Update' : 'Set'} Payment Channel</span>
            </DropdownMenuLabel>
            <div className="px-1 py-1">
              {paymentChannelOptions.map((channel) => (
                <DropdownMenuItem
                  key={channel.value}
                  onClick={() => handlePaymentChannelUpdate(channel.value)}
                  disabled={updatingChannel !== null}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${channel.value === currentChannel
                    ? 'bg-primary/10 font-medium text-primary-foreground/90'
                    : 'hover:bg-accent/50 focus:bg-accent'
                    }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${channel.value === currentChannel ? 'border-primary/30' : 'border-border/30'
                      } ${updatingChannel === channel.value ? 'animate-pulse' : ''}`}
                  >
                    {updatingChannel === channel.value ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm">{channel.label}</span>
                  {channel.value === currentChannel && (
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
      <div className="space-y-2">
        {/* Interactive payment method and channel fields */}
        {renderPaymentMethodField()}
        {renderPaymentChannelField()}

        {/* Other payment fields */}
        <div className="mt-3">
          <FieldRenderer field="paymentProcessor" label="Payment Processor" />
          <FieldRenderer field="paymentGateway" label="Payment Gateway" />
        </div>

        {/* Card details */}
        {(transaction.cardType ||
          transaction.cardNetwork ||
          transaction.cardLastFour) && (
            <div className="mt-3 border-t border-border/20 pt-2">
              <SubheadingWithTooltip
                label="Card Information"
                tooltip="Details about the card used for this transaction"
              />
              <FieldRenderer field="cardType" label="Card Type" />
              <FieldRenderer field="cardNetwork" label="Card Network" />
              <FieldRenderer field="cardLastFour" label="Last Four" />
            </div>
          )}

        {/* Reference numbers */}
        {(transaction.transactionReference ||
          transaction.authorizationCode ||
          transaction.checkNumber ||
          transaction.wireReference ||
          transaction.accountNumber) && (
            <div className="mt-3 border-t border-border/20 pt-2">
              <SubheadingWithTooltip
                label="Reference Information"
                tooltip="Reference numbers and identifiers associated with this transaction"
              />
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
              <FieldRenderer field="checkNumber" label="Check Number" monospace />
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
          )}
      </div>
    </TransactionSection>
  );
}
