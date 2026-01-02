# System Patterns

## Architecture
Molecular Monorepo structure containing Frontend and Backend.

### Frontend
- **Framework**: Vue 3 (Composition API likely, given pinia).
- **State Management**: Pinia (modern replacement for Vuex).
- **UI Component Library**: Vuetify (Material Design).
- **Build Tool**: Vite.
- **Pattern**: Component-based architecture.

### Backend
- **Runtime**: Node.js.
- **Framework**: Express.js.
- **Language**: TypeScript.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JWT-based auth strategy.
- **Logging**: Winston.
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc).

## Key Technical Decisions
- **TypeScript on Backend**: Ensures type safety and better developer experience for the API.
- **Vue 3 + Vite**: Modern, fast frontend development experience.
- **Docker**: Used for consistent development and potentially deployment environments.
- **Monorepo**: Keeps frontend and backend code together for easier project management.
