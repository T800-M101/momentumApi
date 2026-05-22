# Momentum API 🚀

> Enterprise-grade Digital Journal backend — built for performance, testability, and clean architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS v11.0.21  |
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
auth.decorators.ts
journal.decorators.ts
mood.decorators.ts

Result: controllers only steer routes — nothing else.

---

### 2. Repository Pattern

Services never touch Prisma directly. Every domain maps through its own repository:
AuthRepository       → user lookups, token persistence
JournalRepository    → entries, tag connectOrCreate logic
MoodRepository       → emotional state configuration

This keeps business logic clean and database queries encapsulated — complex Prisma operations like tag array mapping stay invisible to the service layer.

---

### 3. Fully Mocked Unit Tests

Because services depend on repositories and not Prisma directly, Jest suites run in complete isolation — no active PostgreSQL instance required.

```ts
const mockJournalRepository = {
  findAll: jest.fn(),
  create:  jest.fn(),
  // ...
};
```

Every critical edge case is audited: `NotFoundException` on missing records, relational array mappings on creation payloads, and token refresh flows.

---

## Getting Started

### Prerequisites

- Node.js  `v20+`
- PostgreSQL running locally or via Docker
- `npm` or `yarn`

### Installation

```bash
git clone https://github.com/T800-M101/momentumApi.git
cd momentum-api
npm install
```

### Environment Configuration


Create a `.env` file at the project root:

```env
PORT=3000

# PostgreSQL Connection String
# Replace 'postgres' and 'mypassword' with your local database credentials
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/journal_db?schema=public"

# JWT Security Keys
# Clear text strings used to sign authentication tokens. 
# You can generate strong keys running this in your terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET="your_generated_access_token_secret"
JWT_REFRESH_SECRET="your_generated_refresh_token_secret"
```

### Database Setup

```bash
npx prisma migrate dev --name init
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

---

## API Documentation

Interactive Swagger UI is available at:
http://localhost:3000/api/docs

> The docs portal lives outside the core API prefix to avoid route collisions.

**Features:**
- `@ApiBearerAuth()` support — click **Authorize** to inject your JWT
- Real-world JSON payload examples on every request and response schema
- Full endpoint coverage across `auth`, `journal`, and `mood` modules

---

## Testing

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

> Absolute imports (`src/*`) resolve natively inside Jest via `moduleNameMapper` — no path alias issues.

---

## Project Structure
src/
├── common/              # Global guards, interceptors, and decorators
├── prisma/              # PrismaService wrapper
├── modules/
│   ├── auth/            # Authentication, JWT strategy, refresh tokens
│   ├── journal/         # Entries, tag mechanics, search and filters
│   └── mood/            # Emotional state configuration
└── main.ts              # Bootstrap, CORS, Swagger initialization

---

## License

MIT