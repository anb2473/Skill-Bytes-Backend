import { Resend } from 'resend'
import logger from './logger.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async (recipients, subject, html) => {
    const {data, err} = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: recipients,
        subject: subject,
        html: html
    })

    if (err) {
        return logger.error('Error in sending email', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        })
    }

    return data
}

export default sendEmail