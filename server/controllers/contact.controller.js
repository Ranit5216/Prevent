import sendEmail from '../config/sendEmail.js'
import logger from '../utils/logger.js'

export async function contactFormController(request, response) {
    try {
        const { name, email, subject, message } = request.body

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return response.status(400).json({
                message: "Please provide all required fields: name, email, subject, and message",
                error: true,
                success: false
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return response.status(400).json({
                message: "Please provide a valid email address",
                error: true,
                success: false
            })
        }

        // Admin email where contact form submissions will be received
        const adminEmail = "tradeoxford123@gmail.com"

        // Create professional email HTML
        const emailSubject = `📧 New Contact Form Submission: ${subject}`
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #DC2626, #991B1B); color: #fff; padding: 20px 30px;">
                    <h1 style="margin: 0; font-size: 1.7rem;">New Contact Form Submission</h1>
                </div>
                <div style="padding: 24px 30px; background: #fafbfc;">
                    <h2 style="margin-top: 0; color: #333;">You have received a new message from PreEvent Contact Form</h2>
                    
                    <div style="background: #fff; border: 1px solid #eaeaea; border-radius: 4px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">Name:</td>
                                <td style="padding: 8px 0; color: #666;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                                <td style="padding: 8px 0; color: #666;">
                                    <a href="mailto:${email}" style="color: #DC2626; text-decoration: none;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
                                <td style="padding: 8px 0; color: #666;">${subject}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
                                <td style="padding: 8px 0; color: #666; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 16px; margin: 16px 0;">
                        <h4 style="margin: 0 0 8px 0; color: #0066cc;">📧 Reply to this inquiry</h4>
                        <p style="margin: 0; color: #333;">You can reply directly to: <a href="mailto:${email}" style="color: #DC2626; font-weight: bold; text-decoration: none;">${email}</a></p>
                    </div>
                    
                    <div style="margin-top: 24px;">
                        <a href="https://preevent.in" style="display: inline-block; background: #DC2626; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">Visit PreEvent Dashboard</a>
                    </div>
                </div>
                <div style="background: #f1f1f1; color: #888; text-align: center; padding: 14px 0; font-size: 0.95rem;">
                    This is an automated notification from PreEvent Contact Form. Please do not reply to this email.
                </div>
            </div>
        `

        // Send email to admin
        await sendEmail({
            sendTo: adminEmail,
            subject: emailSubject,
            html: emailHtml
        })

        // Send confirmation email to user
        const userEmailSubject = `✅ Thank you for contacting PreEvent - We'll get back to you soon!`
        const userEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #DC2626, #991B1B); color: #fff; padding: 20px 30px;">
                    <h1 style="margin: 0; font-size: 1.7rem;">Thank You for Contacting Us!</h1>
                </div>
                <div style="padding: 24px 30px; background: #fafbfc;">
                    <h2 style="margin-top: 0; color: #333;">Hello ${name},</h2>
                    <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
                        Thank you for reaching out to PreEvent! We have received your message and our support team will get back to you within 24-48 hours.
                    </p>
                    
                    <div style="background: #fff; border: 1px solid #eaeaea; border-radius: 4px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333; font-size: 1.1rem;">Your Inquiry Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 100px;">Subject:</td>
                                <td style="padding: 8px 0; color: #666;">${subject}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
                                <td style="padding: 8px 0; color: #666; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 16px; margin: 16px 0;">
                        <h4 style="margin: 0 0 8px 0; color: #0066cc;">💬 Need Immediate Assistance?</h4>
                        <p style="margin: 0; color: #333; line-height: 1.6;">
                            For urgent matters, you can also reach us through our live chat support available 24/7 on our website.
                        </p>
                    </div>
                    
                    <div style="margin-top: 24px;">
                        <a href="https://preevent.in/support" style="display: inline-block; background: #DC2626; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">Visit Support Center</a>
                    </div>
                </div>
                <div style="background: #f1f1f1; color: #888; text-align: center; padding: 14px 0; font-size: 0.95rem;">
                    This is an automated confirmation email from PreEvent. Please do not reply to this email.
                </div>
            </div>
        `

        try {
            await sendEmail({
                sendTo: email,
                subject: userEmailSubject,
                html: userEmailHtml
            })
        } catch (userEmailError) {
            console.error('Failed to send confirmation email to user:', userEmailError)
            // Don't fail the request if user email fails
        }

        return response.json({
            message: "Your message has been sent successfully! We'll get back to you soon.",
            error: false,
            success: true
        })

    } catch (error) {
        logger.error("Contact form error:", error)
        return response.status(500).json({
            message: error.message || "Failed to send message. Please try again later.",
            error: true,
            success: false
        })
    }
}

