from email.message import EmailMessage
import ssl
import smtplib
import sys

# To send data back to node just do the following in the python script:
#
# print(dataToSendBack)
# sys.stdout.flush()
# And then node can listen for data using:
#
# pythonProcess.stdout.on('data', (data) => {
#     // Do something with the data returned from python script
# });
# Since this allows multiple arguments to be passed to a script using spawn,
# you can restructure a python script so that one of the arguments decides
# which function to call, and the other argument gets passed to that function, etc.

email_sender = sys.argv[1]
email_pswd = sys.argv[2]
email_receiver = sys.argv[3]

# TODO: Generate new random verification code
def generate_verif_code():
  #f string or arraylist
  for (0, 20){
    # google for best way to add random char (only internal lib)
  }

# pre-written default message
greeting = 'Do Not reply to this email!'
main = '\n\nWelcome to the new EUTRC App! All of the upcoming Exeter Touch Rugby trainings, matches and socials, along with attendance and player stats in one place!'
instruction = '\nUse the verification code below to verify your email in the app!'
# verfcode here!
warning = '\n\nFor any issues or bugs please report them (with screenshots/logs) to omegabytten@gmail.com'
signoff = 'Thanks and see you on the pitches!\nYour EUTRC team!'

# concatenate email
subject = 'EUTRCApp Verification'
body = greeting + main + instruction + verfCode + warning + signoff


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
