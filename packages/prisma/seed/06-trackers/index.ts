import { PrismaClient, TrackerStatus } from '@prisma/client'

import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const seedDatabase = async () => {
  try {
    console.log('Seeding trackers...')

    // Get users and teams to associate trackers with
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
        'No users found to associate trackers with. Skipping tracker seeding.',
      )
      return
    }

    // Get teams
    const teams = await prisma.team.findMany({
      take: 2,
    })

    if (teams.length === 0) {
      console.log(
        'No teams found to associate trackers with. Skipping tracker seeding.',
      )
      return
    }

    // Get customers
    const customers = await prisma.customer.findMany({
      take: 2,
    })

    // Create tracker projects for each user
    for (let i = 0; i < Math.min(users.length, teams.length); i++) {
      const user = users[i]
      const team = teams[i]
      const customer = customers.length > i ? customers[i] : null

      // Create enhanced tracker projects with more detailed data
      const projects = [
        {
          name: 'Website Redesign',
          description:
            'Complete redesign of the company website with modern UI/UX principles, responsive design, and improved performance metrics.',
          rate: 100,
          currency: 'USD',
          status: TrackerStatus.IN_PROGRESS,
          billable: true,
          estimate: 10000,
          tags: ['design', 'development', 'web', 'billable', 'high-priority'],
        },
        {
          name: 'Marketing Campaign',
          description:
            'Q2 Marketing Campaign focusing on social media engagement, content marketing, and email campaigns to increase brand awareness.',
          rate: 85,
          currency: 'USD',
          status: TrackerStatus.IN_PROGRESS,
          billable: true,
          estimate: 5000,
          tags: [
            'marketing',
            'social-media',
            'content',
            'billable',
            'medium-priority',
          ],
        },
        {
          name: 'Financial Audit',
          description:
            'Annual financial audit including review of financial statements, tax compliance, and internal controls assessment.',
          rate: 150,
          currency: 'USD',
          status: TrackerStatus.COMPLETED,
          billable: true,
          estimate: 7500,
          tags: ['finance', 'audit', 'compliance', 'billable', 'completed'],
        },
        {
          name: 'Product Development',
          description:
            'Development of new product features based on customer feedback and market research.',
          rate: 120,
          currency: 'USD',
          status: TrackerStatus.IN_PROGRESS,
          billable: true,
          estimate: 15000,
          tags: [
            'development',
            'product',
            'innovation',
            'billable',
            'high-priority',
          ],
        },
        {
          name: 'Internal Training',
          description:
            'Employee training program for new software tools and methodologies.',
          rate: 75,
          currency: 'USD',
          status: TrackerStatus.IN_PROGRESS,
          billable: false,
          estimate: 3000,
          tags: ['training', 'internal', 'non-billable', 'low-priority'],
        },
      ]

      const createdProjects = []

      for (const projectData of projects) {
        const project = await prisma.trackerProject.create({
          data: {
            id: uuidv4(),
            name: projectData.name,
            description: projectData.description,
            rate: projectData.rate,
            currency: projectData.currency,
            status: projectData.status,
            billable: projectData.billable,
            estimate: projectData.estimate,
            teamId: team.id,
            customerId: customer?.id,
            createdAt: new Date(),
          },
        })

        createdProjects.push(project)

        // Create tags for projects with enhanced data
        for (const tagName of projectData.tags) {
          // Create a unique tag ID based on the tag name and team ID
          const tagId = uuidv4()

          // Create the tag directly with minimal fields
          try {
            await prisma.$executeRaw`
                            INSERT INTO tags (id, name, team_id, created_at)
                            VALUES (${tagId}, ${tagName}, ${team.id}, ${new Date()})
                            ON CONFLICT (id) DO NOTHING
                        `

            // Get the created or existing tag
            const tag = await prisma.tag.findFirst({
              where: {
                name: tagName,
                teamId: team.id,
              },
            })

            if (tag) {
              // Create the project tag relationship
              await prisma.trackerProjectTag.create({
                data: {
                  id: uuidv4(),
                  trackerProjectId: project.id,
                  tagId: tag.id,
                  teamId: team.id,
                  createdAt: new Date(),
                },
              })
            }
          } catch (error) {
            console.error(`Error creating tag ${tagName}:`, error)
            // Continue with the next tag
          }
        }

        // Create enhanced tracker entries for each project with more realistic data
        const numberOfEntries = Math.floor(Math.random() * 10) + 5 // 5-15 entries per project
        const taskTypes = [
          'Research',
          'Design',
          'Development',
          'Testing',
          'Meeting',
          'Documentation',
          'Review',
        ]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

        for (let i = 0; i < numberOfEntries; i++) {
          const dayOffset = Math.floor(Math.random() * 30) // Random day within the last 30 days
          const date = new Date(
            startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
          )

          // More realistic work durations
          const hours = Math.random() * 4 + 0.5 // 0.5 to 4.5 hours
          const roundedHours = Math.round(hours * 4) / 4 // Round to nearest quarter hour

          // More realistic start times
          const startHour = 8 + Math.floor(Math.random() * 8) // Start between 8 AM and 4 PM
          const startMinute = Math.floor(Math.random() * 4) * 15 // Start at 0, 15, 30, or 45 minutes

          const start = new Date(date)
          start.setHours(startHour, startMinute, 0)

          const stop = new Date(start)
          stop.setTime(start.getTime() + roundedHours * 60 * 60 * 1000)

          const duration = Math.round(roundedHours * 60 * 60) // in seconds

          // More descriptive task names
          const taskType =
            taskTypes[Math.floor(Math.random() * taskTypes.length)]
          const taskNumber = i + 1
          const taskDescription = `${taskType}: ${projectData.name} - Task ${taskNumber}`

          // Add more detailed descriptions for some entries
          let detailedDescription = ''
          if (Math.random() > 0.7) {
            // 30% chance of having a detailed description
            const details = [
              'Conducted research on competitor websites',
              'Created wireframes for homepage redesign',
              'Implemented responsive design for mobile devices',
              'Fixed navigation menu bugs',
              'Team meeting to discuss project timeline',
              'Client call to review progress',
              'Updated documentation with new requirements',
              'Code review for recent changes',
              'Performance optimization for page load times',
              'User testing session with focus group',
            ]
            detailedDescription =
              details[Math.floor(Math.random() * details.length)]
          }

          const finalDescription = detailedDescription
            ? `${taskDescription} - ${detailedDescription}`
            : taskDescription

          await prisma.trackerEntry.create({
            data: {
              id: uuidv4(),
              projectId: project.id,
              assignedId: user.id,
              description: finalDescription,
              date: date,
              start: start,
              stop: stop,
              duration: duration,
              rate: projectData.rate,
              currency: projectData.currency,
              billed: Math.random() > 0.5, // 50% chance of being billed
              teamId: team.id,
              createdAt: new Date(),
            },
          })
        }
      }

      // Create enhanced tracker reports with more detailed data
      for (const project of createdProjects) {
        // Create weekly report
        await prisma.trackerReport.create({
          data: {
            id: uuidv4(),
            projectId: project.id,
            createdBy: user.id,
            linkId: uuidv4(),
            shortLink: `weekly-${project.name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`,
            teamId: team.id,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          },
        })

        // Create monthly report
        await prisma.trackerReport.create({
          data: {
            id: uuidv4(),
            projectId: project.id,
            createdBy: user.id,
            linkId: uuidv4(),
            shortLink: `monthly-${project.name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`,
            teamId: team.id,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
          },
        })
      }
    }

    console.log('Trackers seeded successfully')
  } catch (error) {
    console.error('Error seeding trackers:', error)
    throw error
  }
}
