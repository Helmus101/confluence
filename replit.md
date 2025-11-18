# Confluence - Warm Introductions Platform

## Overview
Confluence is a professional networking platform that helps early-career talent (students, recent graduates) find warm introduction opportunities to their target companies. Users can upload their network, search for connections at specific companies, and request introductions through trusted intermediaries (connectors).

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript with Wouter routing
- **UI**: Shadcn UI components + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Backend**: Express.js with in-memory storage
- **AI/LLM**: OpenAI GPT-5 for contact enrichment and message generation
- **Fonts**: Inter (body) + Space Grotesk (headings)

### Key Features (MVP)
1. **User Authentication** - Email/password signup and login
2. **Contact Management** - Upload CSV files or add contacts manually
3. **AI-Powered Enrichment** - Extract company, title, industry, seniority from raw contact data
4. **Smart Search** - Find direct and indirect intro opportunities by company/industry/role
5. **Introduction Workflow** - Request intros, connectors accept/decline, track completion
6. **Rate Limiting** - Require 5 contacts before requesting >3 indirect intros/week
7. **Trust Scoring** - Track connector success rate and response rate
8. **Privacy-First** - Contact details only revealed after connector acceptance

## Data Models

### Users
- id, email, password, name, university, createdAt

### Contacts
- id, userId, rawText, name, company, title, industry, seniority, location, linkedinUrl, enriched, confidence, createdAt

### Intro Requests
- id, requesterId, connectorUserId, contactId, targetCompany, targetCompanyNormalized, reason, status (pending/accepted/declined/completed), messages, createdAt, updatedAt

### Connector Stats
- id, userId, successCount, totalRequests, responseRate

### Rate Limits
- id, userId, weekStart, indirectRequestsCount

## Current Implementation Status

### Phase 1: Schema & Frontend ✅
- ✅ Complete data schema with all models
- ✅ Design system configured (Inter + Space Grotesk fonts)
- ✅ Hero image generated for landing page
- ✅ All page components built:
  - Landing page with hero section and feature cards
  - Signup/Login pages with form validation
  - Onboarding flow (CSV upload + manual entry)
  - Dashboard with search and results display
  - Request intro page with detailed form
  - Intros management (sent/received tabs)
  - Admin dashboard with metrics
- ✅ Auth context for user state management
- ✅ Theme provider for light/dark mode support
- ✅ Responsive design following design guidelines

### Phase 2: Backend (IN PROGRESS)
- Backend implementation with storage layer
- OpenAI integration for enrichment
- All API endpoints
- Rate limiting logic
- Company normalization

### Phase 3: Integration & Testing (PENDING)
- Connect frontend to backend APIs
- Add error/loading states
- Test core user journeys
- Architect review

## API Endpoints (To Be Implemented)

### Authentication
- POST /api/auth/signup - Create new user account
- POST /api/auth/login - Authenticate existing user

### Contacts
- POST /api/contacts/upload - Upload CSV file with contacts
- POST /api/contacts/add - Add single contact manually
- POST /api/contacts/enrich - Trigger AI enrichment for user's contacts
- GET /api/contacts - Get user's contacts

### Search
- GET /api/search?q=query - Search for direct and indirect matches

### Introductions
- POST /api/intro/request - Request introduction through connector
- POST /api/intro/respond - Accept or decline intro request
- POST /api/intro/complete - Mark introduction as completed
- GET /api/intro/sent - Get requests user has sent
- GET /api/intro/received - Get requests user has received

### Admin
- GET /api/admin/stats - Get platform-wide statistics

## LLM Prompts

### Contact Enrichment
Extracts structured data (name, company, title, industry, seniority, location, confidence) from raw contact text.

### Industry Classification
Maps company names to industry categories (fintech, consulting, luxury, retail, software, etc.)

### Introduction Messages
Generates professional message templates for:
- User → Connector (requesting intro)
- Connector → Target (making the intro)

## Design Guidelines
- Follow design_guidelines.md for all UI implementations
- Use Inter for body text, Space Grotesk for headings
- Maintain consistent spacing (4, 6, 8, 12, 16, 24px)
- Cards with hover-elevate for subtle interactions
- Badges for status indicators with color coding
- Professional color scheme optimized for both light and dark modes

## User Preferences
None recorded yet - first session

## Recent Changes
- 2024-11-18: Initial project setup with complete frontend implementation
- Schema defined for all data models
- All page components created with exceptional visual design
- Theme and auth contexts implemented
- Design tokens configured in Tailwind

## Next Steps
1. Implement complete backend with storage layer
2. Add OpenAI integration for enrichment
3. Build all API endpoints
4. Connect frontend to backend
5. Test core user journeys
