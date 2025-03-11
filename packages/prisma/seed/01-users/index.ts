import { AccountStatus, PrismaClient, UserRole } from '@prisma/client'

import { hash } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

/**
 * Comprehensive user seeding function that creates detailed user profiles
 * with rich metadata for testing and development purposes.
 */
export const seedDatabase = async () => {
  try {
    console.log('Seeding users with comprehensive profiles...')

    // Create admin user with full profile details
    const adminPassword = await hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password_hash: adminPassword,
        role: UserRole.ADMIN,

        // User profile information
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        profileImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'System administrator with full access privileges. Responsible for platform configuration, user management, and system security.',
        timezone: 'America/New_York',
        language: 'en',

        // Professional details
        jobTitle: 'System Administrator',
        department: 'IT',
        employeeId: 'EMP001',
        hireDate: new Date('2020-01-01'),
        yearsOfExperience: 10,
        skills: [
          'System Administration',
          'Security',
          'Database Management',
          'Cloud Infrastructure',
          'Network Management',
          'Disaster Recovery',
          'User Support',
        ],

        // Contact information
        phoneNumber: '+1234567890',
        businessEmail: 'admin@example.com',
        businessPhone: '+1234567891',
        officeLocation: 'Headquarters - 10th Floor',

        // Organization data
        organizationName: 'Example Corp',
        organizationUnit: 'IT Department',
        teamName: 'Admin Team',

        // Business address
        addressLine1: '123 Main St',
        addressLine2: 'Suite 1000',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',

        // Preferences
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          frequency: 'immediate',
          types: {
            security: true,
            updates: true,
            marketing: false,
            transactions: true,
          },
        },
        displayPreferences: {
          theme: 'dark',
          compactView: false,
          fontSize: 'medium',
          colorBlindMode: false,
          dashboardLayout: [
            'transactions',
            'accounts',
            'insights',
            'notifications',
          ],
        },
        documentPreferences: {
          defaultFormat: 'pdf',
          autoSave: true,
          collaborationEnabled: true,
        },
        notificationsEnabled: true,

        // Social profiles
        linkedinProfile: 'linkedin.com/in/admin-user',
        twitterProfile: 'twitter.com/admin_user',
        githubProfile: 'github.com/admin-user',

        // System information
        version: 1,
        stripeCustomerId: 'cus_admin123',
        accountStatus: AccountStatus.ACTIVE,
        lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        uploadLimit: 500000000, // 500MB

        // Timestamps
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date(),
      },
    })

    // Create a variety of regular users with different roles and departments
    const regularUsers = [
      {
        username: 'john.doe',
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.MANAGER,
        jobTitle: 'Financial Director',
        department: 'Finance',
        bio: 'Financial expert with 15+ years of experience in corporate finance and investment management.',
        skills: [
          'Financial Analysis',
          'Investment Management',
          'Risk Assessment',
          'Strategic Planning',
          'Budgeting',
        ],
        hireDate: new Date('2019-03-15'),
        yearsOfExperience: 15,
        profileImage: 'men/10',
        officeLocation: 'Headquarters - 8th Floor',
        addressLine2: 'Apartment 8B',
        linkedinProfile: 'linkedin.com/in/john-doe-finance',
        lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        username: 'jane.smith',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.USER,
        jobTitle: 'Marketing Director',
        department: 'Marketing',
        bio: 'Creative marketing professional specializing in digital marketing strategies and brand development.',
        skills: [
          'Digital Marketing',
          'Brand Strategy',
          'Content Creation',
          'Social Media Management',
          'Market Research',
        ],
        hireDate: new Date('2020-06-01'),
        yearsOfExperience: 12,
        profileImage: 'women/10',
        officeLocation: 'Headquarters - 7th Floor',
        addressLine2: 'Suite 712',
        linkedinProfile: 'linkedin.com/in/jane-smith-marketing',
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        username: 'bob.johnson',
        email: 'bob.johnson@example.com',
        name: 'Bob Johnson',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: UserRole.USER,
        jobTitle: 'Sales Director',
        department: 'Sales',
        bio: 'Results-driven sales professional with a track record of exceeding targets and building strong client relationships.',
        skills: [
          'B2B Sales',
          'Negotiation',
          'Client Relationship Management',
          'Sales Strategy',
          'Team Leadership',
        ],
        hireDate: new Date('2021-01-15'),
        yearsOfExperience: 10,
        profileImage: 'men/15',
        officeLocation: 'Headquarters - 6th Floor',
        addressLine2: 'Office 605',
        linkedinProfile: 'linkedin.com/in/bob-johnson-sales',
        lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        username: 'sarah.williams',
        email: 'sarah.williams@example.com',
        name: 'Sarah Williams',
        firstName: 'Sarah',
        lastName: 'Williams',
        role: UserRole.USER,
        jobTitle: 'HR Manager',
        department: 'Human Resources',
        bio: 'Human resources professional focused on employee development, organizational culture, and talent acquisition.',
        skills: [
          'Recruitment',
          'Employee Relations',
          'Performance Management',
          'Training & Development',
          'HR Policy',
        ],
        hireDate: new Date('2020-09-01'),
        yearsOfExperience: 8,
        profileImage: 'women/22',
        officeLocation: 'Headquarters - 5th Floor',
        addressLine2: 'HR Department',
        linkedinProfile: 'linkedin.com/in/sarah-williams-hr',
        lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        username: 'michael.brown',
        email: 'michael.brown@example.com',
        name: 'Michael Brown',
        firstName: 'Michael',
        lastName: 'Brown',
        role: UserRole.USER,
        jobTitle: 'IT Manager',
        department: 'IT',
        bio: 'Technology leader with expertise in infrastructure management, cybersecurity, and digital transformation.',
        skills: [
          'IT Infrastructure',
          'Cybersecurity',
          'Cloud Computing',
          'Project Management',
          'IT Strategy',
        ],
        hireDate: new Date('2019-11-15'),
        yearsOfExperience: 12,
        profileImage: 'men/32',
        officeLocation: 'Headquarters - 9th Floor',
        addressLine2: 'Tech Center',
        linkedinProfile: 'linkedin.com/in/michael-brown-it',
        lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        username: 'emily.davis',
        email: 'emily.davis@example.com',
        name: 'Emily Davis',
        firstName: 'Emily',
        lastName: 'Davis',
        role: UserRole.USER,
        jobTitle: 'Product Manager',
        department: 'Product',
        bio: 'Product management professional with a passion for user-centered design and agile methodologies.',
        skills: [
          'Product Strategy',
          'Agile Methodologies',
          'User Research',
          'Roadmap Planning',
          'Cross-functional Leadership',
        ],
        hireDate: new Date('2021-03-01'),
        yearsOfExperience: 7,
        profileImage: 'women/28',
        officeLocation: 'Headquarters - 4th Floor',
        addressLine2: 'Product Lab',
        linkedinProfile: 'linkedin.com/in/emily-davis-product',
        lastLoginAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
    ]

    const defaultPassword = await hash('password123', 10)

    // Create each user with comprehensive details
    for (const userData of regularUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: uuidv4(),
          username: userData.username,
          email: userData.email,
          password_hash: defaultPassword,
          role: userData.role,

          // User profile information
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: `https://randomuser.me/api/portraits/${userData.firstName === 'Jane' || userData.firstName === 'Sarah' || userData.firstName === 'Emily' ? 'women' : 'men'}/${userData.profileImage.split('/')[1]}`,
          bio: userData.bio,
          timezone: 'America/New_York',
          language: 'en',

          // Professional details
          jobTitle: userData.jobTitle,
          department: userData.department,
          employeeId: `EMP${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0')}`,
          hireDate: userData.hireDate,
          yearsOfExperience: userData.yearsOfExperience,
          skills: userData.skills,

          // Contact information
          phoneNumber: `+1${Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(10, '0')}`,
          businessEmail: userData.email,
          businessPhone: `+1${Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(10, '0')}`,
          officeLocation: userData.officeLocation,

          // Organization data
          organizationName: 'Example Corp',
          organizationUnit: `${userData.department} Department`,
          teamName: `${userData.department} Team`,

          // Business address
          addressLine1: '123 Business Ave',
          addressLine2: userData.addressLine2 || 'Suite 100',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',

          // Preferences
          notificationPreferences: {
            email: true,
            push:
              userData.department === 'IT' || userData.department === 'Sales',
            sms: userData.department === 'Sales',
            frequency: userData.department === 'IT' ? 'immediate' : 'daily',
            types: {
              security: true,
              updates: true,
              marketing: userData.department === 'Marketing',
              transactions: userData.department === 'Finance',
            },
          },
          displayPreferences: {
            theme:
              userData.firstName === 'Jane' || userData.firstName === 'Emily'
                ? 'light'
                : 'dark',
            compactView:
              userData.department === 'IT' || userData.department === 'Finance',
            fontSize: 'medium',
            colorBlindMode: false,
            dashboardLayout: [
              userData.department.toLowerCase(),
              'accounts',
              'insights',
              'notifications',
            ],
          },
          documentPreferences: {
            defaultFormat: 'pdf',
            autoSave: true,
            collaborationEnabled: userData.department !== 'Finance',
          },
          notificationsEnabled: true,

          // Social profiles
          linkedinProfile: userData.linkedinProfile,
          twitterProfile: `twitter.com/${userData.username}`,
          githubProfile:
            userData.department === 'IT'
              ? `github.com/${userData.username}`
              : null,

          // System information
          version: 1,
          stripeCustomerId: `cus_${userData.username.replace('.', '_')}`,
          accountStatus: AccountStatus.ACTIVE,
          lastLoginAt: userData.lastLoginAt,
          uploadLimit:
            userData.department === 'Marketing' ||
            userData.department === 'Product'
              ? 1000000000
              : 100000000, // 1GB or 100MB

          // Timestamps
          createdAt: new Date(userData.hireDate),
          updatedAt: new Date(),
        },
      })
    }

    // Create complex organizational structure with manager-employee relationships
    // Finance department hierarchy
    const financeDirector = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' },
    })

    // Marketing department reports to Finance
    if (financeDirector) {
      await prisma.user.update({
        where: { email: 'jane.smith@example.com' },
        data: {
          managerUserId: financeDirector.id,
        },
      })

      // Sales department reports to Finance
      await prisma.user.update({
        where: { email: 'bob.johnson@example.com' },
        data: {
          managerUserId: financeDirector.id,
        },
      })
    }

    // HR and Product report to Admin
    if (admin) {
      await prisma.user.update({
        where: { email: 'sarah.williams@example.com' },
        data: {
          managerUserId: admin.id,
        },
      })

      await prisma.user.update({
        where: { email: 'emily.davis@example.com' },
        data: {
          managerUserId: admin.id,
        },
      })
    }

    // IT reports to Admin
    await prisma.user.update({
      where: { email: 'michael.brown@example.com' },
      data: {
        managerUserId: admin.id,
      },
    })

    // Create OAuth accounts for some users
    await prisma.oauthAccount.create({
      data: {
        id: uuidv4(),
        providerId: 'google',
        providerUserId: 'google_123456',
        userId: admin.id,
      },
    })

    const janeUser = await prisma.user.findUnique({
      where: { email: 'jane.smith@example.com' },
    })

    if (janeUser) {
      await prisma.oauthAccount.create({
        data: {
          id: uuidv4(),
          providerId: 'github',
          providerUserId: 'github_123456',
          userId: janeUser.id,
        },
      })
    }

    // Create active sessions for some users
    await prisma.session.create({
      data: {
        id: uuidv4(),
        user_id: admin.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        ip_address: '192.168.1.1',
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      },
    })

    if (janeUser) {
      await prisma.session.create({
        data: {
          id: uuidv4(),
          user_id: janeUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          ip_address: '192.168.1.2',
          user_agent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        },
      })
    }

    console.log(
      'Users seeded successfully with comprehensive profiles and organizational structure',
    )
  } catch (error) {
    console.error('Error seeding users:', error)
    throw error
  }
}
