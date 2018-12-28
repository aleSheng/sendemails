'use strict'
const settings = require('./settings');
const usersFilePath= settings.usersFilePath;
const emailhtmlPath = settings.emailFilePath;
const title = settings.emailTitle;
const csv = require('csvtojson');
const fs = require('fs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password
    }
});

const sender = (email, title, body) => new Promise((resolve, reject) => {
    transporter.sendMail({
        from: settings.mail_from,
        to: email,
        subject: title,
        html: body
    }, (error, info) => {
        if (error) {
            return reject(`sending mail failed for ${email}: ${error}`)
        }
        resolve(null)
    });
})


const getUsers = async ()=>{
    try{
        return await csv().fromFile(usersFilePath);
    }catch(e){
        console.error(e)
        return []
    }
}

const getEmailHtml = async ()=>{
    const data = fs.readFileSync(emailhtmlPath);
    return data.toString();

}

const main = async ()=>{
    try{
        const emailBody = await getEmailHtml();
        const users = await getUsers();
        for(let user of users){
            let body = emailBody.replace('[name]', `${user.firstname} ${user.lastname}`)
            sender(user.email, title, body).catch(e => console.error(e))
        }
    }catch(e){
        console.error(e)
    }
}

main()