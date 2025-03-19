/**
 * Generates an invoice number with the format "INV-XXX"
 * where XXX is the count + 1 with leading zeros
 * @param count The current invoice count
 * @returns A formatted invoice number string
 */
export function generateInvoiceNumber(count: number): string {
  // Add 1 to count to start from 1 instead of 0
  const nextNumber = count + 1

  // For numbers less than 100, pad to 3 digits
  if (nextNumber < 1000) {
    return `INV-${nextNumber.toString().padStart(3, '0')}`
  }

  // For larger numbers, no padding is needed
  return `INV-${nextNumber}`
}
