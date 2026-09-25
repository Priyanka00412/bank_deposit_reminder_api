from pydantic import BaseModel, EmailStr
from datetime import date


class Deposit(BaseModel):
    bank: str
    certificate_no: str
    amount: float
    interest_rate: float
    maturity_date: date
    maturity_amount: float
    email: EmailStr


class DepositUpdate(BaseModel):
    bank: str | None = None
    amount: float | None = None
    interest_rate: float | None = None
    maturity_date: date | None = None
    maturity_amount: float | None = None
    email: EmailStr | None = None