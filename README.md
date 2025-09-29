# Trip Planner Agent App

AI-powered travel assistant that uses LangGraph's multi-agent architecture to handle conversational trip planning through natural language. Features hierarchical agents (supervisor + specialized sub-agents), real-time streaming UI with generative React components, and integrated flight/hotel booking workflows. Built with TypeScript, Next.js, Prisma ORM, and GPT-4o models in a Turborepo monorepo structure.

🔥 Key Features:
• Multi-agent conversational AI with intelligent routing
• Generative UI components that adapt to conversation context  
• Real-time streaming responses and interactive booking flows
• Comprehensive trip planning (flights, hotels, itineraries)
• One-command automated setup with cross-platform support
• Full TypeScript safety across agents and frontend

🏗️ Tech Stack: LangGraph, Next.js, TypeScript, Prisma, OpenAI GPT-4o, Turborepo, Tailwind CSS

---

### Quick Setup (Automated)

**🚀 One-Command Setup** (Recommended)

```bash
# Clone the repository
git clone git@github.com:lf-neves/trip-planner.git
cd trip-planner

# Run the automated setup script (cross-platform)
npm run setup
```

### API Keys Required

Add these to your `.env` file:

- **OPENAI_API_KEY**
- **DATABASE_URL**
- **NEXT_PUBLIC_API_URL**
- **NEXT_PUBLIC_ASSISTANT_ID**

### Running the Application

```bash
# Start both web app and LangGraph server
pnpm dev
```

This will start:

- **Web App**: http://localhost:3000
- **LangGraph Studio**: http://localhost:2024

### Running the tests

All tests can now be run from the root directory:

```bash
# Individual test suites
pnpm test:unit:web     # Frontend unit tests only
pnpm test:unit:agents  # Backend unit tests only
pnpm test:e2e          # End-to-end tests only

# Development mode
pnpm test:watch        # Watch mode for all unit tests
```

**Test Coverage by Suite:**

- **Frontend (`test:unit:web`)**: React components, hooks, utilities
- **Backend (`test:unit:agents`)**: LangGraph agents, tools, business logic
- **E2E (`test:e2e`)**: Full user workflows with Playwright

### Additional Tools

**Database Management**

```bash
# Open Prisma Studio to view/edit database
cd apps/libs/database
pnpm prisma:studio
```

---

### How to simulate latency & failures

The trip planner includes built-in simulation features for testing error handling and loading states during flight booking:

#### **Simulation Features**

- **Latency Simulation**: Random delays between 300ms - 1200ms
- **Error Simulation**: 15% random failure rate
- **UI Testing**: Skeleton loading states and retry functionality

#### **Configuration**

**Environment Variables:**

```bash
# Enable/disable simulation (default: enabled in development)
SIMULATION_ENABLED=true

# Customize latency range (default: 300-1200ms)
SIMULATION_LATENCY_MIN=300
SIMULATION_LATENCY_MAX=1200

# Customize error rate (default: 15%)
SIMULATION_ERROR_RATE=15
```

#### **Testing User Experience**

1. **Loading States**: Book a flight to see skeleton components during processing
2. **Error Handling**: ~15% of booking attempts will fail with retry options
3. **Retry Functionality**: Failed bookings can be retried with the "Try Again" button
4. **Error Types**: Simulates various realistic booking failures:
   - Airline system errors
   - Network connection issues
   - Request timeouts

#### **Disable Simulation**

To disable simulation for production or testing:

```bash
SIMULATION_ENABLED=false
```

Or set `NODE_ENV=production` (simulation auto-disables in production).

---

### 📋 Detailed Documentation

For comprehensive project information, see [PROJECT_DETAILS.md](./PROJECT_DETAILS.md):

- **[Agent Architecture](./PROJECT_DETAILS.md#agent-architecture)** - In-depth technical overview of the multi-agent system, routing intelligence, and state management
- **[Generative Components Table](./PROJECT_DETAILS.md#generative-components-table)** - Complete reference of all React UI components with props, integration patterns, and tool mappings
- **[Next Steps & Roadmap](./PROJECT_DETAILS.md#next-steps--roadmap)** - Detailed development roadmap with testing improvements, production deployment, monitoring, and scalability enhancements
- **[Trade-offs & Architectural Decisions](./PROJECT_DETAILS.md#trade-offs--decisions)** - In-depth analysis of framework choices, LLM strategies, UI decisions, and development trade-offs
- **[AI Usage & Development Process](./PROJECT_DETAILS.md#ai-usage--development-process)** - Comprehensive overview of AI tools integration throughout the development lifecycle
