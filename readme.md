# Socomec email sender for LocalView

I faced issues with sending emails using the LocalView software from Socomec. 
The LocalView was not able to send emails using the SMTP server of my ISP so I decided to write this simple script which is running in background and watching changes of Socomes log files.

This script is just addon to LocalView service and it is not a replacement for it.

## Features

1. Sending emails about action events recorder by LocalView
2. Sending daily email reports containg all events and measurements from the log

## Installation

1. Ensure Node.js is installed on your system (https://nodejs.org/en/download/)
2. Download the script and put it to the Program Files folder
3. Copy the .env.example file to .env and edit it to enter your SMTP server details and other settings defined there
4. Run ```npm install``` to install all dependencies
5. In order to run script in background please install PM2 (https://pm2.keymetrics.io/docs/usage/quick-start/)
6. For Windows we need additional package to run PM2 as a service (https://github.com/marklagendijk/node-pm2-windows-startup)
7. Run ```pm2 start index.js --name socomec-mailer``` to start the script
8. Run ```pm2 save``` to enable the script to run on system startup