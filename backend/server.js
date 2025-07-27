const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (for demo - use database in production)
let users = [
  { 
    id: 1, 
    username: 'admin', 
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
  },
  { 
    id: 2, 
    username: 'user', 
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
  }
];

let tasks = [
  { id: 1, title: 'Complete project setup', description: 'Set up the full project structure', completed: false, userId: 1 },
  { id: 2, title: 'Write comprehensive tests', description: 'Create UI and API test suites', completed: false, userId: 1 }
];

let taskIdCounter = 3;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = users.find(u => u.username === username);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ 
    token, 
    user: { id: user.id, username: user.username } 
  });
});

// Task routes
app.get('/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks);
});

app.post('/tasks', authenticateToken, (req, res) => {
  const { title, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: taskIdCounter++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Update only provided fields
  if (title !== undefined) tasks[taskIndex].title = title.trim();
  if (description !== undefined) tasks[taskIndex].description = description.trim();
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
