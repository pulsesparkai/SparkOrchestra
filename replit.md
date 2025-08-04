# Orchestra - AI Agent Management Platform

## Overview

Orchestra is a modern web application for managing and orchestrating AI agents, built by PulseSpark.ai. The platform provides a comprehensive interface for creating, configuring, and monitoring AI agents with various models and capabilities. It features a dark-themed UI with purple (#6B46C1) accents and supports agent workflow management through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### BYOAPI Functionality Implementation (Latest)
- Added optional "API Key" field in agent creation form with validation and encryption
- Implemented ApiKeyValidator component with real-time validation, format checking, and secure display
- Built EncryptionService for secure API key storage using AES-256-GCM encryption
- Created API key validation endpoint with format checking and basic Anthropic compatibility
- Added ApiKeyIndicator component showing "Using your key" vs "Using Orchestra credits" status
- Enhanced agent cards to display API key status with green/purple badge indicators
- Implemented encrypted API key storage in database with proper decryption for usage
- Built BYOAPI logic: user keys bypass token limits, platform keys count toward plan limits
- Added secure API key handling throughout agent creation, validation, and execution workflows
- Created clear visual differentiation between unlimited BYOAPI usage and limited platform usage

## Previous Changes

### UI Theme Update
- Changed primary color scheme from blue to purple (#6B46C1)
- Updated all components to use dark theme with gray cards and purple accents
- Application name is now "Orchestra by PulseSpark.ai"

### Agent Management Enhancements
- Added "Role" dropdown field with options: Researcher, Analyst, Writer, Custom
- Replaced "Conductor Oversight" checkbox with "Enable Conductor Monitoring" toggle switch
- Added "Preview Agent" button alongside "Save Agent" button
- Updated agent form with improved styling and purple theme

### Workflow Designer Implementation
- Built comprehensive workflow designer using React Flow
- Added draggable agent cards in left sidebar with role badges and status indicators
- Created custom agent nodes with role-specific icons and connection handles
- Implemented visual connection lines with arrows for data flow
- Added toolbar with Run Workflow, Save, and Clear Canvas functionality
- Built right panel for selected node details and configuration

### Conductor Dashboard
- Created real-time monitoring dashboard with AI conductor avatar
- Added system health metrics: total agents, active workflows, success rate
- Implemented live activity log stream with timestamp and agent tracking
- Built active workflows panel with progress bars and status indicators
- Added intervention controls: Pause, Resume, and Retry Failed Agent buttons
- Integrated real-time updates every 3 seconds for dynamic monitoring

### Pricing Page
- Built professional pricing page with purple gradient background theme
- Created single "Early Adopter Plan" card at $15/month with limited time offer badge
- Added comprehensive features list: unlimited agents, conductor orchestration, 1000 tokens/month, real-time monitoring, API access
- Implemented "Get Started" button ready for Stripe checkout integration
- Added FAQ section and additional platform benefits showcase
- Included security badges and guarantee information for user confidence

### Real-time WebSocket Integration
- Implemented Socket.io for live updates across workflow and conductor interfaces
- Added workflow progress events with agent status updates (idle, running, complete, error)
- Built real-time log streaming to conductor dashboard with timestamp and agent tracking
- Created conductor intervention notifications for pause, resume, and retry operations
- Integrated live token usage counter updates for monitoring resource consumption
- Added WebSocket client with auto-reconnection and subscription management
- Enhanced workflow canvas nodes with animated status indicators and real-time updates
- Enabled live workflow execution with progress tracking and completion notifications

### Secure Agent API with Clerk Authentication
- Created Express API routes in server/routes/agents.ts with full CRUD operations
- Integrated Clerk authentication middleware for user-specific agent management
- Implemented bcryptjs encryption for secure API key storage in database
- Added soft delete functionality with deletedAt timestamp for data integrity
- Built Anthropic SDK integration for agent testing with real AI responses
- Added user ownership validation to ensure agents belong to authenticated users
- Created comprehensive error handling and input validation using Zod schemas

### Orchestra Conductor System
- Built comprehensive Conductor class in server/conductor/index.ts for workflow orchestration
- Implemented orchestrateWorkflow() method that manages sequential agent execution with user validation
- Created executeAgent() method that calls Anthropic API with agent prompts and system context
- Added handleHandoff() functionality for passing context data between agents in workflows
- Built monitorExecution() system that tracks progress and emits real-time Socket.io events
- Implemented intervene() method supporting pause, resume, retry, skip, and abort actions
- Integrated real-time WebSocket events for workflow progress, agent status, and log streaming
- Added comprehensive workflow context tracking with execution logs and error handling
- Created conductor API endpoints: POST /workflows/:id/start, GET /workflows/:id/status, POST /workflows/:id/intervene
- Enhanced workflow designer to integrate with conductor API for live agent execution

### Schema Updates
- Added `role` field to agents table with default "Custom"
- Renamed `conductorOversight` to `conductorMonitoring` for clarity
- Fixed API key handling to properly support optional custom keys

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom brand colors (black, gray, white, purple theme)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: Hot module replacement via Vite integration
- **API Design**: RESTful endpoints for agent management operations
- **Request Handling**: Express middleware for JSON parsing, CORS, and logging

### Data Storage Solutions
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM with connection pooling
- **Schema Management**: Drizzle migrations in TypeScript
- **Data Models**: Users and Agents tables with UUID primary keys and timestamp tracking

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development
- **User Model**: Username/password based authentication system

### External Service Integrations
- **AI Services**: Anthropic Claude integration for agent testing and communication
- **Model Support**: Claude Sonnet 4 (latest model as of 2025) as the default
- **API Key Management**: Per-agent API key configuration with fallback to environment variables
- **Payment Processing**: Stripe integration for subscription management

### Key Architectural Decisions

1. **Monolithic Structure**: Single codebase with shared types between client and server via a `shared` directory for consistency and type safety

2. **Database Choice**: PostgreSQL with Drizzle ORM chosen for strong typing, schema migrations, and serverless compatibility with Neon

3. **State Management**: TanStack Query eliminates the need for complex client-side state management by handling server state caching and synchronization

4. **Component Architecture**: Radix UI + Shadcn provides accessible, customizable components with consistent design system

5. **Development Experience**: Vite integration with Express provides fast development builds and hot module replacement while maintaining production compatibility

6. **Storage Abstraction**: Interface-based storage layer allows for easy switching between in-memory (development) and database (production) implementations

7. **API Design**: RESTful endpoints following conventional patterns (/api/agents) with proper error handling and response formatting