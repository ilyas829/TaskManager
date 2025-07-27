const request = require('supertest');
const { app, server } = require('../server');

describe('Task Manager API Tests', () => {
  let authToken;
  let testTaskId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'admin',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('admin');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'admin'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });
  });

  describe('Task Management', () => {
    test('should get tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should create new task', async () => {
      const taskData = {
        title: 'Test API Task',
        description: 'Created via API test'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.completed).toBe(false);
      
      testTaskId = response.body.id;
    });

    test('should update existing task', async () => {
      const updateData = {
        title: 'Updated Test Task',
        completed: true
      };

      const response = await request(app)
        .put(`/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.completed).toBe(true);
    });

    test('should delete existing task', async () => {
      const response = await request(app)
        .delete(`/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Security', () => {
    test('should reject requests without token', async () => {
      const response = await request(app).get('/tasks');
      expect(response.status).toBe(401);
    });

    test('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(403);
    });
  });
});
