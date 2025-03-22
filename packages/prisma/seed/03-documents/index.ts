import { PrismaClient, TextStyle } from '@prisma/client'

import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Define the enum values directly since they're not exported from @prisma/client
const SentimentType = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
  MIXED: 'MIXED',
}

const FollowStatus = {
  NONE: 'NONE',
  FOLLOWING: 'FOLLOWING',
  MUTED: 'MUTED',
  BOOKMARKED: 'BOOKMARKED',
}

const MentionType = {
  USER: 'USER',
  TEAM: 'TEAM',
  ALL: 'ALL',
  ROLE: 'ROLE',
  CUSTOM: 'CUSTOM',
}

export const seedDatabase = async () => {
  try {
    console.log('Seeding documents...')

    // Get users to associate documents with
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'john.doe@example.com' },
          { email: 'admin@example.com' },
          { email: 'yoanyomba@solomon-ai.co' },
        ],
      },
    })

    if (users.length === 0) {
      console.log(
        'No users found to associate documents with. Skipping document seeding.',
      )
      return
    }

    for (const user of users) {
      // Create a parent document with enhanced content
      const parentDocument = await prisma.document.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          title: `${user.firstName || 'User'}'s Financial Plan`,
          content: 'This is the main financial planning document.',
          contentRich: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [
                  {
                    type: 'text',
                    text: `${user.firstName || 'User'}'s Financial Plan`,
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This comprehensive financial plan outlines your financial goals, strategies, and action items for the next 5 years.',
                  },
                ],
              },
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [
                  {
                    type: 'text',
                    text: 'Executive Summary',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This plan addresses your key financial priorities: debt reduction, emergency savings, retirement planning, and investment growth.',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Current net worth: $250,000',
                            marks: [{ type: 'bold' }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Target net worth (5 years): $500,000',
                            marks: [{ type: 'bold' }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Monthly savings target: $2,500',
                            marks: [{ type: 'bold' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          isPublished: true,
          isArchived: false,
          pinned: true,
          tags: ['finance', 'planning', 'important', 'long-term', 'goals'],
          isTemplate: false,
          status: 'published',
          textStyle: TextStyle.DEFAULT,
          smallText: false,
          fullWidth: true,
          lockPage: false,
          toc: true,
          coverImage:
            'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Create child documents with enhanced content
      const childDocuments = [
        {
          title: 'Budget Overview',
          content: 'Monthly budget breakdown and analysis.',
          tags: ['budget', 'monthly', 'expenses', 'income', 'cash-flow'],
          icon: '💰',
          richContent: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Budget Overview' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This document provides a detailed breakdown of your monthly budget, including income sources, fixed expenses, variable expenses, and savings allocations.',
                  },
                ],
              },
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Income Sources' }],
              },
              {
                type: 'table',
                content: [
                  {
                    type: 'tableRow',
                    content: [
                      {
                        type: 'tableHeader',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Source' }],
                          },
                        ],
                      },
                      {
                        type: 'tableHeader',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Amount' }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableRow',
                    content: [
                      {
                        type: 'tableCell',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Primary Income' }],
                          },
                        ],
                      },
                      {
                        type: 'tableCell',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: '$5,000' }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableRow',
                    content: [
                      {
                        type: 'tableCell',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Side Business' }],
                          },
                        ],
                      },
                      {
                        type: 'tableCell',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: '$1,200' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          title: 'Investment Strategy',
          content: 'Long-term investment goals and strategy.',
          tags: [
            'investment',
            'stocks',
            'retirement',
            'portfolio',
            'asset-allocation',
          ],
          icon: '📈',
          richContent: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Investment Strategy' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This document outlines your investment strategy, including asset allocation, risk tolerance, and long-term goals.',
                  },
                ],
              },
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Asset Allocation' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Your current asset allocation is designed for moderate growth with a 15-year time horizon:',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Stocks: 60%' }],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Bonds: 30%' }],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Alternative Investments: 10%',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          title: 'Tax Planning',
          content: 'Tax optimization strategies for the current fiscal year.',
          tags: ['tax', 'planning', 'fiscal', 'deductions', 'credits'],
          icon: '📝',
          richContent: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Tax Planning' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This document outlines tax optimization strategies for the current fiscal year, including deductions, credits, and retirement account contributions.',
                  },
                ],
              },
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Key Tax Strategies' }],
              },
              {
                type: 'orderedList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Maximize 401(k) contributions',
                            marks: [{ type: 'bold' }],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Contribute the maximum allowed to reduce taxable income.',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Health Savings Account (HSA)',
                            marks: [{ type: 'bold' }],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Contribute to HSA for triple tax advantage.',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ]

      for (const docData of childDocuments) {
        const childDoc = await prisma.document.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            parentDocumentId: parentDocument.id,
            title: docData.title,
            content: docData.content,
            contentRich: docData.richContent,
            isPublished: true,
            isArchived: false,
            pinned: false,
            tags: docData.tags,
            isTemplate: false,
            status: 'published',
            textStyle: TextStyle.DEFAULT,
            smallText: false,
            fullWidth: false,
            lockPage: false,
            toc: true,
            icon: docData.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        // Create document versions for each child document
        await prisma.documentVersion.create({
          data: {
            id: uuidv4(),
            documentId: childDoc.id,
            userId: user.id,
            title: docData.title,
            contentRich: docData.richContent,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        })

        // Create a more recent version to show document history
        await prisma.documentVersion.create({
          data: {
            id: uuidv4(),
            documentId: childDoc.id,
            userId: user.id,
            title: docData.title,
            contentRich: docData.richContent,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        // Create discussions for each child document
        if (docData.title === 'Budget Overview') {
          const discussion = await prisma.discussion.create({
            data: {
              id: uuidv4(),
              documentId: childDoc.id,
              userId: user.id,
              documentContent:
                'Should we increase the emergency fund allocation?',
              documentContentRich: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Should we increase the emergency fund allocation?',
                      },
                    ],
                  },
                ],
              },
              isResolved: false,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
          })

          // Add a comment to the discussion
          const comment = await prisma.comment.create({
            data: {
              id: uuidv4(),
              discussionId: discussion.id,
              userId: user.id,
              content:
                'I think we should increase it to cover 6 months of expenses.',
              contentRich: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'I think we should increase it to cover 6 months of expenses.',
                      },
                    ],
                  },
                ],
              },
              isEdited: false,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
          })

          // Add a reply to the comment
          const replyComment = await prisma.comment.create({
            data: {
              id: uuidv4(),
              discussionId: discussion.id,
              userId: user.id,
              content:
                'I agree. Given the current economic uncertainty, having a larger emergency fund makes sense.',
              contentRich: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'I agree. Given the current economic uncertainty, having a larger emergency fund makes sense.',
                      },
                    ],
                  },
                ],
              },
              isEdited: false,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
          })

          // Update the discussion to mark it as resolved
          await prisma.discussion.update({
            where: { id: discussion.id },
            data: {
              isResolved: true,
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
          })
        }

        // Create a second discussion for the Investment Strategy document
        if (docData.title === 'Investment Strategy') {
          const discussion = await prisma.discussion.create({
            data: {
              id: uuidv4(),
              documentId: childDoc.id,
              userId: user.id,
              documentContent:
                'Should we adjust our stock allocation given current market conditions?',
              documentContentRich: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Should we adjust our stock allocation given current market conditions?',
                      },
                    ],
                  },
                ],
              },
              isResolved: false,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
          })

          // Add a comment to the discussion
          await prisma.comment.create({
            data: {
              id: uuidv4(),
              discussionId: discussion.id,
              userId: user.id,
              content:
                'I suggest we maintain our current allocation and continue dollar-cost averaging.',
              contentRich: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'I suggest we maintain our current allocation and continue dollar-cost averaging.',
                      },
                    ],
                  },
                ],
              },
              isEdited: false,
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
          })
        }
      }

      // Create file attachments for the parent document
      const fileAttachments = [
        {
          name: 'financial_summary.pdf',
          size: 1024 * 1024 * 2, // 2MB
          type: 'application/pdf',
          url: 'https://example.com/files/financial_summary.pdf',
          appUrl: 'https://app.example.com/files/financial_summary.pdf',
        },
        {
          name: 'investment_performance.xlsx',
          size: 1024 * 1024 * 1.5, // 1.5MB
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          url: 'https://example.com/files/investment_performance.xlsx',
          appUrl: 'https://app.example.com/files/investment_performance.xlsx',
        },
        {
          name: 'retirement_calculator.xlsx',
          size: 1024 * 1024 * 0.8, // 0.8MB
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          url: 'https://example.com/files/retirement_calculator.xlsx',
          appUrl: 'https://app.example.com/files/retirement_calculator.xlsx',
        },
      ]

      for (const fileData of fileAttachments) {
        await prisma.file.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            documentId: parentDocument.id,
            size: fileData.size,
            url: fileData.url,
            appUrl: fileData.appUrl,
            type: fileData.type,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }
    }

    console.log('Documents seeded successfully')
  } catch (error) {
    console.error('Error seeding documents:', error)
  }
}
