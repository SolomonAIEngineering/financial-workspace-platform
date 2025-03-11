# Database Seeding for SMB Financial Management Platform

This directory contains scripts to seed the database with comprehensive test data for development and testing purposes.

## Structure

The seed data is organized into modules by entity type:

- `01-users`: User accounts with various roles and profiles
- `02-bank-data`: Bank connections, accounts, and transactions
- `03-documents`: Documents, document versions, and discussions
- `04-teams`: Teams and team memberships
- `05-invoices`: Customers, invoices, and invoice templates
- `06-trackers`: Time tracking projects, entries, and reports

## Running the Seeds

To run the seed scripts:

1. Install dependencies:

   ```
   cd seed
   npm install
   ```

2. Run the seed command:
   ```
   npm run seed
   ```

## Seed Order

The seeds are executed in a specific order to respect dependencies between entities:

1. Users are seeded first as they are referenced by most other entities
2. Bank data is seeded next
3. Documents and related entities follow
4. Teams and team memberships are seeded
5. Invoices and customers are created
6. Time tracking data is seeded last

## Adding New Seed Modules

To add a new seed module:

1. Create a new directory in the `seed` folder with a descriptive name
2. Create an `index.ts` file in the new directory
3. Export a `seedDatabase` async function from the module
4. Add the directory name to the `seedOrder` array in `seed-database.ts` if order matters

Example:

```typescript
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const seedDatabase = async () => {
  try {
    console.log('Seeding new entity...')

    // Seeding logic here

    console.log('New entity seeded successfully')
  } catch (error) {
    console.error('Error seeding new entity:', error)
    throw error
  }
}
```

## Data Relationships

The seed data maintains proper relationships between entities:

- Users have bank accounts, documents, and team memberships
- Teams have members and owners
- Documents have versions and discussions
- Invoices are linked to customers
- Time tracking entries are linked to projects

This ensures the seeded database represents a realistic application state for testing and development.
