import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv


load_dotenv()


def send_email(
    receiver_email: str,
    subject: str,
    body: str
):

    sender_email = os.getenv("EMAIL_SENDER")
    app_password = os.getenv("EMAIL_APP_PASSWORD")

    print("================================")
    print("SENDER:", sender_email)
    print("RECEIVER:", receiver_email)
    print("SUBJECT:", subject)
    print("================================")

    message = EmailMessage()

    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    message.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:

        smtp.login(
            sender_email,
            app_password
        )

        smtp.send_message(message)