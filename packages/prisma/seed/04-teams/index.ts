import { PrismaClient, TeamRole } from '@prisma/client'

import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const seedDatabase = async () => {
  try {
    console.log('Seeding teams...')

    // Get users to associate teams with
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'john.doe@example.com' },
          { email: 'jane.smith@example.com' },
          { email: 'bob.johnson@example.com' },
          { email: 'admin@example.com' },
          { email: 'yoanyomba@solomon-ai.co' },
        ],
      },
    })

    if (users.length < 2) {
      console.log(
        'Not enough users found to create teams. Skipping team seeding.',
      )
      return
    }

    // Find specific users
    const adminUser = users.find((user) => user.email === 'admin@example.com')
    const johnUser = users.find((user) => user.email === 'john.doe@example.com')
    const janeUser = users.find(
      (user) => user.email === 'jane.smith@example.com',
    )
    const bobUser = users.find(
      (user) => user.email === 'bob.johnson@example.com',
    )
    const yoanUser = users.find(
      (user) => user.email === 'yoanyomba@solomon-ai.co',
    )

    // Create Finance Team with enhanced data
    const financeTeam = await prisma.team.upsert({
      where: {
        slug: 'finance-team',
      },
      update: {},
      create: {
        id: uuidv4(),
        slug: 'finance-team',
        name: 'Finance Team',
        email: 'finance@example.com',
        logoUrl: 'https://example.com/logos/finance.png',
        inboxEmail: 'inbox.finance@example.com',
        inboxId: uuidv4(),
        inboxForwarding: true,
        documentClassification: true,
        flags: ['finance', 'accounting', 'budgeting', 'tax', 'payroll'],
        baseCurrency: 'USD',
        createdAt: new Date(),
      },
    })

    // Create Marketing Team with enhanced data
    const marketingTeam = await prisma.team.upsert({
      where: {
        slug: 'marketing-team',
      },
      update: {},
      create: {
        id: uuidv4(),
        slug: 'marketing-team',
        name: 'Marketing Team',
        email: 'marketing@example.com',
        logoUrl: 'https://example.com/logos/marketing.png',
        inboxEmail: 'inbox.marketing@example.com',
        inboxId: uuidv4(),
        inboxForwarding: true,
        documentClassification: true,
        flags: [
          'marketing',
          'branding',
          'social-media',
          'content',
          'analytics',
        ],
        baseCurrency: 'USD',
        createdAt: new Date(),
      },
    })

    // Create Operations Team with enhanced data
    const operationsTeam = await prisma.team.upsert({
      where: {
        slug: 'operations-team',
      },
      update: {},
      create: {
        id: uuidv4(),
        slug: 'operations-team',
        name: 'Operations Team',
        email: 'operations@example.com',
        logoUrl: 'https://example.com/logos/operations.png',
        inboxEmail: 'inbox.operations@example.com',
        inboxId: uuidv4(),
        inboxForwarding: true,
        documentClassification: true,
        flags: [
          'operations',
          'logistics',
          'supply-chain',
          'inventory',
          'fulfillment',
        ],
        baseCurrency: 'USD',
        createdAt: new Date(),
      },
    })

    // Add users to Finance Team
    if (johnUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: johnUser.id,
            teamId: financeTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: johnUser.id,
          teamId: financeTeam.id,
          role: TeamRole.OWNER,
          createdAt: new Date(),
        },
      })
    }

    if (bobUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: bobUser.id,
            teamId: financeTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: bobUser.id,
          teamId: financeTeam.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    if (yoanUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: yoanUser.id,
            teamId: financeTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: yoanUser.id,
          teamId: financeTeam.id,
          role: TeamRole.OWNER,
          createdAt: new Date(),
        },
      })
    }

    if (adminUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: adminUser.id,
            teamId: financeTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: adminUser.id,
          teamId: financeTeam.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    // Add users to Marketing Team
    if (janeUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: janeUser.id,
            teamId: marketingTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: janeUser.id,
          teamId: marketingTeam.id,
          role: TeamRole.OWNER,
          createdAt: new Date(),
        },
      })
    }

    if (bobUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: bobUser.id,
            teamId: marketingTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: bobUser.id,
          teamId: marketingTeam.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    // Add users to Operations Team
    if (adminUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: adminUser.id,
            teamId: operationsTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: adminUser.id,
          teamId: operationsTeam.id,
          role: TeamRole.OWNER,
          createdAt: new Date(),
        },
      })
    }

    if (johnUser) {
      await prisma.usersOnTeam.upsert({
        where: {
          userId_teamId: {
            userId: johnUser.id,
            teamId: operationsTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: johnUser.id,
          teamId: operationsTeam.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    // Create pending invites with enhanced data
    if (adminUser) {
      await prisma.userInvite.create({
        data: {
          id: uuidv4(),
          email: 'new.member@example.com',
          code: uuidv4().substring(0, 8),
          teamId: financeTeam.id,
          invitedBy: adminUser.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    if (janeUser) {
      await prisma.userInvite.create({
        data: {
          id: uuidv4(),
          email: 'marketing.candidate@example.com',
          code: uuidv4().substring(0, 8),
          teamId: marketingTeam.id,
          invitedBy: janeUser.id,
          role: TeamRole.MEMBER,
          createdAt: new Date(),
        },
      })
    }

    // Connect bank accounts to teams
    if (johnUser) {
      const bankAccounts = await prisma.bankAccount.findMany({
        where: {
          userId: johnUser.id,
        },
        take: 1,
      })

      if (bankAccounts.length > 0) {
        await prisma.team.update({
          where: {
            id: financeTeam.id,
          },
          data: {
            bankAccounts: {
              connect: {
                id: bankAccounts[0].id,
              },
            },
          },
        })
      }
    }

    // Create tags for Finance Team
    const financeTags = [
      {
        name: 'Expenses',
      },
      {
        name: 'Revenue',
      },
      {
        name: 'Tax Deductible',
      },
    ]

    for (const tagData of financeTags) {
      await prisma.tag.create({
        data: {
          id: uuidv4(),
          teamId: financeTeam.id,
          ...tagData,
        },
      })
    }

    // Create tags for Marketing Team
    const marketingTags = [
      {
        name: 'Social Media',
      },
      {
        name: 'Content Creation',
      },
      {
        name: 'Advertising',
      },
    ]

    for (const tagData of marketingTags) {
      await prisma.tag.create({
        data: {
          id: uuidv4(),
          teamId: marketingTeam.id,
          ...tagData,
        },
      })
    }

    // Create custom transaction categories for Finance Team
    const financeCategories = [
      {
        name: 'Office Supplies',
        slug: 'office-supplies',
        description: 'Expenses for office supplies and equipment',
        color: '#3498DB',
        vat: 20.0,
        system: false,
      },
      {
        name: 'Client Meetings',
        slug: 'client-meetings',
        description: 'Expenses related to client meetings and entertainment',
        color: '#2ECC71',
        vat: 20.0,
        system: false,
      },
      {
        name: 'Software Subscriptions',
        slug: 'software-subscriptions',
        description: 'Recurring software subscription expenses',
        color: '#F39C12',
        vat: 20.0,
        system: false,
      },
    ]

    for (const categoryData of financeCategories) {
      await prisma.customTransactionCategory.upsert({
        where: {
          slug_teamId: {
            slug: categoryData.slug,
            teamId: financeTeam.id,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          teamId: financeTeam.id,
          ...categoryData,
        },
      })
    }

    // Create customers for Finance Team
    const financeCustomers = [
      {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        token: uuidv4(),
        phone: '+1-555-123-4567',
        contact: 'John Smith',
        website: 'https://www.acme.com',
        note: 'Key client since 2020',
        vatNumber: 'US123456789',
        addressLine1: '123 Main Street',
        addressLine2: 'Suite 100',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States',
        countryCode: 'US',
      },
      {
        name: 'TechStart Inc.',
        email: 'accounts@techstart.io',
        token: uuidv4(),
        phone: '+1-555-987-6543',
        contact: 'Sarah Johnson',
        website: 'https://www.techstart.io',
        note: 'Startup client with monthly retainer',
        vatNumber: 'US987654321',
        addressLine1: '456 Market Street',
        addressLine2: 'Floor 12',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'United States',
        countryCode: 'US',
      },
    ]

    for (const customerData of financeCustomers) {
      const customer = await prisma.customer.create({
        data: {
          id: uuidv4(),
          teamId: financeTeam.id,
          ...customerData,
        },
      })

      // Connect customer to tags
      const expensesTag = await prisma.tag.findFirst({
        where: {
          teamId: financeTeam.id,
          name: 'Expenses',
        },
      })

      if (expensesTag) {
        await prisma.customerTag.create({
          data: {
            id: uuidv4(),
            customerId: customer.id,
            tagId: expensesTag.id,
            teamId: financeTeam.id,
            createdAt: new Date(),
          },
        })
      }
    }

    // Create customers for Marketing Team
    const marketingCustomers = [
      {
        name: 'Global Brands Ltd.',
        email: 'marketing@globalbrands.com',
        token: uuidv4(),
        phone: '+1-555-789-0123',
        contact: 'Michael Brown',
        website: 'https://www.globalbrands.com',
        note: 'International client with multiple campaigns',
        vatNumber: 'GB123456789',
        addressLine1: '1 Oxford Street',
        addressLine2: '',
        city: 'London',
        state: '',
        zip: 'W1D 1BS',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
    ]

    for (const customerData of marketingCustomers) {
      const customer = await prisma.customer.create({
        data: {
          id: uuidv4(),
          teamId: marketingTeam.id,
          ...customerData,
        },
      })

      // Connect customer to tags
      const advertisingTag = await prisma.tag.findFirst({
        where: {
          teamId: marketingTeam.id,
          name: 'Advertising',
        },
      })

      if (advertisingTag) {
        await prisma.customerTag.create({
          data: {
            id: uuidv4(),
            customerId: customer.id,
            tagId: advertisingTag.id,
            teamId: marketingTeam.id,
            createdAt: new Date(),
          },
        })
      }
    }

    // Connect transactions to tags if any exist
    if (johnUser) {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: johnUser.id,
        },
        take: 2,
      })

      if (transactions.length > 0 && financeTags.length > 0) {
        const expensesTag = await prisma.tag.findFirst({
          where: {
            teamId: financeTeam.id,
            name: 'Expenses',
          },
        })

        if (expensesTag) {
          await prisma.transactionTag.create({
            data: {
              id: uuidv4(),
              transactionId: transactions[0].id,
              tagId: expensesTag.id,
              teamId: financeTeam.id,
              createdAt: new Date(),
            },
          })
        }
      }
    }

    console.log('Teams seeded successfully')
  } catch (error) {
    console.error('Error seeding teams:', error)
    throw error
  }
}
