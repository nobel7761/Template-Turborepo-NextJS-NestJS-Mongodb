# Environment Setup

এই repo clone করার পর চালানোর জন্য নিচের environment variable গুলো দিতে হবে।

## কোথায় রাখবে

Root folder-এ একটা `.env.local` file বানাও (এটা `.gitignore`-এ আছে, তাই commit হবে না):

```bash
cp ENV_SETUP.md /dev/null  # just reference, নিচের content টা .env.local এ paste করো
```

## Variables

```env
# MongoDB connection string (Atlas বা local — তোমার নিজের URI বসাও)
MONGODB_URI=

# Backend (NestJS) server port
PORT=3001

# Frontend (Next.js) যে URL দিয়ে backend API call করবে
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## বিবরণ

| Variable | কার জন্য | উদাহরণ / নোট |
|----------|----------|--------------|
| `MONGODB_URI` | Backend → database connection | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` বা `mongodb://localhost:27017/dbname` |
| `PORT` | Backend (NestJS) port | `3001` |
| `NEXT_PUBLIC_API_URL` | Frontend (Next.js) → backend call | local-এ `http://localhost:3001`, production-এ deployed backend URL |

> ⚠️ `NEXT_PUBLIC_` prefix যুক্ত variable browser-এ expose হয় — তাই এখানে কোনো secret রাখবে না।

## চালানোর ধাপ

```bash
pnpm install          # dependencies install
# root-এ .env.local বানিয়ে উপরের value গুলো বসাও
pnpm dev              # backend + frontend একসাথে চালু (turborepo)
```
