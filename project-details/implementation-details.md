# Implementation Details

This document provides a comprehensive overview of the global error handler and Husky + lint-staged implementations added to the Turborepo Next Nest monorepo.

## Table of Contents

1. [Global Error Handler](#global-error-handler)
   - [Backend (NestJS)](#backend-nestjs)
   - [Frontend (Next.js)](#frontend-nextjs)
2. [Husky + lint-staged Setup](#husky--lint-staged-setup)
   - [Configuration](#configuration)
   - [How It Works](#how-it-works)
3. [Installation Instructions](#installation-instructions)
4. [Usage Examples](#usage-examples)

---

## Global Error Handler

### Backend (NestJS)

#### Overview

A comprehensive global exception filter has been implemented to handle all errors in the NestJS backend application. This follows industry best practices for error handling in NestJS applications.

#### Implementation Details

**Location:** `apps/backend/src/common/filters/http-exception.filter.ts`

**Key Features:**

1. **Centralized Error Handling**: All exceptions are caught and processed in a single location
2. **Multiple Error Type Support**:
   - NestJS `HttpException` (standard HTTP errors)
   - MongoDB errors (duplicate keys, connection issues)
   - TypeORM `QueryFailedError` (if using TypeORM)
   - Validation errors (class-validator)
   - Unknown/unexpected errors

3. **Structured Error Response**: Consistent error response format:

   ```typescript
   {
     statusCode: number;
     timestamp: string;
     path: string;
     method: string;
     message: string | string[];
     error?: string;
     stack?: string; // Only in development
   }
   ```

4. **Environment-Aware**: Stack traces are only included in development mode
5. **Comprehensive Logging**: All errors are logged with context (method, URL, status, message)

#### Integration

The global exception filter is registered in `apps/backend/src/main.ts`:

```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

Additionally, a global validation pipe has been added to automatically validate DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

#### DTO Validation

Validation decorators have been added to DTOs using `class-validator`:

- **CreateUserDto** (`apps/backend/src/users/dto/create-user.dto.ts`):
  - `name`: Required string
  - `email`: Required valid email
  - `phone`: Optional string
  - `address`: Optional string

- **UpdateUserDto** (`apps/backend/src/users/dto/update-user.dto.ts`):
  - All fields are optional
  - Email validation when provided
  - Boolean validation for `isActive`

#### Error Response Examples

**Validation Error (400):**

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": ["email must be an email", "name should not be empty"],
  "error": "Bad Request"
}
```

**Not Found Error (404):**

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/123",
  "method": "GET",
  "message": "User with ID 123 not found",
  "error": "Not Found"
}
```

**MongoDB Duplicate Key Error (400):**

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "email already exists",
  "error": "Duplicate Entry"
}
```

**Internal Server Error (500):**

```json
{
  "statusCode": 500,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

### Frontend (Next.js)

#### Overview

Global error handling has been implemented for the Next.js frontend using Next.js 13+ App Router error boundaries and enhanced API client error handling.

#### Implementation Details

**1. Error Boundary (`apps/frontend/src/app/error.tsx`)**

This component handles errors that occur in the application's component tree. It provides:

- User-friendly error messages
- "Try again" functionality to reset the error boundary
- "Go home" button to navigate to the home page
- Stack trace display in development mode only
- Professional UI with Tailwind CSS styling

**2. Global Error Boundary (`apps/frontend/src/app/global-error.tsx`)**

This component handles errors that occur in the root layout or other critical parts of the application. It:

- Catches errors that escape the regular error boundary
- Provides a fallback UI when the entire app fails
- Includes the same features as the regular error boundary
- Wraps the entire HTML structure (including `<html>` and `<body>` tags)

**3. Enhanced API Client (`apps/frontend/src/lib/api/client.ts`)**

The Axios client has been enhanced with comprehensive error handling:

**Request Interceptor:**

- Automatically adds authentication tokens from localStorage
- Handles token retrieval safely (checks for `window` object)

**Response Interceptor:**

- Handles different error scenarios:
  - **Server errors (4xx, 5xx)**: Logs error details and handles specific status codes
  - **Network errors**: Provides helpful messages when backend is unreachable
  - **401 Unauthorized**: Automatically clears tokens and redirects to login
  - **403 Forbidden**: Logs access denied messages
  - **404 Not Found**: Logs resource not found messages
  - **500 Internal Server Error**: Provides user-friendly messages

**Error Handling by Status Code:**

- `401`: Clears authentication tokens and redirects to login page
- `403`: Logs forbidden access message
- `404`: Logs resource not found message
- `500`: Provides user-friendly error message
- Network errors: Provides connection troubleshooting information

#### Error Display Examples

**User-Facing Error UI:**

- Clean, centered error page with icon
- Clear error message
- Action buttons (Try again, Go home)
- Development-only stack trace in collapsible details section

**Console Logging:**

- Development: Full error details with stack traces
- Production: Minimal logging (can be extended to send to error reporting service)

---

## Husky + lint-staged Setup

### Overview

Husky and lint-staged have been configured to automatically run linting and formatting checks on staged files before commits. This ensures code quality and consistency across the codebase.

### Configuration

#### 1. Package Dependencies

**Root `package.json`:**

- Added `husky` (^9.0.11) as dev dependency
- Added `lint-staged` (^15.2.0) as dev dependency
- Added `prepare` script to automatically install Husky hooks

#### 2. Husky Configuration

**Location:** `.husky/pre-commit`

**Content:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

This hook runs `lint-staged` before every commit, which will:

- Run ESLint with auto-fix on staged TypeScript/JavaScript files
- Run Prettier to format staged files
- Only process files that are staged for commit

#### 3. lint-staged Configuration

**Location:** `.lintstagedrc.json` (also configured in root `package.json`)

**Configuration:**

```json
{
  "apps/backend/**/*.{ts,js}": ["eslint --fix", "prettier --write"],
  "apps/frontend/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

**What It Does:**

- **Backend files** (`apps/backend/**/*.{ts,js}`):
  - Runs ESLint with auto-fix
  - Formats with Prettier
- **Frontend files** (`apps/frontend/**/*.{ts,tsx,js,jsx}`):
  - Runs ESLint with auto-fix
  - Formats with Prettier
- **Configuration files** (`*.{json,md,yml,yaml}`):
  - Formats with Prettier

### How It Works

1. **Developer stages files** for commit (`git add`)
2. **Developer runs** `git commit`
3. **Husky intercepts** the commit and runs the pre-commit hook
4. **lint-staged runs** on only the staged files:
   - ESLint fixes auto-fixable issues
   - Prettier formats the files
   - Modified files are automatically staged again
5. **If all checks pass**, the commit proceeds
6. **If checks fail**, the commit is blocked and errors are displayed

### Benefits

1. **Code Quality**: Ensures all committed code follows linting rules
2. **Consistency**: Automatically formats code to match project style
3. **Efficiency**: Only processes staged files (faster than running on entire codebase)
4. **Automatic**: No manual intervention needed - runs on every commit
5. **Team Consistency**: All team members follow the same code standards

---

## Installation Instructions

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0
- Git (for Husky hooks)

### Step 1: Install Dependencies

From the root directory:

```bash
pnpm install
```

This will install:

- `husky` and `lint-staged` in the root workspace
- `class-validator` and `class-transformer` in the backend app

### Step 2: Initialize Husky

Husky will be automatically initialized when you run `pnpm install` (via the `prepare` script). If you need to manually initialize:

```bash
pnpm prepare
```

This creates the `.husky` directory and sets up Git hooks.

### Step 3: Verify Setup

1. **Check Husky installation:**

   ```bash
   ls -la .husky/
   ```

   You should see the `pre-commit` file.

2. **Test lint-staged:**

   ```bash
   pnpm lint-staged
   ```

3. **Test the pre-commit hook:**
   - Make a small change to a file
   - Stage it: `git add <file>`
   - Try to commit: `git commit -m "test"`
   - The hook should run automatically

### Step 4: Verify Error Handlers

**Backend:**

1. Start the backend: `pnpm --filter backend dev`
2. Make an invalid API request (e.g., POST to `/api/users` with invalid email)
3. Check the error response format

**Frontend:**

1. Start the frontend: `pnpm --filter frontend dev`
2. Navigate to a page that might error
3. Check that error boundaries are working

---

## Usage Examples

### Error Handler Usage

#### Backend - Throwing Errors

**In a Service:**

```typescript
import { NotFoundException, BadRequestException } from "@nestjs/common";

// Not found error
throw new NotFoundException(`User with ID ${id} not found`);

// Bad request error
throw new BadRequestException("Invalid input data");
```

**Validation Errors (Automatic):**

```typescript
// DTO with validation decorators
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// If invalid email is sent, validation pipe automatically returns 400
```

#### Frontend - Error Handling

**Using Error Boundaries:**

- Errors in components are automatically caught by `error.tsx`
- Users see a friendly error page
- Can click "Try again" to reset the error boundary

**Using API Client:**

```typescript
import client from "@/lib/api/client";

try {
  const response = await client.get("/api/users");
  // Handle success
} catch (error) {
  // Error is already logged and formatted by interceptor
  // Handle error in your component
  if (error.response?.status === 401) {
    // Already handled by interceptor (redirects to login)
  }
}
```

### Husky + lint-staged Usage

**Normal Workflow:**

```bash
# 1. Make changes to files
# 2. Stage files
git add apps/backend/src/users/users.service.ts

# 3. Commit (Husky runs automatically)
git commit -m "Update user service"

# Output:
# ✔ Preparing lint-staged...
# ✔ Running tasks for staged files...
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
# [main abc1234] Update user service
```

**If Linting Fails:**

```bash
git commit -m "Update code"

# Output:
# ✖ lint-staged failed
# Error: ESLint found errors
#
# Commit blocked. Fix errors and try again.
```

**Bypassing Hooks (Not Recommended):**

```bash
# Only use in emergencies
git commit --no-verify -m "Emergency commit"
```

---

## File Structure

```
turborepo-next-nest/
├── .husky/
│   └── pre-commit              # Husky pre-commit hook
├── .lintstagedrc.json          # lint-staged configuration
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── common/
│   │       │   └── filters/
│   │       │       └── http-exception.filter.ts  # Global error filter
│   │       ├── main.ts                           # Error filter registration
│   │       └── users/
│   │           └── dto/
│   │               ├── create-user.dto.ts         # With validation
│   │               └── update-user.dto.ts         # With validation
│   └── frontend/
│       └── src/
│           ├── app/
│           │   ├── error.tsx                     # Error boundary
│           │   └── global-error.tsx              # Global error boundary
│           └── lib/
│               └── api/
│                   └── client.ts                 # Enhanced error handling
└── package.json                                 # Husky + lint-staged config
```

---

## Best Practices

### Error Handling

1. **Backend:**
   - Use appropriate NestJS exception types (`NotFoundException`, `BadRequestException`, etc.)
   - Add validation decorators to all DTOs
   - Let the global filter handle error formatting
   - Log errors appropriately (already handled)

2. **Frontend:**
   - Use error boundaries for component errors
   - Handle API errors in try-catch blocks
   - Provide user-friendly error messages
   - Log errors for debugging (development) or reporting (production)

### Husky + lint-staged

1. **Don't bypass hooks** unless absolutely necessary
2. **Fix linting errors** before committing
3. **Let Prettier format** your code automatically
4. **Review auto-fixes** before committing (lint-staged stages them automatically)
5. **Keep hooks fast** - only process staged files (already configured)

---

## Troubleshooting

### Husky Not Running

1. Check if `.husky` directory exists
2. Verify `prepare` script in `package.json`
3. Run `pnpm prepare` manually
4. Check Git hooks: `ls -la .git/hooks/`

### lint-staged Not Working

1. Verify `.lintstagedrc.json` exists
2. Check `package.json` for lint-staged config
3. Run manually: `pnpm lint-staged`
4. Check for syntax errors in configuration

### Error Handler Not Catching Errors

**Backend:**

1. Verify filter is registered in `main.ts`
2. Check that errors are thrown (not returned)
3. Verify DTOs have validation decorators

**Frontend:**

1. Ensure `error.tsx` is in the `app` directory
2. Check that errors are thrown in components (not just logged)
3. Verify API client interceptors are set up

---

## Additional Notes

- **Error Logging**: In production, consider integrating with error reporting services (Sentry, LogRocket, etc.)
- **Custom Error Types**: You can extend the error filter to handle custom error types
- **Performance**: lint-staged only processes staged files for optimal performance
- **CI/CD**: Consider running full linting in CI/CD pipelines in addition to pre-commit hooks

---

## Summary

This implementation provides:

✅ **Comprehensive error handling** for both backend and frontend  
✅ **Automatic code quality checks** before commits  
✅ **Consistent code formatting** across the codebase  
✅ **Industry-standard practices** for error handling and code quality  
✅ **Developer-friendly** error messages and UI  
✅ **Production-ready** error handling with environment-aware logging

All implementations follow industry best practices and are ready for production use.
