from sqlalchemy import Column, Integer, String, Float, Date
from .database import Base


class DepositDB(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, index=True)

    certificate_no = Column(String, unique=True, nullable=False)
    bank = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    maturity_date = Column(Date, nullable=False)
    maturity_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="ACTIVE")
    reminder_count = Column(Integer, nullable=False, default=0)

    last_reminder_date = Column(Date, nullable=True)
    email = Column(String, nullable=False)

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    hashed_password = Column(
        String,
        nullable=False
    )