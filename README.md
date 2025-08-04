# Orchestra - AI Agent Management Platform

Orchestra is a modern, full-stack web application for managing and orchestrating AI agents, built by PulseSpark.ai. The platform provides a comprehensive interface for creating, configuring, and monitoring AI agents with real-time workflow execution and conductor oversight.

## 🚀 Features

- **Agent Management**: Create and configure AI agents with different roles (Researcher, Analyst, Writer, Custom)
- **Workflow Designer**: Visual workflow canvas with drag-and-drop agent orchestration
- **Real-time Monitoring**: Live WebSocket updates for workflow progress and system metrics
- **Conductor Dashboard**: AI oversight with intervention controls and activity logging
- **Professional UI**: Dark theme with purple accents (#6B46C1) and modern components
- **Subscription Management**: Stripe integration for Early Adopter Plan ($15/month)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Flow** for workflow visualization
- **Socket.io Client** for real-time updates
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Socket.io** for WebSocket communication
- **PostgreSQL** with Neon serverless database
- **Drizzle ORM** for database operations
- **Anthropic Claude** integration for AI services

## 🏗️ Architecture

Orchestra follows a modern full-stack architecture with:

- **Monolithic Structure**: Shared types between client and server via `shared/` directory
- **Real-time Communication**: Socket.io WebSocket integration for live updates
- **Database Integration**: PostgreSQL with Drizzle ORM for type-safe operations
- **Component-based UI**: Radix UI primitives with custom Orchestra branding
- **API-first Design**: RESTful endpoints with proper error handling

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Anthropic API key (optional for testing)
- Stripe API keys (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/orchestra-ai-platform.git
   cd orchestra-ai-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Required
   DATABASE_URL=your_postgresql_connection_string
   
   # Optional
   ANTHROPIC_API_KEY=your_anthropic_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📖 Usage

### Creating Agents
1. Navigate to the **Agents** page
2. Click "Create New Agent"
3. Configure name, role, system prompt, and model settings
4. Save and test your agent

### Building Workflows
1. Go to the **Workflow** page
2. Drag agents from the sidebar to the canvas
3. Connect agents with flow lines
4. Click "Run Workflow" to execute

### Monitoring with Conductor
1. Visit the **Conductor** dashboard
2. Monitor real-time system metrics
3. View live activity logs
4. Use intervention controls when needed

## 🔧 API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get specific agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/test` - Test agent with Anthropic

### Workflows
- `POST /api/workflows/run` - Start workflow execution
- `POST /api/workflows/:id/pause` - Pause workflow
- `POST /api/workflows/:id/resume` - Resume workflow

## 🔌 WebSocket Events

### Client → Server
- `subscribe-workflow` - Subscribe to workflow updates
- `subscribe-conductor` - Subscribe to conductor dashboard

### Server → Client
- `workflow-progress` - Agent status updates
- `new-log` - Real-time activity logs
- `conductor-event` - Intervention notifications
- `token-usage` - Token consumption updates

## 🎨 Design System

Orchestra uses a consistent design language:

- **Primary Color**: Purple (#6B46C1)
- **Theme**: Dark mode with gray cards
- **Typography**: Clean, modern font stack
- **Icons**: Lucide React icons
- **Components**: Shadcn/ui with custom styling

## 📝 License

This project is proprietary software developed by PulseSpark.ai.

## 🤝 Contributing

This is a private project. For questions or support, contact the PulseSpark.ai team.

## 📧 Support

For technical support or questions about Orchestra, please contact support@pulsespark.ai