/**
 * @file seed-database.ts
 * @description Database seeding orchestration script
 *
 * This script orchestrates the seeding of the database with initial data for development
 * and testing purposes. It loads and executes seed modules in a specific order to ensure
 * proper handling of dependencies between different data types.
 *
 * The script follows these steps:
 * 1. Processes seed modules in a predefined order (users, bank data, documents, etc.)
 * 2. Dynamically loads each seed module and executes its seedDatabase function
 * 3. Handles errors gracefully, allowing the seeding process to continue even if one module fails
 * 4. Processes any additional seed modules found in the seed directory but not in the predefined order
 *
 * Each seed module should export a seedDatabase() function that performs the actual data seeding.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Main database seeding function
 *
 * This function orchestrates the seeding process by:
 * 1. Processing seed modules in a predefined order to respect dependencies
 * 2. Dynamically loading and executing each seed module
 * 3. Processing any additional seed modules not in the predefined order
 *
 * The predefined order ensures that dependencies are respected (e.g., users must be
 * created before bank data that references them).
 *
 * @returns {Promise<void>} A promise that resolves when all seeding is complete
 */
const seedDatabase = async () => {
  console.log('[SEEDING]: Starting database seeding process')

  // Define the order of seeding to respect dependencies
  const seedOrder = [
    '01-users',
    '02-bank-data',
    '03-documents',
    '04-teams',
    '05-invoices',
    '06-trackers',
  ]

  // Seed in the defined order
  for (const dir of seedOrder) {
    const seedPath = path.join(__dirname, './seed', dir)

    // Check if directory exists
    if (fs.existsSync(seedPath)) {
      try {
        console.log(`[SEEDING]: Processing ${dir}`)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(path.join(seedPath, 'index'))

        if ('seedDatabase' in mod && typeof mod.seedDatabase === 'function') {
          await mod.seedDatabase()
        } else {
          console.log(`[SEEDING]: No seedDatabase function found in ${dir}`)
        }
      } catch (e) {
        console.log(`[SEEDING]: Seed failed for ${dir}`)
        console.error(e)
      }
    } else {
      console.log(`[SEEDING]: Directory ${dir} not found, skipping`)
    }
  }

  // Check for any additional seed directories not in the predefined order
  const allDirs = fs.readdirSync(path.join(__dirname, './seed'))

  for (const dir of allDirs) {
    if (!seedOrder.includes(dir)) {
      const seedPath = path.join(__dirname, './seed', dir)
      const stat = fs.statSync(seedPath)

      if (stat.isDirectory()) {
        try {
          console.log(`[SEEDING]: Processing additional directory ${dir}`)
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mod = require(path.join(seedPath, 'index'))

          if ('seedDatabase' in mod && typeof mod.seedDatabase === 'function') {
            await mod.seedDatabase()
          } else {
            console.log(`[SEEDING]: No seedDatabase function found in ${dir}`)
          }
        } catch (e) {
          console.log(`[SEEDING]: Seed failed for ${dir}`)
          console.error(e)
        }
      }
    }
  }

  console.log('[SEEDING]: Database seeding completed')
}

/**
 * Self-executing function to run the seeding process
 *
 * This immediately invokes the seedDatabase function and handles the promise
 * resolution or rejection, exiting the process with an appropriate status code.
 */
seedDatabase()
  .then(() => {
    console.log('Database seeded successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
    process.exit(1)
  })
