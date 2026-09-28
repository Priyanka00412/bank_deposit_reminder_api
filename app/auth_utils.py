import os

from pathlib import Path
from dotenv import load_dotenv

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError


# Load .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)


# JWT settings
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "my-super-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


# Get Bearer token from request
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# Check JWT token
def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return username

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )