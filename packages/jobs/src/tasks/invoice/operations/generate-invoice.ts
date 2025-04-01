import {
  GenerateInvoiceInput,
  GenerateInvoiceOutput,
  generateInvoiceInputSchema,
  generateInvoiceOutputSchema
} from '../schema';
import { PdfTemplate, renderToBuffer } from '@solomonai/invoice';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { Task } from '@trigger.dev/sdk/v3';
import { prisma } from '@solomonai/prisma';
import { utapi } from '@solomonai/lib/clients';

export const generateInvoice: Task<
  'generate-invoice',
  GenerateInvoiceInput,
  GenerateInvoiceOutput
> = schemaTask({
  id: 'generate-invoice',
  schema: generateInvoiceInputSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload) => {
    const { invoiceId } = payload;

    // Fetch invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        team: true,
        lineItems: true, // Include related line items
      },
    });

    if (!invoice) {
      logger.error('Invoice not found');
      throw new Error('Invoice not found');
    }

    // Use the line items from the invoice relation
    const lineItems = invoice.lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit || undefined,
    }));

    const buffer = await renderToBuffer(
      await PdfTemplate({
        title: invoice.title || 'Invoice',
        invoice_number: invoice.invoiceNumber || 'INV-0001',
        issue_date: invoice.issueDate
          ? invoice.issueDate.toISOString()
          : new Date().toISOString(),
        due_date: invoice.dueDate
          ? invoice.dueDate.toISOString()
          : new Date().toISOString(),
        template: {
          logo_url: '',
          from_label: 'From',
          customer_label: 'Bill To',
          invoice_no_label: 'Invoice #',
          issue_date_label: 'Issue Date',
          due_date_label: 'Due Date',
          date_format: 'MM/DD/YYYY',
          payment_label: 'Payment Details',
          note_label: 'Notes',
          description_label: 'Description',
          quantity_label: 'Qty',
          price_label: 'Price',
          total_label: 'Total',
          total_summary_label: 'Total',
          tax_label: 'Tax',
          vat_label: 'VAT',
          tax_rate: 0,
          vat_rate: 0,
          locale: 'en-US',
          discount_label: 'Discount',
          include_discount: false,
          include_tax: false,
          timezone: 'UTC',
          include_decimals: true,
          include_units: false,
          include_qr: false,
          include_vat: false,
          title: 'Invoice',
          subtotal_label: 'Subtotal',
          subtotal: invoice.subtotal || 0,
        },
        line_items: lineItems,
        customer_details: invoice.customerDetails as any,
        from_details: invoice.fromDetails as any,
        payment_details: invoice.paymentDetails as any,
        note_details: invoice.noteDetails as any,
        currency: invoice.currency || 'USD',
        amount: invoice.amount || 0,
        vat: invoice.vat || 0,
        tax: invoice.tax || 0,
        token: invoice.token,
        size: 'a4',
        width: 595,
        height: 842,
        top_block: invoice.topBlock as any,
        bottom_block: invoice.bottomBlock as any,
        subtotal: invoice.subtotal || 0,
        discount: invoice.discount || 0,
      } as any)
    );

    const filename = `${invoice.invoiceNumber || 'invoice'}.pdf`;

    const uploadResponse = await utapi.uploadFiles([
      new File([buffer], filename, { type: 'application/pdf' }),
    ]);

    const fileResponse = uploadResponse[0];

    if (!fileResponse || !fileResponse.data) {
      logger.error('Failed to upload invoice to storage', {
        error: fileResponse?.error?.message || 'Unknown error',
      });
      throw new Error('Failed to upload invoice to storage');
    }

    logger.debug('PDF uploaded to storage');

    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        filePath: [fileResponse.data.key],
        url: fileResponse.data.url,
        fileSize: buffer.length,
      },
    });

    logger.info('Invoice generation completed', { invoiceId, filename });

    // Return the result
    return generateInvoiceOutputSchema.parse({
      success: true,
      invoiceId,
      filePath: updatedInvoice.filePath,
      fileSize: updatedInvoice.fileSize,
      url: updatedInvoice.url,
    });
  },
});
