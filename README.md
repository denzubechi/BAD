# Base Analyst Daily (BAD)

A decentralized, premium financial newsletter and trading signal platform focused exclusively on the Base ecosystem.

## Features

- **Base Account Integration**: Sign in with Base Account using wagmi
- **Sub-Account Management**: Create and manage sub-accounts for automated payments
- **Spend Permissions**: Recurring subscriptions using Base Spend Permissions
- **Content Publishing**: Creators can publish premium articles and analysis
- **Subscription Management**: Subscribe to creators and manage your subscriptions
- **Creator Dashboard**: Analytics, subscriber management, and content tools

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Prisma ORM
- **State Management**: Zustand
- **Web3**: Base Account SDK, wagmi, viem
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- Base Account wallet

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install

# or

pnpm install
\`\`\`

3. Set up your environment variables:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your MongoDB connection string:

\`\`\`env
DATABASE_URL="mongodb://localhost:27017/base-analyst-daily"

# Or for MongoDB Atlas:

# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/base-analyst-daily"

\`\`\`

4. Generate Prisma Client and push the schema to MongoDB:

\`\`\`bash
npx prisma generate --schema ./prisma/schema.prisma
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

This project uses MongoDB with Prisma. To set up your database:

Make sure to set these in your deployment environment:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `CDP_API_KEY_ID`
- `CDP_API_KEY_SECRET`
- `CDP_WALLET_SECRET`

1. **Local MongoDB**: Install MongoDB locally or use Docker
2. **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. Update your `DATABASE_URL` in `.env`
4. Run `npx prisma generate --schema ./prisma/schema.prisma` to initialize the schema

## Project Structure

\`\`\`
├── app/ # Next.js app directory
│ ├── api/ # API routes
│ ├── creator/ # Creator dashboard pages
│ ├── subscriptions/ # Subscription management
│ └── ...
├── components/ # React components
├── lib/ # Utility functions and configurations
│ ├── base-account.ts # Base Account SDK setup
│ ├── spend-permissions.ts # Spend permission utilities
│ └── store/ # Zustand stores
├── prisma/ # Prisma schema
└── public/ # Static assets
\`\`\`

## Key Features

### Authentication

Users connect their Base Account wallet to sign in. The app automatically creates or fetches their user profile.

### Sub-Accounts

Users can create sub-accounts for automated subscription payments, enabling a seamless recurring payment experience.

### Spend Permissions

Creators can set up recurring subscriptions using Base Spend Permissions, allowing subscribers to authorize automatic payments.

### Content Publishing

Creators can write and publish articles with a rich editor, manage drafts, and set premium content flags.

### Subscription Management

Users can subscribe to creators, view their active subscriptions, and manage renewals through the dashboard.

## Learn More

- [Base Account Documentation](https://docs.base.org/base-account)
- [Spend Permissions Guide](https://docs.base.org/base-account/improve-ux/spend-permissions)
- [Sub-Accounts Guide](https://docs.base.org/base-account/improve-ux/sub-accounts)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma with MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)

## License

MIT
