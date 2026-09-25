from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from ..database import get_db
from ..models import DepositDB
from ..schemas import Deposit, DepositUpdate
from ..email_service import send_email


router = APIRouter(
    prefix="/deposits",
    tags=["Deposits"]
)


# -------------------------
# Process automatic reminders
# -------------------------

@router.post("/process-reminders")
def process_reminders(
    db: Session = Depends(get_db)
):

    today = date.today()

    deposits = db.query(DepositDB).all()

    reminders_sent = []

    for deposit in deposits:

        if deposit.status == "COLLECTED":
            continue

        days_until_maturity = (
            deposit.maturity_date - today
        ).days

        reminder_required = False
        reminder_message = ""

        if days_until_maturity == 3:

            reminder_required = True
            reminder_message = "Deposit matures in 3 days."

        elif days_until_maturity == 2:

            reminder_required = True
            reminder_message = "Deposit matures in 2 days."

        elif days_until_maturity == 1:

            reminder_required = True
            reminder_message = "Deposit matures tomorrow."

        elif days_until_maturity == 0:

            reminder_required = True
            reminder_message = (
                "Deposit matures today. "
                "Please check and collect the deposit."
            )

        elif days_until_maturity < 0:

            reminder_required = True
            reminder_message = (
                "Deposit has matured and is still ACTIVE. "
                "Please collect the deposit."
            )

        if not reminder_required:
            continue

        if deposit.last_reminder_date == today:
            continue

        subject = "Bank Deposit Maturity Reminder"

        body = f"""
Hello,

This is a reminder about your bank deposit.

Bank: {deposit.bank}
Certificate Number: {deposit.certificate_no}
Amount: {deposit.amount}
Interest Rate: {deposit.interest_rate}%
Maturity Date: {deposit.maturity_date}
Maturity Amount: {deposit.maturity_amount}

{reminder_message}

Please take the necessary action.

Thank you.
Bank Deposit Reminder System
"""

        email_sent = send_email(
            deposit.email,
            subject,
            body
        )

        if not email_sent:
            continue

        deposit.reminder_count += 1
        deposit.last_reminder_date = today

        reminders_sent.append({
            "certificate_no": deposit.certificate_no,
            "bank": deposit.bank,
            "maturity_date": deposit.maturity_date,
            "days_until_maturity": days_until_maturity,
            "reminder_count": deposit.reminder_count,
            "message": reminder_message
        })

    db.commit()

    return {
        "message": "Reminder processing completed",
        "date": today,
        "reminders_sent": len(reminders_sent),
        "reminders": reminders_sent
    }


# -------------------------
# Create deposit
# -------------------------

@router.post("")
def create_deposit(
    deposit: Deposit,
    db: Session = Depends(get_db)
):

    existing_deposit = db.query(DepositDB).filter(
        DepositDB.certificate_no == deposit.certificate_no
    ).first()

    if existing_deposit:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Certificate number already exists"
        )

    new_deposit = DepositDB(
        bank=deposit.bank,
        certificate_no=deposit.certificate_no,
        amount=deposit.amount,
        interest_rate=deposit.interest_rate,
        maturity_date=deposit.maturity_date,
        maturity_amount=deposit.maturity_amount,
        email=deposit.email
    )

    db.add(new_deposit)
    db.commit()
    db.refresh(new_deposit)

    return {
        "message": "Deposit saved successfully",
        "deposit": new_deposit
    }


# -------------------------
# Get all deposits
# -------------------------

@router.get("")
def get_deposits(
    db: Session = Depends(get_db)
):

    return db.query(DepositDB).all()


# -------------------------
# Delete deposit
# -------------------------

@router.delete("/{certificate_no}")
def delete_deposit(
    certificate_no: str,
    db: Session = Depends(get_db)
):

    deposit = db.query(DepositDB).filter(
        DepositDB.certificate_no == certificate_no
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deposit with certificate number '{certificate_no}' not found"
        )

    db.delete(deposit)
    db.commit()

    return {
        "message": "Deposit deleted successfully",
        "certificate_no": certificate_no
    }


# -------------------------
# Update deposit
# -------------------------

@router.patch("/{certificate_no}")
def update_deposit(
    certificate_no: str,
    update: DepositUpdate,
    db: Session = Depends(get_db)
):

    deposit = db.query(DepositDB).filter(
        DepositDB.certificate_no == certificate_no
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deposit with certificate number '{certificate_no}' not found"
        )

    if update.bank is not None:
        deposit.bank = update.bank

    if update.amount is not None:
        deposit.amount = update.amount

    if update.interest_rate is not None:
        deposit.interest_rate = update.interest_rate

    if update.maturity_date is not None:
        deposit.maturity_date = update.maturity_date

    if update.maturity_amount is not None:
        deposit.maturity_amount = update.maturity_amount

    if update.email is not None:
        deposit.email = update.email

    db.commit()
    db.refresh(deposit)

    return {
        "message": "Deposit updated successfully",
        "deposit": deposit
    }


# -------------------------
# Manual reminder
# -------------------------

@router.post("/{certificate_no}/remind")
def send_reminder(
    certificate_no: str,
    db: Session = Depends(get_db)
):

    deposit = db.query(DepositDB).filter(
        DepositDB.certificate_no == certificate_no
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deposit with certificate number '{certificate_no}' not found"
        )

    if deposit.status == "COLLECTED":
        return {
            "message": "Deposit already collected. No reminder needed.",
            "certificate_no": certificate_no
        }

    subject = "Bank Deposit Maturity Reminder"

    body = f"""
Hello,

This is a reminder about your bank deposit.

Bank: {deposit.bank}
Certificate Number: {deposit.certificate_no}
Amount: {deposit.amount}
Interest Rate: {deposit.interest_rate}%
Maturity Date: {deposit.maturity_date}
Maturity Amount: {deposit.maturity_amount}

Please check your deposit and take the necessary action.

Thank you.
Bank Deposit Reminder System
"""

    email_sent = send_email(
        deposit.email,
        subject,
        body
    )

    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send reminder email"
        )

    deposit.reminder_count += 1
    deposit.last_reminder_date = date.today()

    db.commit()
    db.refresh(deposit)

    return {
        "message": "Reminder email sent successfully",
        "certificate_no": deposit.certificate_no,
        "email": deposit.email,
        "reminder_count": deposit.reminder_count,
        "last_reminder_date": deposit.last_reminder_date
    }


# -------------------------
# Mark deposit as collected
# -------------------------

@router.patch("/{certificate_no}/collected")
def mark_collected(
    certificate_no: str,
    db: Session = Depends(get_db)
):

    deposit = db.query(DepositDB).filter(
        DepositDB.certificate_no == certificate_no
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deposit with certificate number '{certificate_no}' not found"
        )

    deposit.status = "COLLECTED"

    db.commit()
    db.refresh(deposit)

    return {
        "message": "Deposit marked as collected",
        "certificate_no": certificate_no,
        "status": deposit.status
    }