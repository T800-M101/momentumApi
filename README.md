# Momentum API 🚀

> Enterprise-grade Digital Journal backend — built for performance, testability, and clean architecture.

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | NestJS v11.0.21 |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT — Access & Refresh tokens via HttpOnly Cookies |
| Validation | class-validator + class-transformer |
| Documentation | OpenAPI / Swagger |
| Testing | Jest + ts-jest |

---

## Architecture

### 1. Clean Controllers via Decorator Composition

Controllers stay lean and readable. All Swagger annotations (`@ApiOperation`, `@ApiResponse`, `@ApiBody`) and pipe configurations are extracted into dedicated decorator modules using NestJS `applyDecorators`.

```txt
auth.decorators.ts
journal.decorators.ts
mood.decorators.ts
```

**Result:** controllers only steer routes — nothing else.

---

### 2. Repository Pattern

Services never touch Prisma directly. Every domain maps through its own repository:

```txt
AuthRepository       → user lookups, token persistence
JournalRepository    → entries, tag connectOrCreate logic
MoodRepository       → emotional state configuration
```

This keeps business logic clean and database queries encapsulated — complex Prisma operations like tag array mapping stay invisible to the service layer.

---

### 3. Fully Mocked Unit Tests

Because services depend on repositories and not Prisma directly, Jest suites run in complete isolation — no active PostgreSQL instance required.

```ts
const mockJournalRepository = {
  findAll: jest.fn(),
  create: jest.fn(),
};
```

Every critical edge case is audited: `NotFoundException` on missing records, relational array mappings on creation payloads, and token refresh flows.

---

# Getting Started

## Prerequisites

Before starting, make sure you have installed:

- Node.js `v20+`
- Docker Desktop (recommended for PostgreSQL)
- `npm` or `yarn`

You can verify versions with:

```bash
node -v
docker -v
npm -v
```

---

## Database Setup

You can run PostgreSQL either via **Docker (recommended)** or a local installation.

### Option 1 — PostgreSQL via Docker (Recommended)

Run this command to create a PostgreSQL container:

```bash
docker run --name momentum-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=journal_db \
  -p 5432:5432 \
  -d postgres:16
```

Verify the container is running:

```bash
docker ps
```

To stop the database:

```bash
docker stop momentum-postgres
```

To start it again:

```bash
docker start momentum-postgres
```

To remove it completely:

```bash
docker rm -f momentum-postgres
```

---

### Option 2 — Local PostgreSQL

Create a database manually:

```sql
CREATE DATABASE journal_db;
```

Make sure PostgreSQL is running locally on:

```txt
localhost:5432
```

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/T800-M101/momentumApi.git

cd momentumApi

npm install
```

---

## Environment Configuration

Create a `.env` file at the project root:

```env
PORT=3000

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/journal_db?schema=public"

# JWT Security Keys
# Generate secure values using:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_ACCESS_SECRET="your_generated_access_token_secret"

JWT_REFRESH_SECRET="your_generated_refresh_token_secret"
```

---

## Database Migration & Seeding

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database with starter data:

```bash
npx prisma db seed
```

This will populate:

- Mood categories
- Sample journal entries
- Seed users for testing

---

## Running the App

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

The API will run at:

```txt
http://localhost:3000
```

---

## API Documentation

Interactive Swagger UI is available at:

```txt
http://localhost:3000/api/docs
```

> The docs portal lives outside the core API prefix to avoid route collisions.

### Features

- `@ApiBearerAuth()` support — click **Authorize** to inject your JWT
- Real-world JSON payload examples on every request and response schema
- Full endpoint coverage across `auth`, `journal`, and `mood` modules

---

## Testing

Run all tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:cov
```

> Absolute imports (`src/*`) resolve natively inside Jest via `moduleNameMapper` — no path alias issues.

---

## Project Structure

```txt
src/
├── common/              # Global guards, interceptors, and decorators
├── prisma/              # PrismaService wrapper
├── modules/
│   ├── auth/            # Authentication, JWT strategy, refresh tokens
│   ├── journal/         # Entries, tag mechanics, search and filters
│   └── mood/            # Emotional state configuration
└── main.ts              # Bootstrap, CORS, Swagger initialization
```

---

## License

MIT