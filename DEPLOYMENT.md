# Deployment Guide

## Fly.io Deployment

### Prerequisites

1. Install Fly.io CLI: <https://fly.io/docs/hands-on/install-flyctl/>
2. Login to Fly.io: `flyctl auth login`
3. Ensure secrets are configured (see Secrets section below)

### Deploying to Fly.io

Simply run:

```bash
flyctl deploy
```

The deployment uses Fly.io secrets which are automatically available at runtime in the container environment. No special build flags needed!

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

You can set up automatic deployments using Fly.io's GitHub integration or GitHub Actions.

For Fly.io's built-in GitHub integration:

1. Visit <https://fly.io/apps/dnd-tracker/github>
2. Connect your GitHub repository
3. Configure automatic deployments on push to `main`

### Troubleshooting

**500 Error "Missing publishableKey":**

- Verify secrets are set: `flyctl secrets list`
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and other required secrets exist
- Redeploy with `flyctl deploy --no-cache` to force a fresh build

**Check application logs:**

```bash
flyctl logs
```

### Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Secret | Yes | Clerk publishable key (starts with `pk_`) |
| `NEXT_PUBLIC_APP_URL` | Secret | Yes | Full URL of the deployed app |
| `CLERK_SECRET_KEY` | Secret | Yes | Clerk secret key (starts with `sk_`) |
| `MONGODB_URI` | Secret | Yes | MongoDB connection string |

**Note:** All secrets are set via `flyctl secrets set` and are automatically available in the container at runtime.
