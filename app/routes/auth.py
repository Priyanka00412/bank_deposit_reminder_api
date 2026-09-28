from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from ..database import get_db
from ..models import UserDB

import os
from pathlib import Path
from dotenv import load_dotenv


# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


# Create authentication router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# JWT settings
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "my-super-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


# -------------------------
# Hash password
# -------------------------

def hash_password(password: str):
    return pwd_context.hash(password)


# -------------------------
# Verify password
# -------------------------

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# -------------------------
# Create JWT token
# -------------------------

def create_access_token(username: str):

    payload = {
        "sub": username
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# -------------------------
# Register
# -------------------------

@router.post("/register")
def register(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(UserDB).filter(
        UserDB.username == username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = hash_password(password)

    new_user = UserDB(
        username=username,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "username": new_user.username
    }


# -------------------------
# Login
# -------------------------

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(UserDB).filter(
        UserDB.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    password_correct = verify_password(
        form_data.password,
        user.hashed_password
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        user.username
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }