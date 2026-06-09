import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Validators', () => {
  it('should validate register schema', async () => {
    const { registerSchema } = await import('../src/utils/validators.js');
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    const { registerSchema } = await import('../src/utils/validators.js');
    const result = registerSchema.safeParse({
      name: 'Test',
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate expense schema', async () => {
    const { expenseSchema } = await import('../src/utils/validators.js');
    const result = expenseSchema.safeParse({
      title: 'Lunch',
      amount: 500,
      category: 'Food',
      date: new Date(),
    });
    expect(result.success).toBe(true);
  });
});
