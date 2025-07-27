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

