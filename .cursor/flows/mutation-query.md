# Creating New Mutations and Queries

Follow these steps in order, using existing files as references:

1. Update Schema (if needed)

   - Edit `packages/prisma/schema.prisma`
   - Run `pnpm prisma generate` and `pnpm prisma db push`
   - Reference: Existing models in `schema.prisma`

2. Create or Update Router Structure

   - Create a directory for your feature if it doesn't exist: `packages/trpc/src/routers/<feature-name>/`
   - Create a schema file: `packages/trpc/src/routers/<feature-name>/schema.ts` for Zod validations
   - Create a handlers directory: `packages/trpc/src/routers/<feature-name>/handlers/`
   - Create an index file: `packages/trpc/src/routers/<feature-name>/index.ts` to export the router
   - Reference: Existing routers like `packages/trpc/src/routers/user/` or `packages/trpc/src/routers/document/`

3. Create Input Schema

   - Define Zod schemas in `packages/trpc/src/routers/<feature-name>/schema.ts`
   - Include validation rules and error messages
   - Reference: Other schema files in existing routers

   ```typescript
   // Example schema.ts
   import { z } from 'zod'
   
   export const createItemSchema = z.object({
     name: z.string().min(1, 'Name is required'),
     description: z.string().optional(),
     categoryId: z.string().uuid('Invalid category ID'),
   })
   ```

4. Create Query Handler (for read operations)

   - Location: `packages/trpc/src/routers/<feature-name>/handlers/get-<resource>.ts`
   - Choose the appropriate procedure type:
     - `protectedProcedure` for authenticated users
     - `teamOwnerProcedure` for team owner operations
     - `teamMemberProcedure` for team member operations
     - `teamAccessProcedure` for any team user operations
     - `adminProcedure` for admin-only routes
   - Add OpenAPI metadata for documentation
   - Reference: Existing handlers like `get-user.ts` or `get-documents.ts`

   ```typescript
   // Example query handler
   import { protectedProcedure } from '../../../middlewares/procedures'
   import { prisma } from '@solomonai/prisma/server'
   import { getItemSchema } from '../schema'
   
   /**
    * Get item by ID
    * 
    * Retrieves detailed information for a specific item
    * 
    * @input id - ID of the item to retrieve
    * @returns Item details
    */
   export const getItem = protectedProcedure
     .meta({
       openapi: {
         method: 'GET',
         path: '/items/{id}',
         summary: 'Get item details',
         description: 'Retrieves detailed information for a specific item',
         tags: ['items'],
         protect: true,
       }
     })
     .input(getItemSchema)
     .query(async ({ ctx, input }) => {
       const userId = ctx.user.id
       
       const item = await prisma.item.findUnique({
         where: { id: input.id },
         include: { category: true }
       })
       
       return item
     })
   ```

5. Create Mutation Handler (for write operations)

   - Location: `packages/trpc/src/routers/<feature-name>/handlers/create-<resource>.ts`
   - Use appropriate resource procedure if applicable:
     - `resourceProcedure` for resource creation with plan limits
     - `teamResourceProcedure` for team-based resource creation
     - `limitedProcedure` for operations with tier limits
   - Add OpenAPI metadata for documentation
   - Reference: Existing handlers like `create-document.ts` or `update-settings.ts`

   ```typescript
   // Example mutation handler
   import { resourceProcedure } from '../../../middlewares/procedures'
   import { prisma } from '@solomonai/prisma/server'
   import { createItemSchema } from '../schema'
   
   /**
    * Create new item
    * 
    * Creates a new item associated with the current user
    * 
    * @input name - Item name
    * @input description - Optional item description
    * @input categoryId - Category ID to associate the item with
    * @returns Created item
    */
   export const createItem = resourceProcedure({
     resource: 'items',
     errorMessage: 'You have reached the maximum number of items for your plan',
   })
     .meta({
       openapi: {
         method: 'POST',
         path: '/items',
         summary: 'Create new item',
         description: 'Creates a new item associated with the current user',
         tags: ['items'],
         protect: true,
       }
     })
     .input(createItemSchema)
     .mutation(async ({ ctx, input }) => {
       const userId = ctx.user.id
       
       const item = await prisma.item.create({
         data: {
           name: input.name,
           description: input.description,
           categoryId: input.categoryId,
           userId
         }
       })
       
       return item
     })
   ```

6. Create Router Index File

   - Import all handlers in `packages/trpc/src/routers/<feature-name>/index.ts`
   - Export the router using `createRouter`
   - Reference: Other router index files

   ```typescript
   // Example index.ts
   import { createRouter } from '../../trpc'
   import { getItem } from './handlers/get-item'
   import { createItem } from './handlers/create-item'
   import { updateItem } from './handlers/update-item'
   import { deleteItem } from './handlers/delete-item'
   
   export const itemsRouter = createRouter({
     getItem,
     createItem,
     updateItem,
     deleteItem,
   })
   ```

7. Update Root Router

   - File: `packages/trpc/src/root.ts`
   - Import the new router and add it to the `appRouter`
   - Reference: Existing router imports and additions

   ```typescript
   // Example root.ts addition
   import { itemsRouter } from './routers/items'
   
   export const appRouter = createRouter({
     // Existing routers
     items: itemsRouter,
   })
   ```

8. Create Query File

   - Location: `apps/web/src/hooks/queries/query-<feature>.tsx`
   - Use the `createClientQuery` pattern exactly as in existing query files
   - Reference: `apps/web/src/hooks/queries/query-template.tsx` or `query-discussions.tsx`
   
   ```typescript
   // Example query file (follow exact project patterns)
   import { createClientQuery } from '../createClientQuery'
   
   export const itemQueries = createClientQuery({
     items: {
       all: {
         queryFn: (ctx) => ctx.client.items.getAll.query(),
         options: { staleTime: 5 * 60 * 1000 }, // 5 minutes
       },
       byId: {
         queryFn: (ctx, id: string) => ctx.client.items.getItem.query({ id }),
         options: { staleTime: 5 * 60 * 1000 },
       },
     },
   })
   ```

9. Update API Hook

   - Import the new query in the appropriate API hook file
   - Maintain the existing structure (e.g., `document`, `version`, etc.)
   - Only add queries, not mutations
   - Follow the exact pattern used in the existing hooks
   
   ```typescript
   // Example update to useApi.ts or similar
   import { itemQueries } from './queries/query-items'
   
   export const useApi = () => {
     // Existing code...
     
     return {
       // Existing API objects
       items: itemQueries,
     }
   }
   ```

10. Create Mutation Hook (if needed)

    - Location: `apps/web/src/hooks/mutations/use<Action><Feature>Mutation.ts`
    - Follow the exact pattern used in existing mutation hooks
    - Reference: `apps/web/src/hooks/mutations/useCreateCommentMutation.ts`
    
    ```typescript
    // Example mutation hook (follow exact project patterns)
    import { trpc } from '@/trpc/client'
    import { useMutation } from '@tanstack/react-query'
    
    export const useCreateItemMutation = () => {
      return useMutation({
        mutationFn: (input: { name: string; description?: string; categoryId: string }) => {
          return trpc.items.createItem.mutate(input)
        },
      })
    }
    ```

11. Implement in Components

    - Use the project's hooks pattern in components, not direct tRPC calls
    - Reference: `apps/web/src/components/settings/settings-modal.tsx` or similar components
    - Use React Query options as needed:
      - `enabled: boolean`: disable when input schema is invalid
      - `placeholderData: keepPreviousData`: use when relevant
    - Example query usage:

    ```tsx
    // Component example using the project's hooks pattern
    const api = useApi()
    
    const [data, { isLoading }] = api.items.byId.useQuery(itemId, {
      enabled: !!itemId,
    })
    
    // Example mutation usage
    const { mutate, isLoading: isCreating } = useCreateItemMutation()
    
    const handleSubmit = (formData) => {
      mutate(formData, {
        onSuccess: () => {
          toast.success('Item created successfully')
          router.push('/items')
        },
        onError: (error) => {
          toast.error(error.message)
        }
      })
    }
    ```

Remember:

- Always add JSDoc comments to your tRPC handlers explaining inputs and outputs
- Use Zod for thorough input validation
- Use `AppError` for domain-specific error handling
- Access the authenticated user via `ctx.user` and team info via `ctx.teamId`
- Use the appropriate procedure type based on authorization needs
- Add OpenAPI metadata for all public-facing endpoints
- Keep queries optimized with appropriate `select` clauses
- Use transactions for operations that modify multiple tables
- Always check the existing structure in `useApi.ts` before adding new queries
- Maintain consistency with the project's hooks patterns and file structures
- Use `useAuthGuard` for protected actions in components
