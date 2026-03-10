# Contributing to Sheep Tycoon

Thank you for your interest in contributing to Sheep Tycoon! This guide will help you get set up and submit changes.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL
- Git

### Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and set your `DATABASE_URL`
4. Start PostgreSQL and run: `npm run db:push`
5. Run the dev server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

See the [README](README.md) for more details on environment and database setup.

## Development Workflow

1. Create a branch from `main` for your changes
2. Make your edits
3. Run the quality checks before committing (or let Husky run them). The code should pass linting, formatting, and unit tests.
4. Push your branch and open a pull request

### Available Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start development server                |
| `npm run build`        | Build for production                    |
| `npm run lint`         | Run ESLint                              |
| `npm run format`       | Format code with Prettier               |
| `npm run format:check` | Check formatting without changing files |
| `npm run test`         | Run unit tests (watch mode)             |
| `npm run test:run`     | Run unit tests once                     |
| `npm run test:e2e`     | Run Playwright end-to-end tests         |
| `npm run db:push`      | Push Prisma schema to database          |
| `npm run db:migrate`   | Create and run migrations               |

See [package.json](package.json) for more details.

## Code Standards

All contributions must pass:

- **Linting** – ESLint (Next.js config)
- **Formatting** – Prettier
- **Tests** – Unit tests must pass

Run these checks locally:

```bash
npm run lint
npm run format:check
npm run test:run
```

Fix formatting with:

```bash
npm run format
```

### Pre-commit Hooks

Husky runs `lint`, `format:check`, and `test:run` on every commit. Your commit will be blocked if any of these fail. Fix the issues and try again.

## Testing

- **Unit tests**: Vitest in `src/**/*.test.ts` and `tests/`
- **E2E tests**: Playwright in `tests/e2e/`

Add or update tests when changing behavior. Run the full suite before submitting:

```bash
npm run test:run
npm run test:e2e
```

## Pull Request Process

1. **Target branch**: Open PRs against `main`
2. **Title and description**: Use a clear title and describe what changed and why
3. **CI**: The PR Check workflow will run on every PR. It will:
   - Install dependencies
   - Generate Prisma client
   - Run lint
   - Run format check
   - Run unit tests

All checks must pass before merge. Review and address any feedback from maintainers.

## Database Changes

If you change `prisma/schema.prisma`:

- For local development: run `npm run db:push`
- For tracked migrations: use `npm run db:migrate` and commit the migration files

## License

By contributing, you agree that your contributions may be used under the terms of this project’s [LICENSE](LICENSE).
