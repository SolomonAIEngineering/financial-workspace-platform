import { Edit2, Globe, Save, Tag, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { Input } from '@/registry/default/potion-ui/input';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { cn } from '@/lib/utils';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';

/** MerchantSection component displays merchant information about a transaction. */
export function MerchantSection() {
  const { transaction, updateTransactionData } = useTransactionContext();

  // State for merchant name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [merchantName, setMerchantName] = useState(
    transaction.merchantName || ''
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  // State for merchant category editing
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [merchantCategory, setMerchantCategory] = useState(
    transaction.merchantCategory || ''
  );
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // State for merchant website editing
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [merchantWebsite, setMerchantWebsite] = useState(
    transaction.merchantWebsite || ''
  );
  const websiteInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Update local state when transaction changes
  useEffect(() => {
    setMerchantName(transaction.merchantName || '');
    setMerchantCategory(transaction.merchantCategory || '');
    setMerchantWebsite(transaction.merchantWebsite || '');
  }, [
    transaction.merchantName,
    transaction.merchantCategory,
    transaction.merchantWebsite,
  ]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingCategory && categoryInputRef.current) {
      categoryInputRef.current.focus();
    }
  }, [isEditingCategory]);

  useEffect(() => {
    if (isEditingWebsite && websiteInputRef.current) {
      websiteInputRef.current.focus();
    }
  }, [isEditingWebsite]);

  // Prepare merchant website URL
  const getMerchantWebsiteUrl = (website: string) => {
    return website.startsWith('http') ? website : `https://${website}`;
  };

  // Generic save function for all merchant fields
  const handleSaveField = async (field: string, value: string) => {
    if (!transaction.id) return;

    setIsSaving(true);
    try {
      // Update the transaction data via context
      updateTransactionData({
        [field]: value,
      });

      toast.success(
        `Merchant ${field.replace('merchant', '').toLowerCase()} updated successfully`
      );

      // Reset all editing states
      setIsEditingName(false);
      setIsEditingCategory(false);
      setIsEditingWebsite(false);
    } catch (error) {
      console.error(`Failed to update merchant ${field}:`, error);
      toast.error(`Failed to update merchant ${field}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Generic keydown handler
  const handleKeyDown = async (
    e: React.KeyboardEvent,
    field: string,
    value: string,
    setEditingFn: (value: boolean) => void
  ) => {
    if (e.key === 'Enter') {
      await handleSaveField(field, value);
    } else if (e.key === 'Escape') {
      // Reset to original value and exit edit mode
      switch (field) {
        case 'merchantName':
          setMerchantName(transaction.merchantName || '');
          break;
        case 'merchantCategory':
          setMerchantCategory(transaction.merchantCategory || '');
          break;
        case 'merchantWebsite':
          setMerchantWebsite(transaction.merchantWebsite || '');
          break;
      }
      setEditingFn(false);
    }
  };

  // Render a field with inline editing
  const renderEditableField = ({
    field,
    label,
    value,
    setValue,
    isEditing,
    setIsEditing,
    inputRef,
    icon,
    placeholder,
  }: {
    field: string;
    label: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    inputRef: React.RefObject<HTMLInputElement>;
    icon: React.ReactNode;
    placeholder: string;
  }) => {
    return (
      <div
        className={cn(
          'relative mb-2 flex flex-col rounded-xl transition-all duration-300',
          isEditing
            ? 'border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 shadow-sm'
            : 'hover:bg-violet-50/20'
        )}
      >
        <div className="flex items-center justify-between px-3 pt-2">
          <span
            className={cn(
              'text-xs font-medium transition-colors duration-200',
              isEditing ? 'text-violet-700' : 'text-foreground/70'
            )}
          >
            {label}
          </span>

          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-6 w-6 rounded-full bg-transparent text-muted-foreground/50 transition-all duration-200',
                'hover:scale-105 hover:bg-violet-100/70 hover:text-violet-700',
                'focus:ring-2 focus:ring-violet-200 focus:ring-offset-1 focus:outline-none'
              )}
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="px-3 pt-1 pb-3">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field, value, setIsEditing)}
                className={cn(
                  'h-9 w-full rounded-lg border-violet-200/60 bg-white/80 pr-16 pl-3 text-sm shadow-sm backdrop-blur-sm',
                  'focus:border-violet-300 focus:ring-2 focus:ring-violet-200/50 focus:ring-offset-0',
                  'transition-all duration-200 placeholder:text-violet-300'
                )}
                placeholder={placeholder}
                disabled={isSaving}
              />
              <div className="absolute top-1 right-1 flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm transition-opacity">
                <Button
                  size="sm"
                  className={cn(
                    'h-7 w-7 rounded-lg bg-transparent p-0',
                    'text-rose-500 hover:bg-rose-50 hover:text-rose-600',
                    'transition-all duration-200 hover:scale-105',
                    'focus:ring-2 focus:ring-rose-200 focus:outline-none'
                  )}
                  onClick={() => {
                    switch (field) {
                      case 'merchantName':
                        setMerchantName(transaction.merchantName || '');
                        break;
                      case 'merchantCategory':
                        setMerchantCategory(transaction.merchantCategory || '');
                        break;
                      case 'merchantWebsite':
                        setMerchantWebsite(transaction.merchantWebsite || '');
                        break;
                    }
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    'h-7 w-7 rounded-lg bg-transparent p-0',
                    'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600',
                    'transition-all duration-200 hover:scale-105',
                    'focus:ring-2 focus:ring-emerald-200 focus:outline-none'
                  )}
                  onClick={() => handleSaveField(field, value)}
                  disabled={isSaving}
                >
                  <Save
                    className={cn('h-3.5 w-3.5', isSaving && 'animate-spin')}
                  />
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-violet-500/70 italic">
              Press Enter to save, Esc to cancel
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'group relative cursor-pointer rounded-lg px-3 py-2 text-sm',
              'transition-all duration-200 hover:bg-violet-50/80',
              'flex items-center justify-between'
            )}
            onClick={() => setIsEditing(true)}
          >
            <div className="flex items-center gap-2">
              {icon}
              <div className="truncate">
                {value ? (
                  <span className="font-medium text-foreground/90">
                    {field === 'merchantWebsite' && value.startsWith('http') ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground/60 italic">
                    No {label.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="mr-2 text-xs text-violet-500">Edit</span>
              <div className="flex h-full items-center rounded-l-full bg-violet-100/80 px-2">
                <Edit2 className="h-3 w-3 text-violet-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <TransactionSection
      title="Merchant Details"
      icon={<User className="h-4 w-4" />}
      defaultOpen={!!transaction.merchantName}
      tooltip={sectionDescriptions.merchantDetails}
    >
      <div className="space-y-1">
        {/* Merchant Name */}
        {renderEditableField({
          field: 'merchantName',
          label: 'Merchant Name',
          value: merchantName,
          setValue: setMerchantName,
          isEditing: isEditingName,
          setIsEditing: setIsEditingName,
          inputRef: nameInputRef as React.RefObject<HTMLInputElement>,
          icon: <User className="h-3.5 w-3.5 text-violet-500/70" />,
          placeholder: 'Enter merchant name',
        })}

        {/* Merchant Category */}
        {renderEditableField({
          field: 'merchantCategory',
          label: 'Merchant Category',
          value: merchantCategory,
          setValue: setMerchantCategory,
          isEditing: isEditingCategory,
          setIsEditing: setIsEditingCategory,
          inputRef: categoryInputRef as React.RefObject<HTMLInputElement>,
          icon: <Tag className="h-3.5 w-3.5 text-violet-500/70" />,
          placeholder: 'Enter merchant category',
        })}

        {/* Merchant Website */}
        {renderEditableField({
          field: 'merchantWebsite',
          label: 'Website',
          value: merchantWebsite,
          setValue: setMerchantWebsite,
          isEditing: isEditingWebsite,
          setIsEditing: setIsEditingWebsite,
          inputRef: websiteInputRef as React.RefObject<HTMLInputElement>,
          icon: <Globe className="h-3.5 w-3.5 text-violet-500/70" />,
          placeholder: 'Enter website URL',
        })}

        <div
          className={cn(
            'mt-1 transition-all duration-300',
            isEditingName || isEditingCategory || isEditingWebsite
              ? 'opacity-60'
              : 'opacity-100'
          )}
        >
          <DetailRow
            label="Merchant ID"
            value={transaction.merchantId || '-'}
            tooltip={fieldDescriptions.merchantId}
            monospace
          />

          <FieldRenderer field="merchantPhone" label="Phone" />

          {/* Address information */}
          {(transaction.merchantAddress ||
            transaction.merchantCity ||
            transaction.merchantState ||
            transaction.merchantZip ||
            transaction.merchantCountry) && (
            <div className="mt-2 border-t border-border/20 pt-2">
              <SubheadingWithTooltip
                label="Merchant Address"
                tooltip="Physical address of the merchant or business"
              />
              <FieldRenderer field="merchantAddress" label="Street" />
              <FieldRenderer field="merchantCity" label="City" />
              <FieldRenderer field="merchantState" label="State" />
              <FieldRenderer field="merchantZip" label="ZIP" />
              {transaction.merchantCountry && (
                <DetailRow
                  label="Country"
                  value={transaction.merchantCountry}
                  tooltip={fieldDescriptions.merchantCountry}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </TransactionSection>
  );
}
