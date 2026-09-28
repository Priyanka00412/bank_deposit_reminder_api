import os
import smtplib

from pathlib import Path
from dotenv import load_dotenv
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader


env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)


EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


# ==============================
# EMAIL TEMPLATE SETUP
# ==============================

template_folder = (
    Path(__file__).resolve().parent
    / "email_templates"
)


jinja_env = Environment(
    loader=FileSystemLoader(
        template_folder
    )
)


def create_deposit_reminder_email(
    bank,
    certificate_no,
    amount,
    interest_rate,
    maturity_date,
    maturity_amount,
    status,
    reminder_message
):

    template = jinja_env.get_template(
        "deposit_reminder.html"
    )

    html_body = template.render(
        bank=bank,
        certificate_no=certificate_no,
        amount=f"{amount:,.2f}",
        interest_rate=interest_rate,
        maturity_date=maturity_date,
        maturity_amount=f"{maturity_amount:,.2f}",
        status=status,
        reminder_message=reminder_message
    )

    return html_body


def send_email(
    recipient_email,
    subject,
    body
):

    try:

        message = MIMEText(
            body,
            "html"
        )

        message["Subject"] = subject
        message["From"] = EMAIL_SENDER
        message["To"] = recipient_email

        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465
        ) as server:

            server.login(
                EMAIL_SENDER,
                EMAIL_APP_PASSWORD
            )

            server.sendmail(
                EMAIL_SENDER,
                recipient_email,
                message.as_string()
            )

        return True

    except Exception as e:

        print(
            "Email error:",
            e
        )

        return False