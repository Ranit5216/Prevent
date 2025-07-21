const forgotPasswordTemplate = ({ name, otp }) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p>Dear ${name},</p>
        
        <p>We received a request to reset your password. Please use the following OTP code to proceed with resetting your password:</p>
        
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${otp}
        </div>
        
        <p style="color: #e74c3c; font-weight: bold;">This OTP is valid for 1 hour only.</p>
        
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">Best regards,<br>The PreEvent Team</p>
        </div>
    </div>
</body>
</html>
    `
}

export default forgotPasswordTemplate