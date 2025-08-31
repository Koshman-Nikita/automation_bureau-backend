// src/config/swagger.ts
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const OPENAPI_VERSION = '3.0.3';

const definition = {
  openapi: OPENAPI_VERSION,
  info: {
    title: 'Automation Bureau API',
    version: '0.1.0',
    description:
      'Чернетка контрактів API для eBureau / Automation Bureau. Без БД. ' +
      'Використовується для узгодження схем і маршрутів з фронтендом.',
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 4000}`, description: 'Local dev' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'ActivityTypes' },
    { name: 'Employers' },
    { name: 'Jobseekers' },
    { name: 'Vacancies' },
    { name: 'Agreements' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Id: { type: 'string', example: '66ce99f0f4a2c8b6c3f0a123' },

      User: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'manager', 'employer', 'jobseeker'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'email', 'role'],
      },

      ActivityType: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          name: { type: 'string', example: 'Interview scheduled' },
          isActive: { type: 'boolean', default: true },
        },
        required: ['_id', 'name'],
      },

      Employer: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          name: { type: 'string' },
          city: { type: 'string' },
          contacts: { type: 'string', example: 'hr@company.com, +380501112233' },
        },
        required: ['_id', 'name'],
      },

      Jobseeker: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          fullName: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          city: { type: 'string' },
          salaryDesired: { type: 'number', example: 50000 },
          status: { type: 'string', enum: ['active', 'inactive'] },
        },
        required: ['_id', 'fullName'],
      },

      Vacancy: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          title: { type: 'string' },
          employerId: { $ref: '#/components/schemas/Id' },
          salaryMin: { type: 'number' },
          salaryMax: { type: 'number' },
          status: { type: 'string', enum: ['open', 'closed'], default: 'open' },
        },
        required: ['_id', 'title', 'employerId', 'status'],
      },

      Agreement: {
        type: 'object',
        properties: {
          _id: { $ref: '#/components/schemas/Id' },
          vacancyId: { $ref: '#/components/schemas/Id' },
          jobseekerId: { $ref: '#/components/schemas/Id' },
          date: { type: 'string', format: 'date' },
          commissionPct: { type: 'number', example: 10 },
          amount: { type: 'number', example: 15000 },
        },
        required: ['_id', 'vacancyId', 'jobseekerId', 'date'],
      },

      PaginationQuery: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          q: { type: 'string', description: 'Пошук' },
        },
      },

      ListResponse_ActivityType: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/ActivityType' } },
          total: { type: 'integer', example: 0 },
        },
      },
      ListResponse_Employer: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Employer' } },
          total: { type: 'integer', example: 0 },
        },
      },
      ListResponse_Jobseeker: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Jobseeker' } },
          total: { type: 'integer', example: 0 },
        },
      },
      ListResponse_Vacancy: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Vacancy' } },
          total: { type: 'integer', example: 0 },
        },
      },
      ListResponse_Agreement: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Agreement' } },
          total: { type: 'integer', example: 0 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' } } } } },
          },
        },
      },
    },

    '/api/db-health': {
      get: {
        tags: ['Health'],
        summary: 'Database health',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
               
                    ok: { type: 'boolean' },                
                    state: { type: 'string' },            
                    host: { type: 'string' },           
                    name: { type: 'string' },           
                    ping: { type: 'object' },         
                    error: { type: 'string', nullable: true },
                  },     
                },   
              },         
            }, 
          },
        },
      },
    },

    // ===== Auth =====
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register (create user)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['admin', 'manager', 'employer', 'jobseeker'] },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 409: { description: 'Email in use' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid token' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
      },
    },


    '/api/activity-types': {
      get: {
        tags: ['ActivityTypes'],
        summary: 'List activity types',
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } },
                     { in: 'query', name: 'limit', schema: { type: 'integer' } },
                     { in: 'query', name: 'q', schema: { type: 'string' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse_ActivityType' } } } },
        },
      },
      post: {
        tags: ['ActivityTypes'],
        summary: 'Create activity type (stub)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivityType' } } } },
        responses: { 501: { description: 'Not implemented' } },
      },
    },
    '/api/activity-types/{id}': {
      get: {
        tags: ['ActivityTypes'],
        summary: 'Get activity type by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
      put: {
        tags: ['ActivityTypes'],
        summary: 'Update activity type',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivityType' } } } },
        responses: { 501: { description: 'Not implemented' } },
      },
      delete: {
        tags: ['ActivityTypes'],
        summary: 'Delete activity type',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
    },

    '/api/employers': {
      get: {
        tags: ['Employers'],
        summary: 'List employers',
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } },
                     { in: 'query', name: 'limit', schema: { type: 'integer' } },
                     { in: 'query', name: 'q', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse_Employer' } } } } },
      },
    },
    '/api/employers/{id}': {
      get: {
        tags: ['Employers'],
        summary: 'Get employer by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
    },

    '/api/jobseekers': {
      get: {
        tags: ['Jobseekers'],
        summary: 'List jobseekers',
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } },
                     { in: 'query', name: 'limit', schema: { type: 'integer' } },
                     { in: 'query', name: 'q', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse_Jobseeker' } } } } },
      },
    },
    '/api/jobseekers/{id}': {
      get: {
        tags: ['Jobseekers'],
        summary: 'Get jobseeker by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
    },

    '/api/vacancies': {
      get: {
        tags: ['Vacancies'],
        summary: 'List vacancies',
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } },
                     { in: 'query', name: 'limit', schema: { type: 'integer' } },
                     { in: 'query', name: 'q', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse_Vacancy' } } } } },
      },
    },
    '/api/vacancies/{id}': {
      get: {
        tags: ['Vacancies'],
        summary: 'Get vacancy by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
    },

    '/api/agreements': {
      get: {
        tags: ['Agreements'],
        summary: 'List agreements',
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } },
                     { in: 'query', name: 'limit', schema: { type: 'integer' } },
                     { in: 'query', name: 'q', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse_Agreement' } } } } },
      },
    },
    '/api/agreements/{id}': {
      get: {
        tags: ['Agreements'],
        summary: 'Get agreement by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { $ref: '#/components/schemas/Id' } }],
        responses: { 501: { description: 'Not implemented' } },
      },
    },
  },
} as const;

const swaggerSpec = swaggerJSDoc({ definition, apis: [] });

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}
