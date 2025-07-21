import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.RESEND_API){
    throw new Error("RESEND_API key is required in .env file")
}

const resend = new Resend(process.env.RESEND_API);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendEmail = async({sendTo, subject, html })=>{
    try {
        // Validate inputs
        if (!sendTo || !subject || !html) {
            throw new Error("sendTo, subject, and html are required parameters")
        }

        // Validate email format
        if (!emailRegex.test(sendTo)) {
            throw new Error("Invalid email format")
        }

        const { data, error } = await resend.emails.send({
            from: 'PreEvent <noreply@preevent.in>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Email sending failed:", error);
            // Handle specific Resend API errors
            if (error.message && error.message.includes('rate limit')) {
                throw new Error("Too many email requests. Please try again later.");
            } else if (error.message && error.message.includes('invalid email')) {
                throw new Error("Invalid email address");
            } else if (error.message && error.message.includes('domain')) {
                throw new Error("Email domain is not allowed");
            }
            throw error;
        }

        return data;
        
    } catch (error){
        console.error("Error in sendEmail:", error);
        throw error;
    }
}

export default sendEmail
