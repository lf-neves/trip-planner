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

1. To run the unitary backend tests, enter the ./apps/agents folder and execute pnpm run test:unit
2. To run the e2e tests, go to the project root and execute pnpm run test:e2e
3. To run the frontend unit tests, go to the ./apps/web and execute pnpm run test:unit

### Additional Tools

**Database Management**

```bash
# Open Prisma Studio to view/edit database
cd apps/libs/database
pnpm prisma:studio
```

---

### How to simulate latency & failures

---

### 📋 Detailed Documentation

For comprehensive project information, see [PROJECT_DETAILS.md](./PROJECT_DETAILS.md):

- **[Next Steps & Roadmap](./PROJECT_DETAILS.md#next-steps--roadmap)** - Detailed development roadmap with testing improvements, production deployment, monitoring, and scalability enhancements
- **[Trade-offs & Architectural Decisions](./PROJECT_DETAILS.md#trade-offs--decisions)** - In-depth analysis of framework choices, LLM strategies, UI decisions, and development trade-offs
- **[AI Usage & Development Process](./PROJECT_DETAILS.md#ai-usage--development-process)** - Comprehensive overview of AI tools integration throughout the development lifecycle
