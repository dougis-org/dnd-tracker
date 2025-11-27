# MongoDB Migrations Guide

This document explains the MongoDB migration system used to set up collections and indexes for the dnd-tracker application.

## Overview

The migration system ensures that:
1. **Collections are created** with the correct schema
2. **Indexes are created** for optimal query performance
3. **Migrations are idempotent** - can be run safely multiple times
4. **Migration state is tracked** to prevent duplicate runs

## How Migrations Work

### Automatic Migration (Production Recommended)

When the application starts in production:

1. **Next.js Instrumentation Hook** (`src/instrumentation.ts`) runs automatically
2. Connects to MongoDB
3. Runs all pending migrations
4. Logs success/failure for monitoring

**Advantages:**
- Runs on every deployment automatically
- No manual steps required
- Safe to run multiple times
- Works in serverless and containerized environments

### Pre-Deployment Migration (Fly.io)

Before deploying to Fly.io:

1. **Build Phase**: `npm run build` - compiles Next.js
2. **Release Command**: `npm run migrate` - runs migrations
3. **Start Phase**: `npm start` - starts the application

The release command is configured in `fly.toml`:

```toml
[deploy]
release_command = 'npm run migrate'
```

**Advantages:**
- Runs before the new application version is live
- Safer than running during request handling
- Clear log output for debugging deployment issues

### Manual Migration (Development/Testing)

Run migrations manually with:

```bash
npm run migrate
```

## Migration State Tracking

Migrations are tracked in a `_migrations` collection:

```javascript
{
  "_id": ObjectId(...),
  "name": "create-user-and-event-collections",
  "version": 1,
  "description": "Create User and UserEvent collections with indexes",
  "runAt": 2025-11-27T18:00:00.000Z
}
```

**Benefits:**
- Each migration runs only once
- Can be run multiple times safely (idempotent)
- Clear audit trail of which migrations have been applied
- Supports future schema evolution

## Collections and Indexes

### Users Collection

**Indexes Created:**
- `userId` (unique) - Fast lookup by auth provider ID
- `email` (unique) - Fast lookup and prevents duplicates
- `(deletedAt, updatedAt)` (compound) - Efficient soft-delete queries

### UserEvents Collection

**Indexes Created:**
- `(eventType, receivedAt)` (compound) - Filter by event type + sort by recency
- `(status, receivedAt)` (compound) - Find failed/pending events
- `(userId, receivedAt)` (compound) - User audit trails

## Monitoring and Health Checks

### Health Check Endpoint

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T18:00:00.000Z",
  "duration_ms": 150,
  "mongodb": {
    "connected": true,
    "database": "dnd-tracker",
    "collections": {
      "users": {
        "exists": true,
        "indexCount": 4,
        "hasUniqueUserId": true,
        "hasUniqueEmail": true,
        "hasCompoundIndex": true
      },
      "user_events": {
        "exists": true,
        "indexCount": 4,
        "hasEventTypeIndex": true,
        "hasStatusIndex": true,
        "hasUserIdIndex": true
      }
    }
  }
}
```

This endpoint is useful for:
- Monitoring services (verify DB is ready)
- Pre-flight checks (ensure indexes are created)
- Debugging deployment issues

## Adding New Migrations

To add a new migration:

1. Edit `src/lib/db/migrations/index.ts`
2. Add a new entry to the `migrations` array:

```typescript
{
  name: 'your-migration-name',
  version: 2,
  description: 'What this migration does',
  up: async (db: mongoose.Connection) => {
    // Your migration code here
    logStructured('info', 'Migration step completed');
  },
}
```

3. Test locally: `npm run migrate`
4. Commit and deploy - the migration will run automatically

**Important:** 
- Keep migration names unique
- Increment version numbers
- Make migrations idempotent (safe to run multiple times)
- Use `logStructured` for logging
- Only the `up` function is supported (no rollbacks yet)

## Troubleshooting

### Collections Not Created

1. Check `MONGODB_URI` is set correctly:
   ```bash
   echo $MONGODB_URI
   ```

2. Verify MongoDB is running and accessible

3. Run health check:
   ```bash
   curl http://localhost:3000/api/health
   ```

4. Check logs for errors:
   ```bash
   npm run migrate
   ```

### Indexes Not Created

1. Check migrations ran successfully:
   ```bash
   # Connect to MongoDB
   mongosh $MONGODB_URI
   use dnd-tracker
   db._migrations.find().pretty()
   ```

2. Verify indexes were created:
   ```bash
   db.users.getIndexes()
   db.user_events.getIndexes()
   ```

3. If missing, check migration logs for errors

### Migration Taking Too Long

1. Check MongoDB connection status
2. Verify network latency to MongoDB
3. Check if other operations are blocking

### Can't Connect to MongoDB

1. Verify `MONGODB_URI` format: `mongodb+srv://username:password@host/database`
2. Check network/firewall rules allow MongoDB connection
3. Verify credentials are correct

## Configuration

### Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Optional
MONGODB_DB_NAME=dnd-tracker        # Default: 'dnd-tracker'
NODE_ENV=production                 # Default: 'development'
```

### Fly.io Deployment

Set secrets before deploying:

```bash
flyctl secrets set MONGODB_URI=your-mongodb-uri
```

Then deploy:

```bash
npm run deploy  # or: flyctl deploy
```

The release command will run migrations automatically.

## Testing Migrations

Run the migration test suite:

```bash
npm run test:ci:integration -- tests/integration/migrations.test.ts
```

Tests verify:
- Collections are created
- Indexes are created correctly
- Migrations are idempotent
- Data persists after migration
- Unique constraints work

## References

- [Mongoose Indexing Guide](https://mongoosejs.com/docs/guide.html#indexes)
- [MongoDB Index Types](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/)
- [Fly.io Release Commands](https://fly.io/docs/app-guides/run-a-command-in-a-deployed-app/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
