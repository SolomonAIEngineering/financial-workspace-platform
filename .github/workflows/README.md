# GitHub Actions Workflows

## Database Migration Workflow

The `db-migrate.yml` workflow automatically runs database migrations when code is merged to the main branch.

### Workflow Details

- **Trigger**: Push to the `main` branch
- **Environment**: production
- **Action**: Runs `pnpm db:deploy` to apply Prisma migrations to the database

### Required Secrets

For this workflow to function correctly, the following secrets must be set in your GitHub repository:

- `DATABASE_URL`: The connection string for your production database

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add the secret name (e.g., `DATABASE_URL`) and its value
5. Click "Add secret"

### Configuration

You may need to adjust the workflow configuration based on your specific needs:

- Update Node.js version if required
- Add additional environment variables needed for your database connection
- Modify the deployment environment name if you use a different environment naming scheme

### Troubleshooting

If migrations fail:

1. Check the GitHub Actions logs for specific error messages
2. Verify that your database connection string is correct
3. Ensure the database user has sufficient permissions to run migrations
4. Check if your Prisma schema is compatible with your production database
