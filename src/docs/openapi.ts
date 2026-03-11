import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { loginSchema, registerSchema, userResponseSchema } from '../validations/user.schema.js';

const registry = new OpenAPIRegistry();

// Register the schema as a reusable component
registry.register('User', registerSchema);

// Register the POST /register endpoint
registry.registerPath({
  method: 'post',
  path: '/users/register',
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: { 'application/json': { schema: registerSchema } }, // You could refine this to the response schema
    },
    400: { description: 'Validation failed' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users/login',
  summary: 'User Login',
  request: {
    body: {
      content: {
        'application/json': { schema: loginSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: userResponseSchema } },
    },
    401: { description: 'Unauthorized - Invalid credentials' },
  },
});

// Export the document generator function
export const getDocs = () => {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: { title: 'bingebox-api', version: '1.0.0' },
  });
};