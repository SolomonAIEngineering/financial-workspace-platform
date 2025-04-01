import {
  SendInvoiceEmailInput,
  SendInvoiceEmailOutput,
  sendInvoiceEmailInputSchema,
  sendInvoiceEmailOutputSchema
} from '../../invoice/schema';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { Invoice } from '@solomonai/email';
import { Task } from '@trigger.dev/sdk/v3';
import { nanoid } from 'nanoid';
import { BusinessConfig as platformConfig } from '@solomonai/platform-config';
import { prisma } from '@solomonai/prisma';
import { render } from '@react-email/render';
import { resend } from '@solomonai/lib/clients';

export const sendInvoiceEmail: Task<
  'send-invoice-email',
  SendInvoiceEmailInput,
  SendInvoiceEmailOutput
> = schemaTask({
  id: 'send-invoice-email',
  schema: sendInvoiceEmailInputSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ invoiceId }) => {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        customer: true,
        team: true,
      },
    });

    if (!invoice) {
      logger.error('Invoice not found');
      throw new Error('Invoice not found');
    }

    const customerEmail = invoice?.customer?.email;

    if (!customerEmail) {
      logger.error('Invoice customer email not found');
      throw new Error('Invoice customer email not found');
    }

    const response = await resend?.emails.send({
      from: platformConfig.email.from.default,
      to: customerEmail,
      replyTo: invoice?.team.email ?? undefined,
      subject: `${invoice?.team.name} sent you an invoice`,
      headers: {
        'X-Entity-Ref-ID': nanoid(),
      },
      html: await render(
        <Invoice
          customerName={invoice?.customer?.name ?? ''}
          teamName={invoice?.team.name ?? ''}
          link={`${platformConfig.platformUrl}/invoice/${invoice?.token}`}
          email={invoice?.customer?.email ?? ''}
          teamSlug={invoice?.team.name ?? ''}
          companyLogo={invoice?.team.logoUrl ?? ''}
          invoiceNumber={invoice?.id ?? ''}
          invoiceAmount={invoice?.amount?.toString() ?? ''}
          dueDate={invoice?.dueDate?.toISOString() ?? ''}
          paymentMethods={
            Array.isArray(invoice?.paymentDetails)
              ? invoice.paymentDetails
                .filter(
                  (payment): payment is Record<string, any> =>
                    payment !== null && typeof payment === 'object'
                )
                .map((payment) => payment.method)
                .filter(Boolean)
              : []
          }
        />
      ),
    });

    if (response?.error) {
      logger.error('Invoice email failed to send', {
        invoiceId,
        error: response?.error,
      });

      throw new Error('Invoice email failed to send');
    }

    logger.info('Invoice email sent');

    await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: 'UNPAID',
        sentTo: customerEmail,
      },
    });

    // Return success result that matches the output schema
    return sendInvoiceEmailOutputSchema.parse({
      success: true,
      invoiceId,
      recipientEmail: customerEmail,
      updatedStatus: 'UNPAID',
    });
  },
});
