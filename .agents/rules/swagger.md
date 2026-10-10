---
description: Ensure all backend endpoints include OpenAPI/Swagger documentation
globs: /srv/chromatik/app/backend/**/*.ts
---

# Backend Swagger/OpenAPI Documentation Rule

When creating or modifying endpoints in the backend (Express controllers, routes, etc.), you MUST STRICTLY follow these documentation rules:

1. **JSDoc OpenAPI Comments:** Every endpoint/controller method must have a JSDoc block starting with `/** @openapi ... */` immediately above its route definition or controller method.
2. **Proper Formatting:** Use correct YAML indentation inside the JSDoc block.
3. **Tags & Summary:** Include appropriate `tags`, `summary`, and `description` for each route.
4. **Request & Response Schemas:** Define expected `requestBody` (if applicable) and standard `responses` (e.g., 200, 201, 400, 401).

### Example:
```typescript
    /**
     * @openapi
     * /api/user/login:
     *   post:
     *     tags:
     *      - "User"
     *     summary: "Login a user"
     *     responses:
     *          200:
     *              description: Returns the current logged in user
     *          401:
     *             description: Unauthorized
     * 
     */
```
