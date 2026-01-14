# Dev³ (Dev Cubed)

## Overview

Dev³ is a web3 experiment where three independent AI models (Grok, ChatGPT, and Claude) jointly operate as a single developer. Instead of one AI making unilateral decisions, the system implements a consensus-based approach where each AI model has a specialized role:

- **Grok**: Risk & Momentum - Handles risk assessment, momentum tracking, and edge detection
- **ChatGPT**: Structure & Execution - Manages structure, execution logic, and system design
- **Claude**: Ethics & Restraint - Oversees ethics, restraint, and long-term consistency

The application allows decisions to be submitted, deliberated upon by all three AI models, and resolved through a consensus mechanism.

## User Preferences

Preferred communication style: Simple, everyday language.

## API Reference

### Base URL
All API endpoints are prefixed with `/api`

### Endpoints

#### Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | Get AI model information and roles |
| GET | `/api/health` | Health check endpoint |
| GET | `/api/stats` | Get aggregated statistics |

#### Decisions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/decisions` | Create a new decision |
| GET | `/api/decisions` | List all decisions |
| GET | `/api/decisions/:id` | Get a specific decision |
| PATCH | `/api/decisions/:id` | Update a decision |
| DELETE | `/api/decisions/:id` | Delete a decision |

#### AI Responses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/decisions/:id/responses` | Add an AI model's response |
| GET | `/api/decisions/:id/responses` | Get all responses for a decision |

#### Consensus
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/decisions/:id/consensus` | Calculate and reach consensus |
| GET | `/api/decisions/:id/consensus` | Get consensus for a decision |

### Request/Response Examples

#### Create Decision
```bash
POST /api/decisions
Content-Type: application/json

{
  "title": "Implement Dark Mode",
  "description": "Should we add dark mode toggle functionality?",
  "category": "feature",
  "priority": "high",
  "context": "Optional additional context"
}
```

Response (201 Created):
```json
{
  "id": "uuid",
  "title": "Implement Dark Mode",
  "description": "Should we add dark mode toggle functionality?",
  "category": "feature",
  "priority": "high",
  "status": "pending",
  "responses": [],
  "consensus": null,
  "createdAt": "2026-01-14T12:00:00.000Z",
  "updatedAt": "2026-01-14T12:00:00.000Z"
}
```

#### Add AI Response
```bash
POST /api/decisions/:id/responses
Content-Type: application/json

{
  "model": "grok",
  "vote": "approve",
  "reasoning": "High momentum opportunity with strong user demand.",
  "confidence": 92,
  "risks": ["Complexity increase", "Testing overhead"],
  "recommendations": ["Use CSS variables", "Add system preference detection"]
}
```

Response (201 Created):
```json
{
  "id": "uuid",
  "decisionId": "decision-uuid",
  "model": "grok",
  "vote": "approve",
  "reasoning": "High momentum opportunity with strong user demand.",
  "confidence": 92,
  "risks": ["Complexity increase", "Testing overhead"],
  "recommendations": ["Use CSS variables", "Add system preference detection"],
  "createdAt": "2026-01-14T12:01:00.000Z"
}
```

#### Reach Consensus
```bash
POST /api/decisions/:id/consensus
```

Response (201 Created):
```json
{
  "id": "uuid",
  "decisionId": "decision-uuid",
  "outcome": "approved",
  "unanimity": true,
  "voteSummary": {
    "approve": 3,
    "reject": 0,
    "abstain": 0
  },
  "synthesizedReasoning": "Combined reasoning from all AI models...",
  "actionItems": ["Merged recommendations from all models"],
  "createdAt": "2026-01-14T12:02:00.000Z"
}
```

### Enums

#### Categories
- `architecture` - System architecture decisions
- `feature` - New feature implementations
- `refactor` - Code refactoring decisions
- `security` - Security-related decisions
- `performance` - Performance optimization decisions
- `dependency` - Dependency management decisions
- `other` - Other decisions

#### Priorities
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `critical` - Critical priority

#### Decision Status
- `pending` - Awaiting AI responses
- `deliberating` - All AIs have responded, awaiting consensus
- `consensus_reached` - Final decision made
- `deadlock` - Unable to reach consensus

#### Vote Types
- `approve` - Approve the decision
- `reject` - Reject the decision
- `abstain` - Abstain from voting

#### Consensus Outcomes
- `approved` - 2+ approve votes
- `rejected` - 2+ reject votes
- `needs_revision` - No clear majority

### Error Responses

All errors follow this format:
```json
{
  "error": "Error type",
  "message": "Human-readable description",
  "details": [] // Validation errors if applicable
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Storage**: Abstracted storage interface (IStorage) with in-memory implementation (MemStorage)
- **Validation**: Zod schemas for request/response validation

### Data Models

#### Decision
```typescript
interface Decision {
  id: string;
  title: string;
  description: string;
  context?: string;
  category: "architecture" | "feature" | "refactor" | "security" | "performance" | "dependency" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "deliberating" | "consensus_reached" | "deadlock";
  responses?: AIResponse[];
  consensus?: Consensus | null;
  createdAt: string;
  updatedAt: string;
}
```

#### AIResponse
```typescript
interface AIResponse {
  id: string;
  decisionId: string;
  model: "grok" | "chatgpt" | "claude";
  vote: "approve" | "reject" | "abstain";
  reasoning: string;
  confidence: number; // 0-100
  risks?: string[];
  recommendations?: string[];
  createdAt: string;
}
```

#### Consensus
```typescript
interface Consensus {
  id: string;
  decisionId: string;
  outcome: "approved" | "rejected" | "needs_revision";
  unanimity: boolean;
  voteSummary: {
    approve: number;
    reject: number;
    abstain: number;
  };
  synthesizedReasoning: string;
  actionItems?: string[];
  createdAt: string;
}
```

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/ui/  # shadcn/ui components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and query client
│       └── pages/          # Route components
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions (documented with JSDoc)
│   ├── storage.ts    # Data persistence layer (IStorage interface)
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Zod schemas and TypeScript types
└── script/           # Build scripts
```

### Design System
The project follows a hybrid design approach inspired by Linear, Stripe, and Web3 aesthetics (Uniswap, Rainbow):
- Typography: Inter for headings/body, JetBrains Mono for code
- Dark mode support via CSS class toggle
- Custom color palette with primary purple accent
- Consistent spacing using Tailwind's scale

## Decision Workflow

1. **Create Decision** - Submit a decision request with title, description, category, and priority
2. **AI Responses** - Each of the three AI models (Grok, ChatGPT, Claude) submits their response
3. **Status Update** - Once all three models respond, status changes to "deliberating"
4. **Reach Consensus** - Calculate the final outcome based on majority voting
5. **Action Items** - Synthesize recommendations from all models into actionable items

## External Dependencies

### Backend Libraries
- **Express.js**: Web framework
- **Zod**: Runtime type validation
- **crypto (Node.js built-in)**: UUID generation

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching
- **React Hook Form**: Form handling with Zod resolver
- **Recharts**: Charting library
- **date-fns**: Date manipulation

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for Node.js
