require('dotenv').config();
var nodemailer = require('nodemailer');
const schedule = require('node-schedule');
var watch = require('node-watch');
const fs = require('fs');
const csv = require('@fast-csv/parse');


if (process.env.SEND_DAILY_REPORT === 'true') {
    console.log('Daily report will be sent at ' + process.env.DAILY_REPORT_HOUR);
    //Schedule to send email every day
    var j = schedule.scheduleJob('0 ' + process.env.DAILY_REPORT_HOUR + ' * * *', function () {

        sendEmail('Daily report', 'UPS reports attached', true);

    });
}

//Watch for changes in events log file
console.log('Watching for changes in ' + process.env.EVENTS_FILE_LOG_PATH);
watch(process.env.EVENTS_FILE_LOG_PATH, {recursive: true, delay: 500}, function (evt, name) {
    console.log('%s changed.', name);
    console.log('Checking file...' + evt);
    if (evt === 'update') {
        // on create or modify
        checkFile();
    }
});


function checkFile() {
    let rows = [];

    fs.createReadStream(process.env.EVENTS_FILE_LOG_PATH)
        .pipe(csv.parse({
            headers: ['Time', 'Event', 'Status', 'AS'],
            renameHeaders: true,
            delimiter: ';',
            maxRows: 10,
            trim: true
        }))
        .on('error', error => console.error(error))
        .on('data', row => rows.push(row))
        .on('end', rowCount => {
            console.log(`Parsed ${rowCount} rows`)
            if (rows.length > 0) {
                if (rows[0].AS === 'A') {
                    //foreach row
                    let m = '';
                    rows.forEach(function (row) {
                        m = m + row.Time + ' - ' + row.Event + ' - ' + row.Status + ' - ' + row.AS + '<br>';
                    });
                    sendEmail('New event', m, false);
                }

            }
        });

}

//Function to send email
function sendEmail(subject, message, attachFiles = false) {
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: {address: process.env.MAIL_FROM_ADDRESS, name: process.env.MAIL_FROM_NAME},
        to: process.env.MAIL_TO_ADDRESSES,
        subject: process.env.MAIL_FROM_NAME + ' - ' + subject,
        html: message
    };

    //Attach files if attachFiles is true
    if (attachFiles === true) {
        mailOptions.attachments = [
            {
                filename: 'EventsLog.csv',
                path: process.env.EVENTS_FILE_LOG_PATH
            },
            {
                filename: 'MeasLog.csv',
                path: process.env.MESSAGES_FILE_LOG_PATH
            }
        ];
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}