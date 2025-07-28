# Task Manager - Full-Stack Application with Automated Testing

A comprehensive task management application built with React frontend, Node.js backend, and extensive automated testing suite.

##  Features

- **Authentication**: Secure JWT-based login system
- **Task Management**: Create, read, update, delete tasks
- **Real-time Updates**: Dynamic UI updates
- **Responsive Design**: Mobile-friendly interface
- **Comprehensive Testing**: UI automation + API testing
- **CI/CD Pipeline**: Automated testing and deployment

##  Architecture

task-manager-project/
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   └── tests/
│       └── api.test.js
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── build/ (created after build)
├── tests/
    ├── requirements.txt
    └── ui_tests.py

### 1. Clone and Setup
git clone <your-repo-url>
cd task-manager-project

Install backend dependencies
cd backend
npm install

Install frontend dependencies
cd ../frontend
npm install

Install Python test dependencies
pip install -r tests/requirements.txt



### 2. Start Development Servers
Terminal 1: Start backend (port 3001)
cd backend
npm run dev

Terminal 2: Start frontend (port 3000)
cd frontend
npm start



### 3. Run Tests
API tests
cd backend && npm test

UI tests (ensure both servers are running)
python -m pytest tests/ui_tests.py -v


## 🧪 Testing

### API Testing (Jest + Supertest)
cd backend
npm test # Run tests
npm run test:coverage # With coverage report



### UI Testing (Selenium + Python)
Run all UI tests
python -m pytest tests/ui_tests.py -v

Run with HTML report
python -m pytest tests/ui_tests.py -v --html=report.html --self-contained-html

Run headless (for CI)
HEADLESS=true python -m pytest tests/ui_tests.py -v


### Test Coverage
- **API Tests**: Authentication, CRUD operations, error handling
- **UI Tests**: Login flows, task management, form interactions
- **Integration Tests**: Frontend-backend communication


GitHub Actions automatically:
1. **Runs Tests**: API + UI tests on every push
2. **Generates Reports**: Coverage and test results
3. **Deploys**: Auto-deploy on main branch

## 📊 Demo Credentials

- **Username**: `admin` | **Password**: `password`
- **Username**: `user` | **Password**: `password`

## 🔧 Development Commands

Backend
npm start # Production server
npm run dev # Development with nodemon
npm test # Run tests
npm run test:coverage # Tests with coverage

Frontend
npm start # Development server
npm run build # Production build
npm test # Run React tests

Testing
python -m pytest tests/ -v # All UI tests
python -m pytest tests/ui_tests.py::TestClass::test_method -v # Specific test


