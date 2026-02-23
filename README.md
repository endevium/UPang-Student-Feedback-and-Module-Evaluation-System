# UPang Student Feedback and Module Evaluation System

> A secure, intelligent platform for student feedback using AI Sentiment Analysis and Blockchain Integrity.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]() [![Build](https://img.shields.io/badge/build-passing-brightgreen)]()

## Table of Contents
- [Description](#description)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment](#environment)
- [Database](#database)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Architecture](#architecture)
- [Security & Privacy](#security--privacy)
- [Contribution](#contribution)
- [License & Contact](#license--contact)

## Description
The UPang Student Feedback and Module Evaluation System centralizes anonymous student feedback, ensures integrity with a private blockchain (stores feedback hashes), and applies NLP-based sentiment analysis to provide actionable insights.

## Key Features
- Anonymous feedback submission
- AI Sentiment Analysis (positive / neutral / negative)
- Role-based dashboards: Students, Faculty, Admins
- Data visualization and reports
- Blockchain-backed tamper evidence

## Tech Stack
- Frontend: React
- Backend: Django (Python)
- Database: PostgreSQL
- Auth: JWT
- Extras: Private blockchain for integrity, NLP pipeline (sentiment model)

## Prerequisites
- Node.js v14+
- Python 3.8+
- PostgreSQL
- (Optional) Docker & docker-compose

## Quick Start
Clone:
```bash
git clone https://github.com/<your-username>/upang-feedback-system.git
cd upang-feedback-system
```

## Environment
Create a `.env` (backend) with at minimum:
- DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
- SECRET_KEY=your_django_secret
- JWT_SECRET=your_jwt_secret
- BLOCKCHAIN_NODE_URL=http://localhost:8545
- NLP_MODEL_PATH=/path/to/model

## Database
Create DB and run migrations:
```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata initial_data.json  # optional
```

## Running the App
Backend (Django):
```bash
# activate venv, then
python manage.py runserver
```

Frontend (React):
```bash
cd frontend
npm install
npm start
```

Docker (alternative):
```bash
docker-compose up --build
```

## Testing
Run backend tests:
```bash
python manage.py test
```
Run frontend tests:
```bash
cd frontend
npm test
```

## Architecture
- Django REST API serving endpoints for feedback, users, reports
- React frontend consumes REST + charts
- Private blockchain records feedback hashes for tamper-evidence
- NLP pipeline (built-in or external) performs sentiment analysis on submissions

<p align="center">
  <img src="frontend_vite/upang-sfme/src/assets/architecture_diagram.png" alt="System Architecture Diagram" width="800">
</p>

## Security & Privacy
- RBAC for all endpoints
- Student submissions anonymized before storage
- Blockchain stores hashes only (no raw PII)
- Use HTTPS and secure JWT signing in production

