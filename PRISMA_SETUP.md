# Prisma + Supabase Setup

This project uses Prisma ORM with Supabase (PostgreSQL) as the database.

## 📋 Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Bun installed (this project uses Bun as the package manager)

## 🚀 Getting Started

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update the `.env` file with your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database** → **Connection String**
3. Copy the **Connection Pooling** URL (for `DATABASE_URL`)
4. Copy the **Direct Connection** URL (for `DIRECT_URL`)

Your `.env` should look like:

```env
# Connection pooling URL (for serverless/edge functions)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 2. Define Your Schema

Edit `prisma/schema.prisma` to define your data models. An example `User` model is already included.

### 3. Create and Apply Migrations

```bash
# Create a new migration
bun prisma migrate dev --name init

# Apply migrations to production
bun prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
bun prisma generate
```

This generates the Prisma Client in `app/generated/prisma/`.

## 🔧 Available Commands

```bash
# Generate Prisma Client
bun prisma generate

# Create a new migration
bun prisma migrate dev --name <migration-name>

# Apply migrations to production
bun prisma migrate deploy

# Open Prisma Studio (database GUI)
bun prisma studio

# Pull schema from existing database
bun prisma db pull

# Push schema changes without migrations (dev only)
bun prisma db push

# Reset database (WARNING: deletes all data)
bun prisma migrate reset
```

## 💻 Using Prisma in Your Code

### In Server Routes/API

```typescript
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  })

  // Find all users
  const users = await prisma.user.findMany()

  // Find a specific user
  const user = await prisma.user.findUnique({
    where: { email: 'user@example.com' },
  })

  // Update a user
  const updatedUser = await prisma.user.update({
    where: { id: '123' },
    data: { name: 'Jane Doe' },
  })

  // Delete a user
  await prisma.user.delete({
    where: { id: '123' },
  })

  return { users }
})
```

## 📁 Project Structure

```
prisma/
  ├── schema.prisma       # Database schema definition
  └── migrations/         # Migration files (auto-generated)
prisma.config.ts          # Prisma configuration
server/
  └── utils/
      └── prisma.ts       # Prisma client singleton
app/
  └── generated/
      └── prisma/         # Generated Prisma Client (auto-generated)
```

## 🔒 Security Notes

- **Never commit `.env`** - It's already in `.gitignore`
- Use environment variables for all sensitive data
- The `DATABASE_URL` uses connection pooling (port 6543) for better performance with serverless
- The `DIRECT_URL` uses direct connection (port 5432) required for migrations

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)

## 🐛 Troubleshooting

### Migration Errors

If you encounter migration errors, ensure:
1. Your `DIRECT_URL` is correct (uses port 5432)
2. You have the correct database password
3. Your Supabase project is active

### Connection Issues

If you can't connect to the database:
1. Check your Supabase project is not paused
2. Verify your IP is allowed in Supabase settings
3. Ensure your connection strings are correct
