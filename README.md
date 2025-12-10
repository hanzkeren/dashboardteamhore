# Fullstack Next.js App

Template aplikasi fullstack dengan Next.js 15, Prisma, PostgreSQL, dan shadcn/ui.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env dengan database URL kamu
   ```

3. **Setup database**:
   ```bash
   npx prisma migrate dev
   # atau
   npx prisma db push
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Folder

```
├── app/             # Routes dan API
├── components/      # UI Components
├── features/        # Business logic (actions + schemas)
├── lib/            # Utils dan database config
└── prisma/         # Database schema dan migrations
```

## 🛠️ Available Scripts

- `npm run dev` - Development server
- `npm run build` - Build untuk production
- `npm run start` - Production server
- `npm run db:push` - Push schema ke database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Buka Prisma Studio
- `npm run db:seed` - Seed awal data

## 🐳 Build & Run dengan Docker

```bash
# Build image production
docker build -t fullstack-app .

# Jalankan container dengan environment
docker run -p 3000:3000 --env-file .env fullstack-app
```

Pastikan variabel environment (misal `DATABASE_URL`) tersedia di `.env` sebelum menjalankan container.

## 📚 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post

## 🎨 Used Technologies

- **Next.js 15** - React framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
