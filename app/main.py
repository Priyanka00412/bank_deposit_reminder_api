from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from .routes.deposits import router as deposit_router
from .routes.deposits import process_reminders
from .routes import auth
from .database import SessionLocal


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Bank Deposit Reminder API is running"
    }


app.include_router(deposit_router)
app.include_router(auth.router)

def run_reminder_job():

    print("Automatic reminder job started.", flush=True)
    db = SessionLocal()

    try:
        process_reminders(db)

    finally:
        db.close()

    print("Automatic reminder job finished.",flush=True)

scheduler = BackgroundScheduler()

scheduler.add_job(
    run_reminder_job,
    "interval",
    days=1
)

scheduler.start()