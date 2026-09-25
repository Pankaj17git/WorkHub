# Backend Database & Prisma Migration Guide

This guide provides step-by-step instructions and best practices for working with the backend database in **WorkHub**, using **Prisma ORM** with **MySQL**.

---

## 🚀 1. How to Add a New Field or Create a New Table

Whenever you need to alter the database structure (add/remove fields, modify types, create tables), follow this workflow:

### Step 1: Edit the Schema
Open `prisma/schema.prisma` and make your changes.

* **To Add a Field to an Existing Table:**
  ```prisma
  model User {
    id        BigInt   @id @default(autoincrement())
    email     String   @unique @db.VarChar(255)
    phone     String?  // <-- New optional field added
    // ...
  }
  ```

* **To Create a New Table (Model):**
  ```prisma
  model Project {
    id          BigInt   @id @default(autoincrement())
    name        String   @db.VarChar(255)
    description String?  @db.Text
    userId      BigInt   @map("user_id")
    createdAt   DateTime @default(now()) @map("created_at") @db.Timestamp(6)
    updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamp(6)

    // Relation
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@map("projects") // Maps model to "projects" SQL table
  }
  ```

### Step 2: Create and Apply Migration
Run the following command in the `client` directory:

```bash
npx prisma migrate dev --name <descriptive_migration_name>
```

*Example:*
```bash
npx prisma migrate dev --name add_phone_to_user
```

**What this command does:**
1. Generates a new SQL migration file inside `prisma/migrations/`.
2. Applies the migration to your local database.
3. Automatically updates/regenerates your Prisma Client code (`../generated/prisma`).

---

## 🔄 2. Automatic Migration on Server Startup (`npm run dev` / `npm start`)

When you run `npm run dev` or `npm start`, the migration runner script (`scripts/migrate.mjs`) executes automatically:
- **If migrations are up to date**: Prints `ℹ️ STATUS: Already applied. No pending migrations found.`
- **If new migrations exist**: Automatically applies them and prints `🚀 STATUS: New migrations detected and executed successfully!`
- **If migration fails**: Prints `❌ ERROR: Migration execution FAILED!` with the database error message and halts the server startup to protect data integrity.

You can also run migrations standalone anytime:
```bash
npm run migrate
```

---

## 🛠️ 3. Essential Prisma Command Cheat Sheet

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npx prisma migrate dev` | Applies schema changes & creates migration SQL files | During development when changing `schema.prisma` or sync after `git pull` |
| `npx prisma migrate deploy` | Applies pending migrations without creating new ones | Deployment / Production environments |
| `npx prisma generate` | Regenerates Prisma Client TypeScript code | After manual schema changes or package updates |
| `npx prisma studio` | Opens an interactive web browser UI for DB data | Viewing or editing database records visually |
| `npx prisma db seed` | Seeds database with initial/dummy data | Setting up mock data for testing |
| `npx prisma migrate reset` | Drops database, recreates it, runs all migrations | Resetting local dev database from scratch ⚠️ *(deletes data)* |

---

## 💡 4. Important Best Practices for Backend & Database Development

### 1. **Handling Mandatory vs Optional Fields Safely**
* If adding a **REQUIRED** (non-nullable) field to a table that already contains data, either:
  * Provide a default value: `status String @default("ACTIVE")`
  * Or make it optional first (`String?`), backfill existing rows, then make it required.

### 2. **Naming Conventions & Mapping**
* In TypeScript code, use `camelCase` (e.g., `emailVerifiedAt`).
* In SQL database tables/columns, use `snake_case` using `@map` and `@@map`:
  ```prisma
  password String @map("password_hash")
  @@map("users")
  ```

### 3. **Indexes & Performance**
* Always add indexes (`@@index([columnName])`) on fields used frequently in `WHERE`, `JOIN`, or foreign key relationships to prevent slow queries as your dataset grows.

### 4. **Handling `BigInt` Data Type**
* JavaScript's standard `JSON.stringify()` cannot serialize `BigInt` values natively.
* When returning BigInt fields (like `id`) in Next.js API routes, convert them to `String` or `Number` before responding, or configure a BigInt serializer helper.

### 5. **Environment Variables Security**
* Never commit DB credentials to Git. Ensure `.env` is listed in `.gitignore`.
* Keep `DATABASE_URL` configured properly in `.env`:
  ```env
  DATABASE_URL="mysql://root:password@127.0.0.1:3306/workhub"
  ```
