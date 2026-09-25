from fastapi import FastAPI
from .routes.deposits import router as deposit_router


app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Bank Deposit Reminder API is running"
    }


app.include_router(deposit_router)