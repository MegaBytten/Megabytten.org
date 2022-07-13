from email.message import EmailMessage
import ssl
import smtplib
import sys

require("dotenv").config();

email_sender = process.env.emailBotSender
email_pswd = process.env.emailBotPass
email_receiver = sys.argv[1]

subject = 'EUTRCApp Verification'
body = """
Do Not reply to this email!

Welcome to the new EUTRC App! All of the upcoming Exeter Touch Rugby trainings, matches and socials,
along with attendance and player stats in one place!\n\nUse the verification code below to verify your email in the app!\n [Verif]
"""
em = EmailMessage()
em['From'] = email_sender
em['To'] = email_receiver
em['Subject'] = subject
em.set_content(body)

# used for encryption
context = ssl.create_default_context()

#sending email
with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
    smtp.login(email_sender, email_pswd)
    smtp.sendmail(email_sender, email_receiver, em.as_string())
