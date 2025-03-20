import {
  InvoiceDeliveryType,
  InvoiceSize,
  InvoiceStatus,
  PrismaClient,
} from '@prisma/client'

import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const seedDatabase = async () => {
  try {
    console.log('Seeding invoices...')

    // Get users and teams to associate invoices with
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'john.doe@example.com' },
          { email: 'jane.smith@example.com' },
          { email: 'yoanyomba@solomon-ai.co' },
        ],
      },
    })

    if (users.length === 0) {
      console.log(
        'No users found to associate invoices with. Skipping invoice seeding.',
      )
      return
    }

    // Get teams
    const teams = await prisma.team.findMany({
      take: 2,
    })

    if (teams.length === 0) {
      console.log(
        'No teams found to associate invoices with. Skipping invoice seeding.',
      )
      return
    }

    // Create customers for invoices
    for (let i = 0; i < Math.min(users.length, teams.length); i++) {
      const user = users[i]
      const team = teams[i]

      // Create customers
      const customers = [
        {
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          phone: '+1234567890',
          addressLine1: '123 Business Ave',
          addressLine2: 'Suite 500',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
          countryCode: 'US',
          website: 'https://www.acmecorp.com',
          contact: 'John Smith',
          note: 'Premium client - priority service',
          vatNumber: 'VAT-12345',
        },
        {
          name: 'Globex Industries',
          email: 'accounts@globex.com',
          phone: '+1987654321',
          addressLine1: '456 Enterprise Blvd',
          addressLine2: 'Floor 12',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          countryCode: 'US',
          website: 'https://www.globexindustries.com',
          contact: 'Jane Johnson',
          note: 'New client - onboarded last month',
          vatNumber: 'VAT-67890',
        },
      ]

      const createdCustomers = []

      for (const customerData of customers) {
        const customer = await prisma.customer.create({
          data: {
            id: uuidv4(),
            name: customerData.name,
            email: customerData.email,
            token: uuidv4(),
            phone: customerData.phone,
            contact: customerData.contact,
            website: customerData.website,
            note: customerData.note,
            vatNumber: customerData.vatNumber,
            addressLine1: customerData.addressLine1,
            addressLine2: customerData.addressLine2,
            city: customerData.city,
            state: customerData.state,
            zip: customerData.zip,
            country: customerData.country,
            countryCode: customerData.countryCode,
            teamId: team.id,
            createdAt: new Date(),
          },
        })

        createdCustomers.push(customer)

        // Create tags for customers
        const tags = [
          'client',
          'active',
          customerData.name === 'Acme Corporation' ? 'priority' : 'standard',
        ]

        for (const tagName of tags) {
          // First create or find the tag
          const tag = await prisma.tag.upsert({
            where: {
              id: `${tagName}-${team.id}`,
            },
            update: {},
            create: {
              id: `${tagName}-${team.id}`,
              name: tagName,
              teamId: team.id,
              createdAt: new Date(),
            },
          })

          // Then create the customer tag relationship
          await prisma.customerTag.create({
            data: {
              id: uuidv4(),
              customerId: customer.id,
              tagId: tag.id,
              teamId: team.id,
              createdAt: new Date(),
            },
          })
        }
      }

      // Create invoice template
      const invoiceTemplate = await prisma.invoiceTemplate.create({
        data: {
          id: uuidv4(),
          teamId: team.id,
          title: `Standard Invoice Template`,
          deliveryType: InvoiceDeliveryType.CREATE,
          size: InvoiceSize.A4,
          logoUrl: 'https://example.com/logo.png',
          currency: 'USD',
          fromLabel: 'From',
          fromDetails: {
            name: team.name,
            email: team.email,
            address: '789 Business Park',
            city: 'Chicago',
            state: 'IL',
            zip: '60601',
            country: 'USA',
          },
          customerLabel: 'Bill To',
          invoiceNoLabel: 'Invoice Number',
          issueDateLabel: 'Issue Date',
          dueDateLabel: 'Due Date',
          descriptionLabel: 'Description',
          quantityLabel: 'Quantity',
          priceLabel: 'Price',
          taxLabel: 'Tax',
          discountLabel: 'Discount',
          vatLabel: 'VAT',
          totalLabel: 'Total',
          totalSummaryLabel: 'Total Due',
          noteLabel: 'Notes',
          paymentLabel: 'Payment Details',
          paymentDetails: {
            bankName: 'First National Bank',
            accountName: team.name,
            accountNumber: '1234567890',
            routingNumber: '987654321',
            swift: 'FNBUS12345',
          },
          taxRate: 10.0,
          vatRate: 0.0,
          dateFormat: 'MM/DD/YYYY',
          includeDecimals: true,
          includeDiscount: true,
          includeTax: true,
          includeVat: false,
          includeUnits: true,
          includeQr: false,
          createdAt: new Date(),
        },
      })

      // Create invoices for each customer
      for (const customer of createdCustomers) {
        // Create paid invoice
        const paidInvoice = await prisma.invoice.create({
          data: {
            id: uuidv4(),
            teamId: team.id,
            userId: user.id,
            customerId: customer.id,
            customerName: customer.name,
            token: uuidv4(),
            invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, '0')}`,
            status: InvoiceStatus.PAID,
            issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            viewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            reminderSentAt: null,
            amount: 1050.0,
            subtotal: 1000.0,
            tax: 100.0,
            vat: 0.0,
            discount: 50.0,
            currency: 'USD',
            note: 'Thank you for your business',
            internalNote: 'Payment received on time',
            fromDetails: {
              name: team.name,
              email: team.email,
              address: '789 Business Park',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'USA',
            },
            customerDetails: {
              name: customer.name,
              email: customer.email,
              address: customer.addressLine1,
              city: customer.city,
              state: customer.state,
              zip: customer.zip,
              country: customer.country,
            },
            paymentDetails: {
              bankName: 'First National Bank',
              accountName: team.name,
              accountNumber: '1234567890',
              routingNumber: '987654321',
              swift: 'FNBUS12345',
            },
            noteDetails: {
              note: 'Thank you for your business',
              terms: 'Net 15',
            },
            template: {
              id: invoiceTemplate.id,
              title: invoiceTemplate.title,
            },
            url: `https://example.com/invoices/${uuidv4()}`,
            sentTo: customer.email,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        })

        // Create line item for paid invoice
        await prisma.invoiceLineItem.create({
          data: {
            id: uuidv4(),
            invoiceId: paidInvoice.id,
            name: 'Consulting Services',
            quantity: 10,
            price: 100.0
          }
        })

        // Create unpaid invoice
        const unpaidInvoice = await prisma.invoice.create({
          data: {
            id: uuidv4(),
            teamId: team.id,
            userId: user.id,
            customerId: customer.id,
            customerName: customer.name,
            token: uuidv4(),
            invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, '0')}`,
            status: InvoiceStatus.UNPAID,
            issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            paidAt: null,
            viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            reminderSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            amount: 2200.0,
            subtotal: 2000.0,
            tax: 200.0,
            vat: 0.0,
            discount: 0.0,
            currency: 'USD',
            note: 'Please pay within the due date',
            internalNote: 'Follow up if not paid by due date',
            fromDetails: {
              name: team.name,
              email: team.email,
              address: '789 Business Park',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'USA',
            },
            customerDetails: {
              name: customer.name,
              email: customer.email,
              address: customer.addressLine1,
              city: customer.city,
              state: customer.state,
              zip: customer.zip,
              country: customer.country,
            },
            paymentDetails: {
              bankName: 'First National Bank',
              accountName: team.name,
              accountNumber: '1234567890',
              routingNumber: '987654321',
              swift: 'FNBUS12345',
            },
            noteDetails: {
              note: 'Please pay within the due date',
              terms: 'Net 15',
            },
            template: {
              id: invoiceTemplate.id,
              title: invoiceTemplate.title,
            },
            url: `https://example.com/invoices/${uuidv4()}`,
            sentTo: customer.email,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        })

        // Create line item for unpaid invoice
        await prisma.invoiceLineItem.create({
          data: {
            id: uuidv4(),
            invoiceId: unpaidInvoice.id,
            name: 'Web Development',
            quantity: 20,
            price: 100.0
          }
        })

        // Create draft invoice
        const draftInvoice = await prisma.invoice.create({
          data: {
            id: uuidv4(),
            teamId: team.id,
            userId: user.id,
            customerId: customer.id,
            customerName: customer.name,
            token: uuidv4(),
            invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, '0')}`,
            status: InvoiceStatus.DRAFT,
            issueDate: null,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            paidAt: null,
            viewedAt: null,
            reminderSentAt: null,
            amount: 1575.0,
            subtotal: 1500.0,
            tax: 150.0,
            vat: 0.0,
            discount: 75.0,
            currency: 'USD',
            note: 'Draft invoice - not yet sent',
            internalNote: 'Need to confirm details before sending',
            fromDetails: {
              name: team.name,
              email: team.email,
              address: '789 Business Park',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'USA',
            },
            customerDetails: {
              name: customer.name,
              email: customer.email,
              address: customer.addressLine1,
              city: customer.city,
              state: customer.state,
              zip: customer.zip,
              country: customer.country,
            },
            paymentDetails: {
              bankName: 'First National Bank',
              accountName: team.name,
              accountNumber: '1234567890',
              routingNumber: '987654321',
              swift: 'FNBUS12345',
            },
            noteDetails: {
              note: 'Draft invoice - not yet sent',
              terms: 'Net 15',
            },
            template: {
              id: invoiceTemplate.id,
              title: invoiceTemplate.title,
            },
            url: null,
            sentTo: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        // Create line item for draft invoice
        await prisma.invoiceLineItem.create({
          data: {
            id: uuidv4(),
            invoiceId: draftInvoice.id,
            name: 'UI/UX Design',
            quantity: 15,
            price: 100.0
          }
        })
      }
    }

    console.log('Invoices seeded successfully')
  } catch (error) {
    console.error('Error seeding invoices:', error)
    throw error
  }
}
