# MongoDB Atlas Setup

## Objective
Configure MongoDB connection and basic schemas

## Tasks
- [ ] Create MongoDB Atlas account
- [ ] Set up cluster
- [ ] Configure network access (whitelist IPs)
- [ ] Create database user
- [ ] Install Mongoose
- [ ] Create database connection utility
- [ ] Set up connection pooling
- [ ] Create base schemas
- [ ] Test connection

## Dependencies
```bash
pnpm add mongoose mongodb
pnpm add -D @types/mongoose
```

## Environment Variables
```env
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/dnd-tracker?retryWrites=true&w=majority
```

## Connection Utility (lib/mongodb.ts)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}