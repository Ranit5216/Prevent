const verifyEmailTemplate = ({name, url, otp}) => {
    if (otp) {
        return `
<p>Dear ${name},</p>
<p>Thank you for registering with Prevent.</p>
<p>Your OTP for email verification is:</p>
<h2>${otp}</h2>
<p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
`;
    }
    return `
<p>Dear ${name}</p>
<p>Thank you registering Prevent.</p>
<a href=${url} style="color:white;background:#071263;margin-top:10px;padding:20px">Verify Email</a>
`;
}

export default verifyEmailTemplate