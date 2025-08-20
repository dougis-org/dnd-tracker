---
inclusion: always
---

# Development Standards and Best Practices

## Code Quality Requirements

All code must meet these standards before PR creation:

### TypeScript Standards

- Use strict mode configuration
- No `any` types without eslint-disable comments and justification
- Proper type definitions for all functions and components
- Use interface definitions for complex objects

### Code Organization

- Follow established folder structure:
  - `src/app/` - Next.js app router pages and layouts
  - `src/components/` - Reusable React components
  - `src/lib/` - Utility functions and configurations
  - `src/models/` - Database models and schemas
  - `src/types/` - TypeScript type definitions
  - `src/hooks/` - Custom React hooks

### Component Standards

- Use functional components with hooks
- Implement proper error boundaries where needed
- Follow shadcn/ui patterns for UI components
- Ensure accessibility compliance (ARIA labels, keyboard navigation)

### API Route Standards

- Implement proper error handling with appropriate HTTP status codes
- Use Zod for request validation
- Include proper TypeScript types for request/response
- Follow RESTful conventions

### Database Standards

- Use Mongoose for MongoDB interactions
- Implement proper schema validation
- Include appropriate indexes for performance
- Handle connection errors gracefully

### Security Standards

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Implement proper input validation and sanitization
- Follow authentication best practices

### Testing Requirements

- Ensure build passes: `npm run build`
- Verify type checking: `npm run type-check`
- Run linting: `npm run lint`
- Test in development mode: `npm run dev`

## Git Commit Standards

- Use conventional commit messages
- Make atomic commits (one logical change per commit)
- Write descriptive commit messages explaining the "why"
- Keep commits focused and avoid mixing unrelated changes

## Documentation Requirements

- Update README.md for significant changes
- Document new environment variables in .env.example
- Include JSDoc comments for complex functions
- Update API documentation for new endpoints
