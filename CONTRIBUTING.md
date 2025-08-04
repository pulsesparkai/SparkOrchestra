# Contributing to Orchestra

Thank you for your interest in contributing to Orchestra! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Set up your environment variables (copy `.env.example` to `.env`)
5. Run the development server: `npm run dev`

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Frontend Development
- Use React functional components with hooks
- Follow the existing component structure in `client/src/components/`
- Use Tailwind CSS for styling
- Implement responsive design for all new components

### Backend Development
- Use Express.js for API routes
- Implement proper error handling
- Use the storage interface for data operations
- Add input validation using Zod schemas

### Database Changes
- Use Drizzle ORM for schema changes
- Create migrations for schema updates
- Test database changes thoroughly

### WebSocket Integration
- Use the existing WebSocket manager for real-time features
- Follow the established event naming conventions
- Handle connection errors gracefully

## Testing

Before submitting changes:
1. Test all functionality manually
2. Ensure no console errors
3. Verify WebSocket connections work properly
4. Test responsive design on different screen sizes

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Commit with descriptive messages
4. Push to your fork
5. Create a Pull Request

## Pull Request Guidelines

- Provide a clear description of changes
- Include screenshots for UI changes
- Reference any related issues
- Ensure all tests pass
- Keep changes focused and atomic

## Code Review Process

All contributions go through code review:
1. Automated checks must pass
2. At least one maintainer approval required
3. Address any feedback promptly
4. Maintainers will merge approved PRs

## Questions?

Feel free to open an issue for any questions about contributing or the codebase.