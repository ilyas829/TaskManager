import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://localhost:3001';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use useCallback to memoize fetchTasks function
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else if (response.status === 401) {
        // Token expired
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [token]); // Include token as dependency

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Include fetchTasks in dependency array

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUsername('');
        setPassword('');
      } else {
        const error = await response.json();
        setLoginError(error.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        setNewTask({ title: '', description: '' });
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchTasks();
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
    setEditingTask(null);
  };

  // Rest of your component remains the same...
  if (!token) {
    return (
      <div className="login-container">
        <h2>Task Manager Login</h2>
        <form onSubmit={handleLogin} data-testid="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            data-testid="username-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
            required
          />
          <button type="submit" data-testid="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {loginError && <div className="error" data-testid="login-error">{loginError}</div>}
        </form>
        <div className="demo-credentials">
          <p><strong>Demo credentials:</strong></p>
          <p>Username: admin | Password: password</p>
          <p>Username: user | Password: password</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Task Manager</h1>
        <button onClick={logout} data-testid="logout-button">Logout</button>
      </header>

      <div className="task-form">
        <h3>Add New Task</h3>
        <form onSubmit={createTask} data-testid="create-task-form">
          <input
            type="text"
            placeholder="Task title *"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            data-testid="new-task-title"
            required
          />
          <input
            type="text"
            placeholder="Task description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            data-testid="new-task-description"
          />
          <button type="submit" data-testid="create-task-button">Add Task</button>
        </form>
      </div>

      <div className="tasks-list">
        <h3>Your Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p data-testid="no-tasks">No tasks yet. Create your first task above!</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
              data-testid={`task-${task.id}`}
            >
              <div style={{ flex: 1 }}>
                {editingTask === task.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      defaultValue={task.title}
                      data-testid={`edit-title-${task.id}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateTask(task.id, { title: e.target.value });
                        }
                      }}
                      onBlur={(e) => updateTask(task.id, { title: e.target.value })}
                    />
                    <input
                      type="text"
                      defaultValue={task.description}
                      data-testid={`edit-description-${task.id}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateTask(task.id, { description: e.target.value });
                        }
                      }}
                      onBlur={(e) => updateTask(task.id, { description: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                          data-testid={`task-completed-${task.id}`}
                        />
                        {task.completed ? 'Completed' : 'Mark as completed'}
                      </label>
                    </div>
                  </>
                )}
              </div>
              <div className="task-actions">
                <button 
                  onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                  data-testid={`edit-task-${task.id}`}
                >
                  {editingTask === task.id ? 'Done' : 'Edit'}
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  data-testid={`delete-task-${task.id}`}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
