# Transaction Management API

## Overview

This document outlines the comprehensive API design for managing financial transactions and recurring transactions within the SMB Financial Management Platform. The API enables full lifecycle management of transaction data with robust features for categorization, tagging, and reporting.

## Reference Architecture

- **@server/api/routers**: Implementation location for the transaction router endpoints
- **@schema.prisma**: Database models for `Transaction` and `RecurringTransaction` entities that define the structure and relationships for transaction data

## API Routers

### 1. Transaction Router (`/api/transactions`)

The transaction router handles all operations related to individual and batch transactions.

#### Core Transaction Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | Retrieve transactions with filtering, sorting, and pagination |
| `/api/transactions/:id` | GET | Get a specific transaction by ID |
| `/api/transactions` | POST | Create a new transaction |
| `/api/transactions/:id` | PUT | Update an existing transaction |
| `/api/transactions/:id` | DELETE | Delete a transaction |
| `/api/transactions/batch` | POST | Create multiple transactions in a single request |
| `/api/transactions/batch` | PUT | Update multiple transactions in a single request |
| `/api/transactions/batch` | DELETE | Delete multiple transactions in a single request |

#### Transaction Filtering and Searching

The GET `/api/transactions` endpoint supports comprehensive filtering to find transactions by various attributes:

```
GET /api/transactions?
  merchant=Netflix&
  category=ENTERTAINMENT&
  tags=subscription,streaming&
  method=Credit%20Card&
  assignedTo=user123&
  status=completed&
  dateFrom=2023-01-01&
  dateTo=2023-12-31&
  minAmount=10&
  maxAmount=100
```

#### Transaction Enhancement Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions/:id/tags` | POST | Associate tags with a transaction |
| `/api/transactions/:id/tags/:tagId` | DELETE | Remove a tag from a transaction |
| `/api/transactions/:id/category` | PUT | Update the category of a transaction |
| `/api/transactions/:id/merchant` | PUT | Update the merchant details of a transaction |
| `/api/transactions/:id/status` | PUT | Update the status of a transaction |
| `/api/transactions/:id/payment-method` | PUT | Update the payment method of a transaction |
| `/api/transactions/:id/assign` | PUT | Assign a transaction to a specific user |
| `/api/transactions/:id/notes` | PUT | Add or update notes for a transaction |
| `/api/transactions/:id/attachments` | POST | Add attachments to a transaction |
| `/api/transactions/:id/complete` | PUT | Mark a transaction as completed |
| `/api/transactions/categorize-by-merchant` | POST | Bulk categorize transactions by merchant name |
| `/api/transactions/manual-categorization` | POST | Manually categorize multiple transactions in one request |

### 2. Recurring Transaction Router (`/api/recurring-transactions`)

The recurring transaction router manages scheduled and repeating transactions.

#### Core Recurring Transaction Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recurring-transactions` | GET | List all recurring transactions with filtering options |
| `/api/recurring-transactions/:id` | GET | Get a specific recurring transaction |
| `/api/recurring-transactions` | POST | Create a new recurring transaction |
| `/api/recurring-transactions/:id` | PUT | Update a recurring transaction |
| `/api/recurring-transactions/:id` | DELETE | Delete a recurring transaction |
| `/api/recurring-transactions/:id/transactions` | GET | Get all transactions associated with a recurring transaction |

#### Recurring Transaction Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recurring-transactions/:id/tags` | POST | Associate tags with a recurring transaction |
| `/api/recurring-transactions/:id/notes` | PUT | Add or update notes for a recurring transaction |
| `/api/recurring-transactions/:id/category` | PUT | Update the category of a recurring transaction |
| `/api/recurring-transactions/:id/merchant` | PUT | Update the merchant details of a recurring transaction |
| `/api/recurring-transactions/:id/assign` | PUT | Assign a recurring transaction to a specific user |
| `/api/recurring-transactions/detect` | POST | Auto-detect recurring transactions from existing transactions |

## Request/Response Examples

### Creating a Transaction

```typescript
// POST /api/transactions
{
  "bankAccountId": "acc_123456789",
  "amount": 29.99,
  "date": "2023-05-15T12:00:00Z",
  "name": "Netflix Subscription",
  "merchantName": "Netflix, Inc.",
  "description": "Monthly streaming subscription",
  "pending": false,
  "category": "ENTERTAINMENT",
  "paymentMethod": "Credit Card",
  "tags": ["subscription", "entertainment"]
}
```

### Response

```typescript
{
  "id": "txn_987654321",
  "bankAccountId": "acc_123456789",
  "amount": 29.99,
  "date": "2023-05-15T12:00:00Z",
  "name": "Netflix Subscription",
  "merchantName": "Netflix, Inc.",
  "description": "Monthly streaming subscription",
  "pending": false,
  "category": "ENTERTAINMENT",
  "paymentMethod": "Credit Card",
  "tags": ["subscription", "entertainment"],
  "status": "completed",
  "createdAt": "2023-05-15T12:30:45Z",
  "updatedAt": "2023-05-15T12:30:45Z"
}
```

### Add Note to Transaction

```typescript
// PUT /api/transactions/:id/notes
{
  "notes": "This is a monthly subscription that renews on the 15th of each month. Shared account with family members."
}
```

### Response

```typescript
{
  "id": "txn_987654321",
  "notes": "This is a monthly subscription that renews on the 15th of each month. Shared account with family members.",
  "updatedAt": "2023-05-16T10:15:22Z"
}
```

### Add Note to Recurring Transaction

```typescript
// PUT /api/recurring-transactions/:id/notes
{
  "notes": "Netflix family plan. Consider reviewing when kids go to college next year."
}
```

### Response

```typescript
{
  "id": "rec_123456789",
  "notes": "Netflix family plan. Consider reviewing when kids go to college next year.",
  "updatedAt": "2023-05-16T10:22:45Z"
}
```

### Manually Categorize Transaction

```typescript
// PUT /api/transactions/:id/category
{
  "category": "ENTERTAINMENT",
  "subCategory": "Streaming Services",
  "customCategory": "Family Subscriptions"
}
```

### Response

```typescript
{
  "id": "txn_987654321",
  "category": "ENTERTAINMENT",
  "subCategory": "Streaming Services",
  "customCategory": "Family Subscriptions",
  "updatedAt": "2023-05-16T11:05:33Z"
}
```

### Bulk Categorize by Merchant

```typescript
// POST /api/transactions/categorize-by-merchant
{
  "merchantName": "Netflix, Inc.",
  "category": "ENTERTAINMENT",
  "subCategory": "Streaming Services",
  "applyToFuture": true
}
```

### Response

```typescript
{
  "success": true,
  "count": 12,
  "updatedTransactions": ["txn_123", "txn_456", "..."]
}
```

### Assign Transaction to User

```typescript
// PUT /api/transactions/:id/assign
{
  "assignedToUserId": "user_123456",
  "notifyUser": true
}
```

### Response

```typescript
{
  "id": "txn_987654321",
  "assignedToUserId": "user_123456",
  "assignedAt": "2023-05-17T09:30:15Z",
  "updatedAt": "2023-05-17T09:30:15Z"
}
```

### Creating a Recurring Transaction

```typescript
// POST /api/recurring-transactions
{
  "bankAccountId": "acc_123456789",
  "title": "Netflix Subscription",
  "description": "Monthly streaming service payment",
  "amount": 29.99,
  "currency": "USD",
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2023-05-15T00:00:00Z",
  "dayOfMonth": 15,
  "categorySlug": "entertainment",
  "tags": ["subscription", "entertainment"],
  "merchantName": "Netflix, Inc."
}
```

### Response

```typescript
{
  "id": "rec_123456789",
  "bankAccountId": "acc_123456789",
  "title": "Netflix Subscription",
  "description": "Monthly streaming service payment",
  "amount": 29.99,
  "currency": "USD",
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2023-05-15T00:00:00Z",
  "dayOfMonth": 15,
  "nextScheduledDate": "2023-06-15T00:00:00Z",
  "categorySlug": "entertainment",
  "tags": ["subscription", "entertainment"],
  "merchantName": "Netflix, Inc.",
  "status": "active",
  "createdAt": "2023-05-01T14:30:00Z",
  "updatedAt": "2023-05-01T14:30:00Z"
}
```

## Implementation Guidelines

### Data Validation

- Validate all incoming transaction data against the Prisma schema
- Ensure amount values follow proper decimal precision rules
- Validate dates to ensure they are in the proper format and range
- Perform validation on category values to ensure they match defined enum types
- For transaction categorization, validate that the category exists in the system

### Error Handling

- Implement consistent error responses with appropriate HTTP status codes
- For batch operations, implement partial success handling with detailed error reporting
- Include informative error messages that can guide frontend implementations

```typescript
// Example error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid transaction data",
    "details": [
      {
        "field": "amount",
        "error": "Amount must be a non-zero value"
      }
    ]
  }
}
```

### Authentication and Authorization

- Secure all transaction endpoints with proper authentication
- Implement row-level security to ensure users can only access their own transactions
- Add team-based permissions for shared account access
- For assignedTo functionality, verify that the target user has appropriate permissions

### Performance Considerations

- Implement pagination for transaction listing endpoints
- Add caching for frequently accessed transactions
- Use database indexes to optimize transaction queries
- Consider implementing cursor-based pagination for large result sets
- Create optimized queries for filtering by multiple attributes
- Consider pre-computing common filters for faster response times

### Categorization and Tagging Best Practices

- Implement machine learning suggestions for categorization
- Build a system to learn from user's manual categorizations for future automation
- Maintain a history of category changes for audit purposes
- Allow for bulk operations on similar transactions to improve user efficiency
- Create category rules that can be applied automatically to new transactions

### Webhook Support

- Add support for webhooks to notify external systems of transaction events
- Implement transaction lifecycle events (created, updated, categorized, etc.)
- Allow webhook configuration per user or per application
- Trigger notifications when transactions are assigned to users

## Testing Requirements

- Unit tests for all transaction router endpoints
- Integration tests for transaction creation, update, and deletion flows
- Performance tests for batch operations
- Security tests to verify proper authentication and authorization
- Test category and merchant rule application logic
- Verify proper note application and retrieval for both transaction types

## Documentation

- Generate OpenAPI/Swagger documentation for all transaction endpoints
- Include example requests and responses for each endpoint
- Document error codes and their meanings
- Provide code samples for common client implementations
- Create detailed examples for filtering and searching transactions
