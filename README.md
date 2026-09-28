# Bank Deposit Reminder & Management System

A Python-based application for managing bank deposits, tracking maturity dates, and sending automated email reminders.

## Features

- User registration and JWT-based login
- Create, view, update, and delete deposits
- Track deposit maturity dates and status
- Manual and automatic email reminders
- Daily reminder processing using APScheduler
- HTML email templates using Jinja2
- PostgreSQL database with SQLAlchemy ORM
- REST APIs using FastAPI
- Docker and Docker Compose support
- Simple HTML/CSS/JavaScript frontend

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL

**Authentication:** JWT, Passlib, bcrypt

**Email:** SMTP, Jinja2

**Frontend:** HTML, CSS, JavaScript

**DevOps:** Docker, Docker Compose, Git, GitHub

## Project Structure

```text
bank_deposit_reminder_api/
├── app/
│   ├── routes/
│   ├── email_templates/
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth_utils.py
│   ├── email_service.py
│   └── main.py
│
├── frontend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md

## Reminder Logic

The application sends reminders:

- 3 days before maturity
- 2 days before maturity
- 1 day before maturity
- On the maturity date
- Daily after maturity while the deposit remains `ACTIVE`

Once a deposit is marked `COLLECTED`, reminders stop.

## API Endpoints
### Authentication
POST /auth/register
POST /auth/login
Deposits
POST   /deposits
GET    /deposits
PATCH  /deposits/{certificate_no}
DELETE /deposits/{certificate_no}
Reminders
POST /deposits/{certificate_no}/remind
POST /deposits/process-reminders
Collection
PATCH /deposits/{certificate_no}/collected
Run Locally
Install dependencies:
pip install -r requirements.txt
Start the FastAPI application:
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
Open Swagger API documentation:
http://127.0.0.1:8001/docs
Start the frontend in another terminal:
cd frontend
python -m http.server 5500
Open:
http://localhost:5500/index.html
Run with Docker
Build and start the application:
docker compose up --build
Stop the application:
docker compose down
Security
Sensitive configuration such as database credentials, email credentials, and JWT secrets are stored in .env.

The .env file is excluded from Git using .gitignore.

Author
Priyanka Rao
Software Engineer | Python & System Automation