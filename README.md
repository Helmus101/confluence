# Confluence - Warm Introductions Platform

A professional networking platform that helps early-career talent find warm introduction opportunities to their target companies. Upload your LinkedIn network, leverage AI to enrich contact data, search intelligently, and request introductions through trusted connectors.

## Features

- **User Authentication** - Email/password signup and login with LinkedIn profile URL requirement
- **Contact Management** - Upload CSV files from LinkedIn or add contacts manually
- **AI-Powered Enrichment** - Deepseek AI extracts 18+ detailed fields from raw contact data
- **Smart Search** - Natural language search across entire network (direct and indirect matches)
- **Introduction Workflow** - Request intros, track responses, accept/decline, mark complete
- **Notifications** - Real-time notifications for intro requests, acceptances, and actions
- **Trust Scoring** - Track connector success rates and response times
- **Rate Limiting** - Require 5 contacts before making indirect intro requests
- **Network Visualization** - View contact distribution by company, industry, and seniority
- **Project Download** - Export entire codebase as ZIP for local development

## Tech Stack

- **Frontend**: React 18 + TypeScript with Wouter routing
- **UI**: Shadcn UI components + Tailwind CSS + Framer Motion
- **State**: React Query (TanStack Query v5)
- **Backend**: Express.js with PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **AI/LLM**: Deepseek API
- **Styling**: Inter (body) + Space Grotesk (headings)

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (local or cloud)
- Deepseek API key (get one at https://platform.deepseek.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd confluence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DEEPSEEK_API_KEY`: Your Deepseek API key
   - `SESSION_SECRET`: Any random string for sessions
   - PostgreSQL details (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)

4. **Set up the database**
   ```bash
   npm run db:push
   ```
   
   This creates all necessary tables automatically using Drizzle ORM.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server (Express + Vite HMR)
- `npm run build` - Build for production
- `npm run db:push` - Sync database schema with your PostgreSQL database
- `npm run db:push -- --force` - Force sync (use if schema conflicts occur)

## Project Structure

```
confluence/
├── client/
│   └── src/
│       ├── pages/           # Page components
│       ├── components/      # Reusable UI components
│       ├── lib/             # Auth context, API client
│       ├── hooks/           # Custom React hooks
│       └── App.tsx          # Main app with routing
├── server/
│   ├── lib/                 # OpenAI/Deepseek integration
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database layer
│   ├── index.ts             # Express setup
│   └── vite.ts              # Vite integration
├── shared/
│   └── schema.ts            # Database schema + types
├── .env.example             # Environment variables template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.ts       # Tailwind CSS configuration
```

## Database Schema

### Users
- `id`, `email`, `password`, `name`, `linkedinUrl`, `university`, `createdAt`

### Contacts
- Core fields: `id`, `userId`, `name`, `email`, `phone`, `linkedinUrl`, `company`, `title`, `industry`, `seniority`, `location`
- Detailed enrichment: `companySize`, `fundingStage`, `yearsExperience`, `skills`, `education`, `university`, `degree`, `major`, `graduationYear`
- Metadata: `linkedinSummary`, `enriched`, `confidence`, `createdAt`

### Intro Requests
- `id`, `requesterId`, `connectorUserId`, `contactId`, `targetCompany`, `reason`, `status` (pending/accepted/declined/completed), `messages`, `createdAt`, `updatedAt`

### Notifications
- `id`, `userId`, `type`, `title`, `message`, `read`, `relatedId`, `createdAt`

### Chat Messages
- `id`, `introRequestId`, `senderId`, `content`, `createdAt`

### Additional Tables
- `connectorStats` - Success rate and response metrics
- `rateLimits` - Weekly indirect intro request limits

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Contacts
- `POST /api/contacts/upload` - Upload CSV file
- `POST /api/contacts/add` - Add single contact
- `POST /api/contacts/enrich` - Trigger AI enrichment
- `GET /api/contacts` - Get user's contacts

### Search
- `GET /api/search?q=query` - Natural language search

### Introductions
- `POST /api/intro/request` - Request intro through connector
- `POST /api/intro/respond` - Accept/decline request
- `POST /api/intro/complete` - Mark as completed
- `GET /api/intro/sent` - Get sent requests
- `GET /api/intro/received` - Get received requests

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Download
- `GET /api/download-project` - Download project as ZIP

### Admin
- `GET /api/admin/stats` - Platform statistics

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=confluence

# AI/LLM
DEEPSEEK_API_KEY=your_deepseek_api_key

# Session
SESSION_SECRET=your_session_secret

# App
NODE_ENV=development
```

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Run `npm run db:push` to sync schema

### AI enrichment not working
- Verify DEEPSEEK_API_KEY is set
- Check Deepseek API quota and status
- Review error logs in console

### Port already in use
- Change port in server/index.ts or use: `PORT=3000 npm run dev`

## Development Notes

- **Frontend-heavy architecture**: Most logic is in the React frontend; backend handles data persistence and API calls
- **Hot Module Reloading**: Changes to React components reflect instantly
- **Type safety**: Full TypeScript across frontend and backend
- **Database migrations**: Handled automatically via Drizzle ORM with `npm run db:push`
- **No manual SQL**: Schema changes go through Drizzle, never write raw SQL migrations

## Deployment

The app is pre-configured for Replit but can be deployed anywhere that supports Node.js:

1. Build: `npm run build`
2. Start: `npm start` or `npm run dev`
3. Ensure `DATABASE_URL` and `DEEPSEEK_API_KEY` are set in production

## License

Proprietary - Confluence Platform
