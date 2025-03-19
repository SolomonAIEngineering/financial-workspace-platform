# @solomonai/loops

A package for integrating with the Loops email marketing platform.

## Installation

```bash
pnpm add @solomonai/loops
```

## Usage

### Initialize the client

```typescript
import { createLoopsClient } from '@solomonai/loops'

// Create a Loops client with your API key
const loopsClient = createLoopsClient('your-loops-api-key')

// Or use the default client that uses process.env.LOOPS_API_KEY
import { loops } from '@solomonai/loops'
```

### Working with Contacts

#### Create a contact

```typescript
import { createContact, loops } from '@solomonai/loops'

// Create a contact with the default client
await createContact(
  loops,
  'user@example.com',
  { firstName: 'John', lastName: 'Doe' },
  { 'list-id-1': true },
)

// Or with your own client
await createContact(
  loopsClient,
  'user@example.com',
  { firstName: 'John', lastName: 'Doe' },
  { 'list-id-1': true },
)
```

#### Find a contact

```typescript
import { findContact, loops } from '@solomonai/loops'

// Find a contact by email
const result = await findContact(loops, { email: 'user@example.com' })

// Or by userId
const result = await findContact(loops, { userId: 'user-123' })
```

#### Update a contact

```typescript
import { updateContact, loops } from '@solomonai/loops'

await updateContact(loops, {
  email: 'user@example.com',
  contactProperties: { firstName: 'Jane' },
  mailingLists: { 'list-id-1': true, 'list-id-2': false },
})
```

#### Delete a contact

```typescript
import { deleteContact, loops } from '@solomonai/loops'

await deleteContact(loops, { email: 'user@example.com' })
```

### Working with Events and Messages

#### Send an event

```typescript
import { sendEvent, loops } from '@solomonai/loops'

await sendEvent(loops, {
  email: 'user@example.com',
  eventName: 'signup_completed',
  contactProperties: { lastLogin: new Date().toISOString() },
  eventProperties: { source: 'website' },
})
```

#### Send a transactional email

```typescript
import { sendTransactionalEmail, loops } from '@solomonai/loops'

await sendTransactionalEmail(loops, {
  email: 'user@example.com',
  transactionalId: 'welcome-email-template',
  dataVariables: {
    userName: 'John',
    loginUrl: 'https://example.com/login',
  },
})
```

### Working with Properties and Lists

#### Get mailing lists

```typescript
import { getMailingLists, loops } from '@solomonai/loops'

const lists = await getMailingLists(loops)
```

#### Create a contact property

```typescript
import { createContactProperty, loops } from '@solomonai/loops'

await createContactProperty(
  loops,
  'favoriteColor',
  'string',
  "The user's favorite color",
)
```

## License

MIT
