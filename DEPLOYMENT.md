# Deployment Guide

## Fly.io Deployment

### Prerequisites

1. Install Fly.io CLI: <https://fly.io/docs/hands-on/install-flyctl/>
2. Login to Fly.io: `flyctl auth login`
3. Ensure secrets are configured (see Secrets section below)

### Deploying to Fly.io

Due to Next.js requiring `NEXT_PUBLIC_` environment variables at build time, you must pass them as build secrets:

```bash
flyctl deploy \
  --build-secret NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  --build-secret NEXT_PUBLIC_APP_URL
```

This command:

- Reads the secrets from your Fly.io app's secrets
- Passes them to Docker as build arguments
- Makes them available during the Next.js build process

### Secrets Configuration

Set the required secrets using:

```bash
# Clerk authentication (get from https://dashboard.clerk.com)
flyctl secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
flyctl secrets set CLERK_SECRET_KEY=sk_test_xxx

# Application URL
flyctl secrets set NEXT_PUBLIC_APP_URL=https://dnd-tracker.fly.dev

# MongoDB connection (get from MongoDB Atlas)
flyctl secrets set MONGODB_URI=mongodb+srv://xxx
```

### Automatic Deployments

To enable automatic deployments from GitHub:

1. Add the Fly.io GitHub Action to `.github/workflows/deploy.yml`
2. Configure the action to use `--build-secret` flags
3. Add `FLY_API_TOKEN` to GitHub secrets

### Troubleshooting

**Build fails with "InvalidCharacterError":**

- This indicates the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not being passed correctly
- Ensure you're using `flyctl deploy --build-secret` flags
- Verify secrets are set: `flyctl secrets list`

**500 Error on deployment:**

- Check logs: `flyctl logs`
- Verify all required secrets are set
- Ensure secrets don't contain invalid characters or encoding issues

### Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Build | Yes | Clerk publishable key (starts with `pk_`) |
| `NEXT_PUBLIC_APP_URL` | Build | Yes | Full URL of the deployed app |
| `CLERK_SECRET_KEY` | Runtime | Yes | Clerk secret key (starts with `sk_`) |
| `MONGODB_URI` | Runtime | Yes | MongoDB connection string |

**Note:** `NEXT_PUBLIC_` variables must be available at build time, hence the `--build-secret` requirement.
