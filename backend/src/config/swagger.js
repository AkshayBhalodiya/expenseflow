import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExpenseFlow API',
      version: '1.0.0',
      description:
        'Complete REST API documentation for ExpenseFlow — expense management SaaS with income, EMI, credit cards, budgets, goals, household sharing, analytics, and reports.',
      contact: {
        name: 'ExpenseFlow',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local development' },
      { url: '/api', description: 'Relative (same host)' },
    ],
    tags: [
      { name: 'System', description: 'Health & system endpoints' },
      { name: 'Auth', description: 'Authentication & profile' },
      { name: 'Users', description: 'User management & admin' },
      { name: 'Expenses', description: 'Expense tracking & OCR' },
      { name: 'Income', description: 'Income management' },
      { name: 'EMI', description: 'Loan & EMI tracking' },
      { name: 'Credit Cards', description: 'Credit card usage & bills' },
      { name: 'Household', description: 'Shared home finances (husband & wife)' },
      { name: 'Budgets', description: 'Monthly budgets' },
      { name: 'Goals', description: 'Savings goals' },
      { name: 'Recurring', description: 'Recurring transactions' },
      { name: 'Analytics', description: 'Dashboard & analytics' },
      { name: 'Reports', description: 'Reports & export' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Categories', description: 'Expense categories' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token from /auth/login',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/config/swagger.paths.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
