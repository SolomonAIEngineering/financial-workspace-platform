import { PdfTemplate, renderToBuffer } from '@solomonai/invoice';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { I } from 'node_modules/@upstash/redis/zmscore-C3G81zLz.mjs';
import { prisma } from '@/server/db';
import { utapi } from '@/lib/uploadthing';
import { z } from 'zod';

export const generateInvoice = schemaTask({
  id: 'generate-invoice',
  schema: z.object({
    invoiceId: z.string().uuid(),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload) => {
    const { invoiceId } = payload;

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      logger.error('Invoice not found');
      return;
    }

    // Default line items
    const lineItems: {
      name: string;
      quantity: number;
      price: number;
      unit?: string;
    }[] = invoice.lineItems.map((item) => ({
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
        width: 595,
        height: 842,
        token: invoice.token,
        size: 'a4',
        top_block: invoice.topBlock as any,
        bottom_block: invoice.bottomBlock as any,
        subtotal: invoice.subtotal || 0,
        discount: invoice.discount || 0,
      })
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
      return;
    }

    logger.debug('PDF uploaded to storage');

    await prisma.invoice.update({
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
  },
});
