# Tech Context

## Technologies

### Frontend
- **Language**: JavaScript / Vue templates.
- **Framework**: Vue 3.
- **State Management**: Pinia.
- **UI Library**: Vuetify 3.
- **HTTP Client**: Axios.
- **Build Tool**: Vite.
- **Styling**: Sass/SCSS.

### Backend
- **Language**: TypeScript.
- **Runtime**: Node.js.
- **Framework**: Express.
- **Database**: MongoDB.
- **ORM/ODM**: Mongoose.
- **Validation**: Joi.
- **Auth**: BCrypt, JSONWebToken.
- **Logging**: Winston, Morgan.

## Development Setup
- **Docker**: `docker-compose.dev.yml` enables spinning up both services + MongoDB.
- **Ports**:
    - Frontend: 8080
    - Backend: 5000
- **Running Locally (Access)**:
    - Frontend: `http://localhost:8080`
    - Backend API: `http://localhost:5000/api`

## Constraints
- **Ports**: Must ensure 8080 and 5000 are free or configured otherwise.
- **Database**: Requires a running MongoDB instance (handled by Docker or external).
